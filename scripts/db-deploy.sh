#!/bin/bash

# Database Deployment Script
# Runs migrations and seeds database for production deployment

set -e

echo "🚀 Starting database deployment..."
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

echo -e "${YELLOW}Step 2: Running migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo -e "${YELLOW}Step 3: Seeding database...${NC}"
npm run db:seed
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

echo -e "${GREEN}=================================="
echo -e "✓ Database deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify data in Prisma Studio: npm run db:studio"
echo "2. Check Supabase dashboard for query performance"
echo "3. Test application endpoints"
