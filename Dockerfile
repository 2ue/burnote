# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Install pnpm using corepack (specify version to match lockfile)
RUN corepack enable && corepack prepare pnpm@7.33.7 --activate

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY frontend/ .

# Build frontend (use /api for production API calls via nginx proxy)
ENV VITE_API_URL=/api
RUN pnpm run build


# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /build

# Install OpenSSL development packages (required for Prisma)
# Use Aliyun mirror for better connectivity in China
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache openssl openssl-dev

# Install pnpm using corepack (specify version to match lockfile)
RUN corepack enable && corepack prepare pnpm@7.33.7 --activate

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install backend dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy backend source (including Prisma schema)
COPY backend/ .

# Generate Prisma Client (for TypeScript types during build)
RUN pnpm run prisma:generate

# Build backend
RUN pnpm run build


# ============================================
# Stage 3: Production Image
# ============================================
FROM node:20-alpine

WORKDIR /app

# Install system dependencies (including openssl-dev for Prisma)
# Use Aliyun mirror for better connectivity in China
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache \
    nginx \
    supervisor \
    openssl \
    openssl-dev

# Install pnpm using corepack (specify version to match lockfile)
RUN corepack enable && corepack prepare pnpm@7.33.7 --activate

# Create necessary directories
RUN mkdir -p \
    /app/backend \
    /app/data \
    /usr/share/nginx/html \
    /run/nginx \
    /var/log/supervisor

# Copy frontend build artifacts
COPY --from=frontend-builder /build/dist /usr/share/nginx/html

# Copy backend package files and source files
COPY --from=backend-builder /build/package.json /app/backend/package.json
COPY --from=backend-builder /build/pnpm-lock.yaml /app/backend/pnpm-lock.yaml
COPY --from=backend-builder /build/dist /app/backend/dist
COPY --from=backend-builder /build/prisma /app/backend/prisma

# Install production dependencies only
WORKDIR /app/backend
RUN pnpm install --prod --frozen-lockfile

# Copy the generated Prisma Client from builder stage
# Prisma 5.x stores everything in @prisma/client (includes binary engines)
COPY --from=backend-builder /build/node_modules/@prisma /app/backend/node_modules/@prisma

# Back to app root
WORKDIR /app

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY start.sh /app/start.sh

# Make start script executable
RUN chmod +x /app/start.sh

# Set environment variables with defaults
ENV NODE_ENV=production \
    PORT=3501 \
    DATABASE_URL=file:/app/data/burnote.db \
    CORS_ORIGIN=http://localhost:3500

# Expose frontend port (nginx)
EXPOSE 3500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3500/ || exit 1

# Start supervisor (manages nginx and node)
CMD ["/app/start.sh"]
