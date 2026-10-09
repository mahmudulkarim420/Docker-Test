# CI/CD Release & Deployment Strategy

This document outlines the Continuous Integration (CI) and Continuous Deployment (CD) workflows for the Docker Demo project.

## 1. Final CI Workflow (`ci.yml`)
The CI workflow ensures code quality and validates the exact Docker image before deployment. It runs on `push` and `pull_request` to `main`, `develop`, and `features` branches.

### Quality Gates:
- **Test & Lint**: Installs dependencies (with NPM caching), runs TypeScript type-checking, ESLint, and Supertest-based unit/integration tests.
- **Docker Build & Smoke Test**:
  - Builds the `docker-demo:test` image.
  - Scans the exact built image for vulnerabilities using Trivy.
  - Starts a local Docker Compose environment using the **prebuilt** `docker-demo:test` image (no source rebuilds).
  - Verifies the application's `/health` and `/ready` endpoints against the running container.

## 2. Release and Deployment Triggers (`cd.yml`)
The CD workflow builds the production image, publishes it to GitHub Container Registry (GHCR), and triggers deployment to Render. It strictly waits for CI to succeed before executing.

### Triggers:
- **Version Tags**: Pushing a tag like `v1.2.3` will first trigger the CI workflow. When CI concludes successfully, the CD workflow is triggered automatically via `workflow_run`.
- **Main Branch Push**: When the CI workflow completes successfully on the `main` branch, the CD workflow is triggered automatically via `workflow_run`.

### Concurrency and Security:
- Concurrency control ensures only one production deployment runs at a time.
- The pipeline explicitly verifies that `workflow_run` events originate from the same repository and were triggered by a `push` event, preventing malicious pull requests from accessing production credentials.
- The exact commit that passed CI (`workflow_run.head_sha`) is checked out and built.

## 3. GHCR Tag Conventions
When a build is pushed to GHCR, the following tags are generated:
- **SHA Tag**: `sha-<long-commit-hash>` (Immutable, used for exact traceability).
- **SemVer Tag**: `v1.2.3` (If triggered by a tag push).
- **Latest Tag**: `latest` (Only updated if the commit was on the `main` branch).

## 4. Required GitHub Secrets and Variables
You must configure the following **Secrets** in your GitHub repository settings:
- `RENDER_API_KEY`: Your Render account or workspace API key.
- `RENDER_SERVICE_ID`: The unique ID of the specific Render Web Service (e.g., `srv-xxxxxxxxxxxxxxxxxxxx`).
- `PROD_HEALTH_URL`: The public URL of your Render service's health endpoint (e.g., `https://my-app.onrender.com/health`). Used to strictly verify the deployed identity.

*(Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions for GHCR authentication).*

## 5. Required Render Settings and API Integration
- The Render Web Service must be configured as an image-backed service (Deploying from a registry).
- **API Integration**: The deployment is strictly deterministic. The pipeline uses the Render REST API (`POST /v1/services/{serviceId}/deploys`) to force Render to pull and deploy the exact `sha-<commit>` image built by GitHub Actions.
- **Auto-Deploy**: The "Auto-Deploy" setting on Render **must be disabled**, as GitHub Actions fully orchestrates the deployment lifecycle and image selection.

## 6. Deployment Verification Behavior
The CD workflow performs a two-stage verification:
1. **API Polling**: It polls the Render REST API for the deployment's status until it reaches `live` or `success`.
2. **Identity Verification**: It polls the application's `PROD_HEALTH_URL` and parses the JSON response to ensure the `"commit"` field precisely matches the exact `COMMIT_SHA` of the CI-verified code.
- If both checks succeed, the deployment is marked verified and successful.
- If the `PROD_HEALTH_URL` secret is not set, the workflow will trigger the webhook but skip verification.

## 7. Timeout and Failure Behavior
- If a CI job fails, the pipeline halts immediately, and the `workflow_run` event will not trigger the CD pipeline.
- If the deployment verification polling times out (after 5 minutes of unreachable or failing health checks), the CD workflow will fail, alerting you to a potential deployment issue.

## 8. Manual Rollback Steps
There is no automated rollback configured in the pipeline. If a bad release is deployed, follow these steps to roll back:
1. Go to your Render Dashboard.
2. Select your Web Service.
3. Go to the **Events** or **Deploys** tab.
4. Find the previous successful deployment in the list.
5. Click **Rollback to this deploy** (or manually trigger a deploy of the previous image SHA if Render is configured to use specific tags).
6. Monitor the service until it becomes healthy again.

## 9. Remaining Limitations
- **Rollback Safety**: If the bad release included irreversible database migrations, a simple container rollback might cause application errors. You must ensure backward compatibility of database schema changes.
