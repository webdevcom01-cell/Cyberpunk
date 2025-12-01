# 🚀 CrewAI Orchestrator - Complete Setup Instructions

## Critical Setup Steps

### 1. Environment Configuration 🔴 KRITIČNO

The project uses **Neon** and **Supabase** integrations which are already configured in v0. All environment variables are automatically provided through these integrations.

**Required environment variables** (automatically configured):
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_URL` - Postgres URL
- `POSTGRES_PRISMA_URL` - Prisma-specific URL
- `SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key

**Optional environment variables** (add if needed):
- `GEMINI_API_KEY` - For Google AI features
- `OPENAI_API_KEY` - For OpenAI features
- `ANTHROPIC_API_KEY` - For Anthropic Claude features

### 2. Database Setup 🔴 KRITIČNO

The Prisma schema exists but migrations need to be run. Follow these steps:

#### Quick Setup (Recommended)

\`\`\`bash
npm run db:setup
\`\`\`

This single command will:
1. Generate Prisma Client
2. Run all migrations
3. Seed the database with demo data

#### Manual Setup

If you prefer to run each step manually:

\`\`\`bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Run migrations
npm run db:migrate:dev

# 3. Seed database
npm run db:seed
\`\`\`

### 3. Verify Setup

After running the setup, verify everything works:

\`\`\`bash
# Open Prisma Studio to view your database
npm run db:studio

# Start the development server
npm run dev
\`\`\`

## What Gets Created

### Database Tables

- **agents** - 3 demo agents (Research Analyst, Code Generator, Content Writer)
- **tasks** - 3 sample tasks
- **workflows** - 1 sample workflow (Product Launch)
- **execution_traces** - Execution tracking (empty initially)
- **execution_logs** - Log storage (empty initially)
- **metrics** - Metrics storage (empty initially)
- **integrations** - External integrations config (empty initially)

### Demo Data

The seed script creates:

**Agents:**
1. Research Analyst - Senior Researcher (GPT-4)
2. Code Generator - Senior Developer (Claude Sonnet)
3. Content Writer - Creative Writer (GPT-4)

**Tasks:**
1. Market Analysis - High priority, Completed
2. API Development - Critical priority, Running
3. Documentation - Medium priority, Pending

**Workflow:**
1. Product Launch - Active workflow linking all agents and tasks

## Troubleshooting

### Issue: "uuid_generate_v4() does not exist"

**Solution:** The migration includes the UUID extension. Run:
\`\`\`bash
npm run db:migrate:dev
\`\`\`

### Issue: "Prisma Client not generated"

**Solution:** Generate the client:
\`\`\`bash
npm run db:generate
\`\`\`

### Issue: "DATABASE_URL not found"

**Solution:** Ensure Neon or Supabase integration is properly connected in v0.

### Issue: "Migration already exists"

**Solution:** If migrations were partially run:
\`\`\`bash
npm run db:push  # Skip migrations, just push schema
npm run db:seed  # Then seed the data
\`\`\`

### Complete Reset

If you need to start completely fresh:
\`\`\`bash
npm run db:reset  # WARNING: Deletes all data
npm run db:seed   # Re-seed with demo data
\`\`\`

## Production Deployment

On Vercel, everything runs automatically:

\`\`\`bash
npm run build
\`\`\`

This executes:
1. `prisma generate` - Generates Prisma Client
2. `next build` - Builds Next.js app

For manual production setup:
\`\`\`bash
npm run db:deploy  # Runs migrations + seed
\`\`\`

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run db:setup` | Complete database setup (recommended) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate:dev` | Run migrations (development) |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:push` | Push schema without migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open database GUI |
| `npm run db:reset` | Reset everything (⚠️ destructive) |
| `npm run db:deploy` | Production deployment |

## Next Steps

1. ✅ Run `npm run db:setup` to initialize the database
2. ✅ Run `npm run dev` to start the app
3. ✅ Visit `http://localhost:3000` to see your app
4. ✅ Run `npm run db:studio` to explore the database

Your CrewAI Orchestrator is now ready to use!
