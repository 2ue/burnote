#!/bin/sh
set -e

echo "🔥 Starting Burnote..."

# Change to backend directory
cd /app/backend

# Initialize database (idempotent - safe to run multiple times)
echo "📦 Initializing database..."
npx prisma db push --skip-generate

# Verify database
if [ -f "/app/data/burnote.db" ]; then
    echo "✅ Database initialized at /app/data/burnote.db"
else
    echo "❌ Database initialization failed"
    exit 1
fi

# Start supervisor (manages nginx and backend)
echo "🚀 Starting services..."
exec supervisord -c /etc/supervisor/supervisord.conf
