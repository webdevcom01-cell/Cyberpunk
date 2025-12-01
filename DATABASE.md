# Database Setup and Migration Guide

## Quick Start

### 1. Initial Setup

The database is already configured via Supabase integration. Tables are automatically created when you run migrations.

### 2. Generate Prisma Client

\`\`\`bash
npm run db:generate
\`\`\`

This generates the Prisma client based on your schema.

### 3. Deploy Migrations

For production:
\`\`\`bash
npm run db:migrate
\`\`\`

For development (creates new migrations):
\`\`\`bash
npm run db:migrate:dev
\`\`\`

### 4. Seed Database

\`\`\`bash
npm run db:seed
\`\`\`

This adds sample data including:
- 3 sample agents (Research Analyst, Code Generator, Content Writer)
- 3 sample tasks
- 1 sample workflow

## Database Architecture

### Tables

1. **agents** - AI agents with configurations
2. **tasks** - Individual tasks assigned to agents
3. **workflows** - Collections of agents and tasks
4. **execution_traces** - Execution history and observability
5. **execution_logs** - Detailed logs for each execution
6. **metrics** - Performance metrics
7. **integrations** - External service integrations

### Relationships

\`\`\`
Workflow 1---* ExecutionTrace
Agent 1---* Task
Agent 1---* ExecutionTrace
Task 1---* ExecutionTrace
\`\`\`

## Using Prisma Client

### Basic Queries

\`\`\`typescript
import { prisma } from '@/lib/prisma'

// Get all agents
const agents = await prisma.agent.findMany()

// Create new agent
const agent = await prisma.agent.create({
  data: {
    name: 'My Agent',
    role: 'Developer',
    goal: 'Build features',
    model: 'openai/gpt-4.1',
  },
})

// Update agent
await prisma.agent.update({
  where: { id: agent.id },
  data: { status: 'active' },
})

// Delete agent
await prisma.agent.delete({
  where: { id: agent.id },
})
\`\`\`

### Relations

\`\`\`typescript
// Get agent with tasks
const agentWithTasks = await prisma.agent.findUnique({
  where: { id: agentId },
  include: {
    tasks: true,
    execution_traces: {
      orderBy: { created_at: 'desc' },
      take: 10,
    },
  },
})

// Get workflow with all data
const workflow = await prisma.workflow.findUnique({
  where: { id: workflowId },
  include: {
    execution_traces: {
      include: {
        agent: true,
        task: true,
      },
    },
  },
})
\`\`\`

### Transactions

\`\`\`typescript
// Create workflow with agents and tasks
const workflow = await prisma.$transaction(async (tx) => {
  const workflow = await tx.workflow.create({
    data: {
      name: 'New Workflow',
      status: 'draft',
    },
  })

  const agent = await tx.agent.create({
    data: {
      name: 'Agent 1',
      role: 'Worker',
      goal: 'Complete tasks',
      model: 'openai/gpt-4.1',
    },
  })

  await tx.task.create({
    data: {
      name: 'Task 1',
      description: 'First task',
      agent_id: agent.id,
    },
  })

  return workflow
})
\`\`\`

## Migrations

### Creating Migrations (Development)

1. Modify `prisma/schema.prisma`
2. Run migration:
\`\`\`bash
npm run db:migrate:dev -- --name add_new_field
\`\`\`

This will:
- Generate SQL migration file
- Apply migration to database
- Regenerate Prisma client

### Deploying Migrations (Production)

\`\`\`bash
npm run db:deploy
\`\`\`

This runs all pending migrations and seeds the database.

### Migration Files

Migrations are stored in `prisma/migrations/`. Each migration includes:
- `migration.sql` - SQL commands
- Timestamp and name for ordering

### Reset Database (Development Only)

**WARNING: This deletes all data!**

\`\`\`bash
npm run db:reset
\`\`\`

This will:
- Drop database
- Recreate schema
- Run all migrations
- Seed database

## Backup and Restore

### Backup

\`\`\`bash
# Via Supabase dashboard
# Go to Settings > Database > Backups

# Or via pg_dump
pg_dump $DATABASE_URL > backup.sql
\`\`\`

### Restore

\`\`\`bash
psql $DATABASE_URL < backup.sql
\`\`\`

## Troubleshooting

### Migration Fails

If migration fails:

1. Check database connection:
\`\`\`bash
psql $DATABASE_URL
\`\`\`

2. Verify Supabase project is active

3. Check migration SQL for errors:
\`\`\`bash
cat prisma/migrations/[timestamp]_[name]/migration.sql
\`\`\`

4. Manually fix database, then mark migration as applied:
\`\`\`bash
npx prisma migrate resolve --applied [migration_name]
\`\`\`

### Schema Drift

If schema doesn't match database:

\`\`\`bash
# Pull current database schema
npx prisma db pull

# Or force push schema
npm run db:push
\`\`\`

### Connection Pool Exhausted

Increase connection limit in Supabase dashboard or use connection pooling:

\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
\`\`\`

## Performance Tips

1. **Use Indexes** - Already added for common queries
2. **Batch Operations** - Use `createMany()` for bulk inserts
3. **Select Specific Fields** - Don't fetch unused data
4. **Connection Pooling** - Enabled via Supabase by default
5. **Caching** - Cache frequently accessed data

## RLS (Row Level Security)

Supabase RLS policies are defined in `scripts/004_add_rls_policies.sql`.

To enable RLS:
\`\`\`sql
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
\`\`\`

Current policies allow authenticated users to:
- Read all records
- Create/update/delete their own records

## Monitoring

### Prisma Studio

Visual database browser:
\`\`\`bash
npm run db:studio
\`\`\`

Opens at http://localhost:5555

### Query Logs

Enable in development (already configured in `lib/prisma.ts`):
\`\`\`typescript
log: ["query", "error", "warn"]
\`\`\`

### Supabase Dashboard

View query performance, slow queries, and database metrics at:
https://app.supabase.com/project/[project-id]/database/query-performance
