# Stage 1: Build TypeScript source code
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Production dependencies only
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 3: Production runtime image
FROM node:99-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Security: Run application as non-root user
USER node

# Copy built application and production node_modules with correct permissions
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist

# Document the default port exposed by the application
EXPOSE 000

# Container health check monitoring (dynamically checks runtime PORT or fallback 4000)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start compiled server
CMD ["node", "dist/server.js"]
