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

# Install nginx and pnpm (with retry for network reliability)
RUN for i in 1 2 3; do \
        apk add --no-cache nginx && break || sleep 5; \
    done && \
    npm install -g pnpm@10.18.2

# Setup backend - copy built files and generated Prisma client
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY backend/package.json backend/pnpm-lock.yaml ./backend/

# Setup frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3500

CMD ["/app/start.sh"]
