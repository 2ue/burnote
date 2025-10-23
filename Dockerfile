# Stage 1: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install build dependencies including OpenSSL and tools for native modules
RUN apk add --no-cache openssl openssl-dev python3 make g++

# Install pnpm
RUN npm install -g pnpm@10.18.2

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm config set enable-pre-post-scripts true && \
    pnpm install --frozen-lockfile --ignore-scripts=false

# Copy prisma schema and migrations
COPY backend/prisma ./prisma

# Generate Prisma Client (MUST be before build)
RUN pnpm run prisma:generate

# Copy source code and config files
COPY backend/src ./src
COPY backend/nest-cli.json ./
COPY backend/tsconfig.json ./

# Build NestJS application
RUN pnpm run build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install pnpm
RUN npm install -g pnpm@10.18.2

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY frontend/ ./

# Build frontend (API calls will be proxied by nginx)
ENV VITE_API_URL=/api
RUN pnpm run build

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install nginx, OpenSSL and pnpm (with retry for network reliability)
RUN for i in 1 2 3; do \
        apk add --no-cache nginx openssl && break || sleep 5; \
    done && \
    npm install -g pnpm@10.18.2

# Setup backend directory structure
WORKDIR /app/backend

# Copy package files (needed for pnpm to work with copied node_modules)
COPY backend/package.json backend/pnpm-lock.yaml ./

# Copy COMPLETE node_modules from builder (includes @prisma/client and .prisma)
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copy built application
COPY --from=backend-builder /app/backend/dist ./dist

# Copy Prisma artifacts (schema + migrations)
COPY --from=backend-builder /app/backend/prisma ./prisma

# Setup frontend
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3500

# Start application
CMD ["/app/start.sh"]
