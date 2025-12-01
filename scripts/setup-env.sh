#!/bin/bash

# Environment Setup Script for CrewAI Orchestrator
# This script helps you set up environment variables

set -e

echo "🚀 CrewAI Orchestrator - Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo -e "${RED}Error: .env.example not found${NC}"
    exit 1
fi

# Copy .env.example to .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
fi

# Copy .env.local.example to .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local from .env.local.example...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${YELLOW}⚠ .env.local file already exists, skipping...${NC}"
fi

echo ""
echo -e "${GREEN}Environment files created successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env and fill in your database credentials"
echo "2. Edit .env.local and add your API URLs"
echo "3. Get your Supabase credentials from: https://app.supabase.com"
echo "4. (Optional) Add AI API keys if using AI features"
echo ""
echo "For more information, see ENV_SETUP.md"
