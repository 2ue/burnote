#!/bin/sh
set -e

echo "🔥 Starting Burnote..."

# Change to backend directory
cd /app/backend

# Initialize database (idempotent - safe to run multiple times)
echo "📦 Initializing database..."
echo "   DATABASE_URL: $DATABASE_URL"

# Run prisma db push and capture exit code
if npx prisma db push --skip-generate; then
    echo "✅ Prisma db push completed successfully"
else
    echo "❌ Prisma db push failed with exit code $?"
    exit 1
fi

# Verify database file exists
if [ -f "/app/data/burnote.db" ]; then
    echo "✅ Database file verified at /app/data/burnote.db"
    ls -lh /app/data/burnote.db
else
    echo "❌ Database file not found at /app/data/burnote.db"
    echo "   Checking /app/backend/data/..."
    ls -la /app/backend/data/ 2>/dev/null || echo "   Directory does not exist"
    exit 1
fi

# Start supervisor (manages nginx and backend)
echo "🚀 Starting services..."
exec supervisord -c /etc/supervisor/supervisord.conf
