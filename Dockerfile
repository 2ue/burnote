# Stage 1: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install pnpm
RUN npm install -g pnpm@10.18.2

# Install backend dependencies
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy backend source and build
COPY backend/ ./
RUN pnpm prisma generate
RUN pnpm build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install pnpm
RUN npm install -g pnpm@10.18.2

# Install frontend dependencies
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy frontend source and build
COPY frontend/ ./
# Use relative path for API calls (nginx will proxy /api to backend)
ENV VITE_API_URL=/api
RUN pnpm build

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install nginx, supervisor (Python 3 version), and pnpm
RUN apk update && \
    apk add --no-cache nginx py3-supervisor && \
    npm install -g pnpm@10.18.2

# Setup backend
COPY backend/package.json backend/pnpm-lock.yaml ./backend/
WORKDIR /app/backend
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Setup frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Setup supervisor
COPY supervisord.conf /etc/supervisord.conf

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3500

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
