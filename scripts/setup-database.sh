#!/bin/bash

echo "🚀 CrewAI Orchestrator - Database Setup"
echo "========================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please ensure Neon or Supabase integration is configured in v0"
  exit 1
fi

echo "✓ DATABASE_URL found"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npm run db:generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi
echo "✓ Prisma Client generated"
echo ""

# Step 2: Run migrations
echo "🔄 Step 2: Running database migrations..."
npm run db:migrate:dev -- --name init
if [ $? -ne 0 ]; then
  echo "❌ Failed to run migrations"
  exit 1
fi
echo "✓ Migrations completed"
echo ""

# Step 3: Seed database
echo "🌱 Step 3: Seeding database with demo data..."
npm run db:seed
if [ $? -ne 0 ]; then
  echo "❌ Failed to seed database"
  exit 1
fi
echo "✓ Database seeded"
echo ""

echo "✅ Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "  - Run 'npm run dev' to start the development server"
echo "  - Run 'npm run db:studio' to open Prisma Studio"
echo ""
