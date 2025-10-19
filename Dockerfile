# ============================================
# Burnote - Single Container Deployment
# ============================================
# Architecture:
# - Frontend: Vite/React (static files served by Nginx)
# - Backend: NestJS + Prisma + SQLite (Node.js)
# - Reverse Proxy: Nginx (frontend @ / + backend @ /api)
#
# Runtime Configuration:
# - Frontend env vars injected at container startup (no rebuild needed)
# - Backend env vars loaded from Docker environment
# ============================================

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --only=production=false

# Copy source and build with placeholder (will be replaced at runtime)
COPY frontend/ ./
ENV VITE_API_URL=__VITE_API_URL_PLACEHOLDER__
RUN npm run build

# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /build

# Copy package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production=false

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY backend/ ./
RUN npm run build

# Clean install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine

# Install nginx and bash
RUN apk add --no-cache nginx bash

WORKDIR /app

# Copy backend built files
COPY --from=backend-builder /build/dist ./backend/dist
COPY --from=backend-builder /build/node_modules ./backend/node_modules
COPY --from=backend-builder /build/prisma ./backend/prisma
COPY --from=backend-builder /build/package.json ./backend/

# Copy frontend built files to nginx html directory
COPY --from=frontend-builder /build/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create necessary directories
RUN mkdir -p /app/data /run/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Run entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
