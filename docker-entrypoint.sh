#!/bin/bash
set -e

# ============================================
# Burnote Docker Entrypoint Script
# ============================================
# Responsibilities:
# 1. Inject runtime environment variables into frontend JS files
# 2. Run database migrations
# 3. Start backend and nginx processes
# ============================================

echo "=========================================="
echo "Burnote Container Starting..."
echo "=========================================="

# ============================================
# 1. Environment Variable Injection
# ============================================
echo "[1/4] Injecting runtime environment variables into frontend..."

# Default values
VITE_API_URL=${VITE_API_URL:-/api}

echo "  - VITE_API_URL: $VITE_API_URL"

# Replace placeholder in all JS files
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec \
    sed -i "s|__VITE_API_URL_PLACEHOLDER__|${VITE_API_URL}|g" {} +

echo "  ✓ Frontend environment variables injected"

# ============================================
# 2. Backend Environment Configuration
# ============================================
echo "[2/4] Configuring backend environment..."

# Set default backend environment variables
export DATABASE_URL=${DATABASE_URL:-file:/app/data/burnote.db}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export CORS_ORIGIN=${CORS_ORIGIN:-*}

echo "  - DATABASE_URL: $DATABASE_URL"
echo "  - PORT: $PORT"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - CORS_ORIGIN: $CORS_ORIGIN"

if [ -n "$ADMIN_PASSWORD" ]; then
    echo "  - ADMIN_PASSWORD: ****** (set)"
else
    echo "  - ADMIN_PASSWORD: (not set - admin features disabled)"
fi

echo "  ✓ Backend environment configured"

# ============================================
# 3. Database Migration
# ============================================
echo "[3/4] Running database migrations..."

cd /app/backend

# Run Prisma migrations
npx prisma migrate deploy || {
    echo "  ⚠ Migration failed, attempting to generate Prisma client..."
    npx prisma generate
    npx prisma migrate deploy || echo "  ⚠ Migration still failed, continuing anyway..."
}

echo "  ✓ Database ready"

# ============================================
# 4. Start Services
# ============================================
echo "[4/4] Starting services..."

# Start nginx in background
echo "  - Starting nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Start backend
echo "  - Starting backend on port $PORT..."
node dist/main.js &
BACKEND_PID=$!

echo ""
echo "=========================================="
echo "✓ Burnote Started Successfully!"
echo "=========================================="
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost/api"
echo "  Health Check: http://localhost/health"
echo "=========================================="

# Wait for any process to exit
wait -n $NGINX_PID $BACKEND_PID

# Exit with status of process that exited first
exit $?
