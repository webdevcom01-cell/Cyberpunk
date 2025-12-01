# CrewAI Orchestrator UI

A modern, production-ready web interface for managing AI agents, tasks, and workflows with real-time monitoring and observability.

## Features

- **Agent Management**: Create, configure, and monitor AI agents with customizable models and tools
- **Task Orchestration**: Define tasks with dependencies, priorities, and execution order
- **Workflow Builder**: Visual workflow builder with drag-and-drop interface
- **Real-time Updates**: Live status monitoring with WebSocket connections
- **Execution Traces**: Comprehensive observability with traces, logs, and metrics
- **Authentication**: Secure authentication powered by Supabase Auth
- **Analytics Dashboard**: Performance metrics, success rates, and cost tracking
- **Search & Filters**: Advanced filtering, sorting, and search capabilities
- **Data Export**: Export data in JSON, CSV, or TXT formats

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Real-time**: Supabase Realtime
- **Validation**: Zod
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd crewai-orchestrator-ui
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

The following environment variables are already configured via Supabase integration in v0:
- \`DATABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- All Postgres connection strings

Optional environment variables you can add:
\`\`\`bash
# Development redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"

# AI API Keys (if using AI features)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="your-key"
\`\`\`

4. Set up the database:

The database schema is already created in Supabase. To add additional indexes and RLS policies:

\`\`\`bash
# Run additional migration scripts via Supabase SQL Editor or API
npm run db:migrate
\`\`\`

5. Generate Prisma client:
\`\`\`bash
npx prisma generate
\`\`\`

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── agents/            # Agent management pages
│   ├── tasks/             # Task management pages
│   ├── workflows/         # Workflow builder pages
│   ├── execution/         # Execution monitoring pages
│   ├── analytics/         # Analytics dashboard
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── workflow/         # Workflow-specific components
├── lib/                   # Utility libraries
│   ├── db/               # Database helpers
│   ├── hooks/            # Custom React hooks
│   └── supabase/         # Supabase clients
├── prisma/               # Prisma schema
└── scripts/              # Database migration scripts
\`\`\`

## Database Schema

The application uses the following main tables:

- **agents**: AI agent configurations and metadata
- **tasks**: Task definitions with dependencies
- **workflows**: Workflow orchestration
- **execution_traces**: Execution monitoring with OpenTelemetry-style spans
- **execution_logs**: Structured logging
- **metrics**: Performance metrics and cost tracking
- **integrations**: External integrations configuration

## Authentication

The app uses Supabase Auth with email/password authentication. Row Level Security (RLS) policies ensure data isolation between users.

To enable authentication:
1. Users are automatically redirected to login if not authenticated
2. All protected routes require authentication
3. Middleware handles token refresh automatically

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Environment variables are already configured via Supabase integration
5. Add production domain to CORS whitelist in environment variables

### Docker

\`\`\`bash
docker build -t crewai-orchestrator .
docker run -p 3000:3000 crewai-orchestrator
\`\`\`

## API Routes

All API routes are in \`app/api/\`:

- \`GET /api/agents\` - List all agents
- \`POST /api/agents\` - Create new agent
- \`GET /api/tasks\` - List all tasks
- \`POST /api/tasks\` - Create new task
- \`GET /api/workflows\` - List all workflows
- \`POST /api/workflows\` - Create new workflow
- \`GET /api/execution/traces\` - Get execution traces

## Development

### Database Migrations

To create a new migration:
\`\`\`bash
npx prisma migrate dev --name migration_name
\`\`\`

To apply migrations:
\`\`\`bash
npx prisma migrate deploy
\`\`\`

### Type Generation

Regenerate Prisma types after schema changes:
\`\`\`bash
npx prisma generate
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
\`\`\`

```json file="" isHidden
