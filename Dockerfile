# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Install pnpm using corepack (uses version specified in package.json)
RUN corepack enable pnpm

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install

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

# No build dependencies needed (using Node.js built-in crypto)

# Install pnpm using corepack (uses version specified in package.json)
RUN corepack enable pnpm

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install backend dependencies
RUN pnpm install

# Copy backend source (including Prisma schema)
COPY backend/ .

# Generate Prisma Client with Linux musl target
RUN npx prisma generate

# Build backend
RUN pnpm run build


# ============================================
# Stage 3: Production Image
# ============================================
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    openssl

# Create necessary directories
RUN mkdir -p \
    /app/backend \
    /app/data \
    /usr/share/nginx/html \
    /run/nginx \
    /var/log/supervisor

# Copy frontend build artifacts
COPY --from=frontend-builder /build/dist /usr/share/nginx/html

# Copy backend build artifacts and dependencies
COPY --from=backend-builder /build/dist /app/backend/dist
COPY --from=backend-builder /build/node_modules /app/backend/node_modules
COPY --from=backend-builder /build/package.json /app/backend/package.json
COPY --from=backend-builder /build/prisma /app/backend/prisma

# Copy configuration files
COPY nginx.conf /etc/nginx/http.d/default.conf
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
