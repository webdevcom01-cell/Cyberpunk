# Authentication & Testing Guide

## Overview

This document covers the authentication system, workspace management, testing infrastructure, and error tracking for the CrewAI Orchestrator.

## Authentication System

### Database Schema

The authentication system uses a multi-tenant architecture with Users and Workspaces:

\`\`\`
users
├─ id (UUID)
├─ email (unique)
├─ password (bcrypt hashed)
├─ name
├─ emailVerified
└─ avatar

workspaces
├─ id (UUID)
├─ name
├─ slug (unique)
├─ plan (free/pro/enterprise)
└─ members (workspace_members)

workspace_members
├─ workspaceId
├─ userId
└─ role (owner/admin/member)
\`\`\`

### Password Hashing

We use `bcrypt` with 10 salt rounds:

\`\`\`typescript
import bcrypt from 'bcrypt'

// Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
\`\`\`

### Workspace Isolation

All agents, tasks, and workflows are scoped to a workspace:

\`\`\`typescript
const agent = await prisma.agent.create({
  data: {
    workspaceId: workspace.id,
    createdById: user.id,
    name: "Research Agent",
    // ... other fields
  }
})
\`\`\`

## Testing Infrastructure

### Setup

Tests are configured with Vitest and React Testing Library:

\`\`\`bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
\`\`\`

### Authentication Tests

Location: `test/auth.test.ts`

Tests cover:
- Password hashing and verification
- User creation with workspace
- Workspace member management

### Component Tests

Location: `test/components/agent-builder.test.tsx`

Tests cover:
- Component rendering
- Form validation
- User interactions

### Writing Tests

Example test structure:

\`\`\`typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

describe("ComponentName", () => {
  it("should do something", () => {
    // Arrange
    render(<Component />)
    
    // Act
    fireEvent.click(screen.getByRole("button"))
    
    // Assert
    expect(screen.getByText("Result")).toBeInTheDocument()
  })
})
\`\`\`

## Error Tracking with Sentry

### Setup

1. Add Sentry DSN to environment variables:
\`\`\`bash
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/your-project"
\`\`\`

2. Sentry is automatically initialized on client mount via `lib/sentry.ts`

### Error Boundary

The `ErrorBoundary` component wraps the entire app and catches React errors:

\`\`\`typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
\`\`\`

Features:
- Automatic error capture
- Sentry integration
- User-friendly error UI
- Retry functionality
- Development error details

### Manual Error Reporting

\`\`\`typescript
import { Sentry } from '@/lib/sentry'

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'AgentBuilder',
      action: 'create'
    }
  })
}
\`\`\`

## Database Seeding

### Running Seed

\`\`\`bash
npm run db:seed
\`\`\`

### Seed Data

The seed creates:
- Demo user (demo@crewai.com / demo123)
- Demo workspace (demo-workspace)
- 3 sample agents
- 3 sample tasks
- 1 sample workflow

### Custom Seeding

Modify `prisma/seed.ts` to add your own test data:

\`\`\`typescript
const myAgent = await prisma.agent.create({
  data: {
    workspaceId: workspace.id,
    createdById: user.id,
    name: "My Agent",
    // ...
  }
})
\`\`\`

## Running Migrations

### Development

\`\`\`bash
# Create new migration
npm run db:migrate:dev

# Apply migrations
npm run db:migrate
\`\`\`

### Production

\`\`\`bash
# Deploy migrations and seed
npm run db:deploy
\`\`\`

## Troubleshooting

### Authentication Issues

1. **Password not hashing**: Ensure bcrypt is installed
\`\`\`bash
npm install bcrypt @types/bcrypt
\`\`\`

2. **Workspace not created**: Check foreign key constraints in migration

### Testing Issues

1. **Tests failing**: Clear test database
\`\`\`bash
npm run db:reset
\`\`\`

2. **Import errors**: Ensure test setup is loaded
\`\`\`typescript
// vitest.config.ts
setupFiles: ['./test/setup.ts']
\`\`\`

### Sentry Issues

1. **Errors not appearing**: Check DSN configuration
2. **Too many errors**: Adjust sample rate in `lib/sentry.ts`

## Best Practices

### Authentication
- Always hash passwords with bcrypt
- Use workspace isolation for all data
- Implement role-based access control

### Testing
- Write tests before implementing features
- Aim for >80% code coverage
- Test user interactions, not implementation

### Error Tracking
- Use Error Boundary for React errors
- Manually capture critical errors
- Add context tags for better debugging

## Next Steps

1. Implement JWT authentication
2. Add OAuth providers (Google, GitHub)
3. Implement role permissions
4. Add rate limiting per workspace
5. Implement audit logging
