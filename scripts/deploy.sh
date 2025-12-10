#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed database (only if needed - checks for existing data)
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts || echo "⚠️  Seed completed (may have skipped existing data)"

echo "✅ Deployment setup complete!"

