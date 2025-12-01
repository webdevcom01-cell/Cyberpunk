# Database Setup Guide - CrewAI Orchestrator

## Prerequisites

This project uses **Neon** and **Supabase** integrations which are already configured in your v0 project. The DATABASE_URL environment variable is automatically provided.

## Setup Steps

### 1. Generate Prisma Client

\`\`\`bash
npm run db:generate
\`\`\`

This command generates the Prisma Client based on your schema.

### 2. Run Database Migrations

\`\`\`bash
npm run db:migrate:dev
\`\`\`

This will:
- Create all database tables (agents, tasks, workflows, execution_traces, etc.)
- Enable the `uuid-ossp` extension for UUID generation
- Apply all migrations

### 3. Seed the Database

\`\`\`bash
npm run db:seed
\`\`\`

This will populate your database with:
- 3 demo agents (Research Analyst, Code Generator, Content Writer)
- 3 sample tasks
- 1 sample workflow

## Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate:dev` | Create and apply migrations (development) |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset database (WARNING: deletes all data) |
| `npm run db:deploy` | Deploy migrations + seed (production) |

## Database Schema

### Tables

- **agents** - AI agents with their configurations
- **tasks** - Individual tasks to be executed
- **workflows** - Collections of agents and tasks
- **execution_traces** - Detailed execution tracking
- **execution_logs** - Execution logs
- **metrics** - Performance metrics
- **integrations** - External integrations configuration

### Key Features

- UUID primary keys with `uuid_generate_v4()`
- Timestamptz for all timestamps (timezone-aware)
- JSON/JSONB for flexible metadata storage
- Foreign keys with cascade deletes
- Indexes for performance optimization

## Environment Variables

The following are automatically configured via integrations:

\`\`\`env
DATABASE_URL=<from Neon/Supabase integration>
POSTGRES_URL=<from Neon/Supabase integration>
POSTGRES_PRISMA_URL=<from Neon/Supabase integration>
\`\`\`

## Troubleshooting

### Error: "uuid_generate_v4() does not exist"

Run the migration which includes:
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\`\`\`

### Error: "Prisma Client not generated"

Run:
\`\`\`bash
npm run db:generate
\`\`\`

### Reset Everything

If you need to start fresh:
\`\`\`bash
npm run db:reset
npm run db:seed
\`\`\`

## Production Deployment

On Vercel, migrations run automatically via:
\`\`\`bash
npm run build
\`\`\`

Which executes:
\`\`\`bash
prisma generate && next build
\`\`\`

For manual production deployments:
\`\`\`bash
npm run db:deploy
