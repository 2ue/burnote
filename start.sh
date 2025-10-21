#!/bin/sh
set -e

# Set default environment variables if not provided
export DATABASE_URL=${DATABASE_URL:-"file:/app/data/burnote.db"}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin123"}
export PORT=${PORT:-3501}
export NODE_ENV=${NODE_ENV:-production}

# Start nginx in background
nginx

# Run database migrations
cd /app/backend
npx prisma migrate deploy

# Start backend (foreground)
exec node dist/main
