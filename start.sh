#!/bin/sh
set -e

# Start nginx in background
nginx

# Run database migrations
cd /app/backend
pnpm prisma migrate deploy

# Start backend (foreground)
exec node dist/main
