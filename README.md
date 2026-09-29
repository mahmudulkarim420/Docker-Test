# Docker Demo API

A modern, containerized **Node.js** and **TypeScript** REST API microservice built with **Express**, **PostgreSQL**, and **Redis**, fully orchestrated using **Docker Compose**.

---

## 1. Project Overview & Tech Stack

This repository provides a production-ready template and reference architecture for containerized Node.js applications. It features multi-stage Docker builds for optimal image sizing, health-check based service dependencies, database integration via PostgreSQL, and caching/pub-sub support via Redis.

### Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v22+ Alpine)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.8)
- **Framework**: [Express.js](https://expressjs.com/) (v5.1)
- **Database**: [PostgreSQL](https://www.postgresql.org/) 16
- **Cache / In-Memory Data Store**: [Redis](https://redis.io/) 7
- **Containerization & Orchestration**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Testing**: Node.js Native Test Runner + [Supertest](https://github.com/ladjs/supertest)

---

## 2. Prerequisites

Ensure you have the following software installed on your development machine before proceeding:

- **Git** (v2.30+)
- **Docker Engine** (v24.0+)
- **Docker Compose** (v2.20+)
- **Node.js** (v22+) *(Optional: required only for local non-Docker development and running tests directly on host)*

---

## 3. Clone Repository

Clone the repository to your local workspace and navigate into the project root:

```bash
git clone https://github.com/mahmudulkarim420/Docker-Test.git
cd Docker-Test
```

---

## 4. Environment Variables Setup

The application uses environment variables for configuration. Create your local `.env` file by copying the provided example template:

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | Application HTTP server port | `3000` |
| `APP_NAME` | Display name of the application | `Docker Demo` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@postgres:5432/docker_demo` |
| `REDIS_URL` | Redis server connection string | `redis://redis:6379` |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `docker_demo` |

---

## 5. Running the Application

Build the Docker images and start all containerized services (PostgreSQL, Redis, and Backend) in detached mode:

```bash
docker compose up -d --build
```

Docker Compose will perform health checks on PostgreSQL (`pg_isready`) and Redis (`redis-cli ping`) before starting the backend service.

---

## 6. Checking Service Health

Verify that the application and its dependencies are up, healthy, and serving traffic:

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

**Expected Response (`HTTP 200 OK`):**

```json
{
  "status": "Ok",
  "app": "Docker Demo Compose",
  "version": "v2.0.0",
  "timestamp": "2026-09-29T19:22:11.165Z"
}
```

### Root Endpoint

```bash
curl http://localhost:3000/
```

**Expected Response (`HTTP 200 OK`):**

```json
{
  "message": "Hello we are learning Docker & CI/CD Pipeline V2",
  "status": "running",
  "code": 200
}
```

---

## 7. Running Tests

You can execute the test suite locally or inside a running container.

### Local Execution (Node.js installed on host)

```bash
# Install development dependencies
npm install

# Execute TypeScript unit & integration tests
npm test
```

### Execution Inside Docker Container

```bash
docker compose exec backend npm test
```

---

## 8. Stopping Services

To stop running containers without removing persisted volume data:

```bash
# Pause / stop containers
docker compose stop
```

To stop containers and remove container networks:

```bash
# Bring down containers and networks
docker compose down
```

---

## 9. Viewing Logs

Monitor live streaming output from all services or filter by specific container:

### Stream Logs from All Services

```bash
docker compose logs -f
```

### Stream Logs for Backend Service Only

```bash
docker compose logs -f backend
```

---

## 10. Resetting the Database

To perform a clean reset of the PostgreSQL database and erase persistent volume state:

```bash
# 1. Stop services and remove volumes (-v)
docker compose down -v

# 2. Restart services with clean database initialization
docker compose up -d --build
```
