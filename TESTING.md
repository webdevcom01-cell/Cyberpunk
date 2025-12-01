# Testing Guide

## Overview

This project uses Vitest for unit and integration testing, with React Testing Library for component testing.

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
\`\`\`

## Test Structure

\`\`\`
test/
├── setup.ts              # Test setup and global mocks
├── lib/                  # Library function tests
│   ├── validations.test.ts
│   └── api-validation.test.ts
├── components/           # Component tests
│   └── error-boundary.test.tsx
└── api/                  # API route tests (future)
\`\`\`

## Writing Tests

### Unit Tests

Test individual functions and utilities:

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/utils'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
\`\`\`

### Component Tests

Test React components with user interactions:

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
\`\`\`

### API Route Tests

Test Next.js API routes:

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/agents/route'

describe('/api/agents', () => {
  it('should return agents list', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.agents).toBeDefined()
  })
})
\`\`\`

## Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Setup test data
   - Act: Execute the code
   - Assert: Verify results

2. **Test User Behavior**
   - Test what users see and do
   - Avoid testing implementation details

3. **Mock External Dependencies**
   - Mock API calls
   - Mock database queries
   - Mock third-party libraries

4. **Keep Tests Isolated**
   - Each test should be independent
   - Clean up after tests
   - Don't rely on test order

5. **Write Descriptive Test Names**
   - Use "should" statements
   - Be specific about what's being tested

## Coverage Goals

- Critical paths: 80%+ coverage
- Utilities and helpers: 90%+ coverage
- Components: 70%+ coverage
- API routes: 80%+ coverage

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployment

## Troubleshooting

### Tests Timing Out

Increase timeout in vitest.config.ts:

\`\`\`typescript
test: {
  testTimeout: 10000,
}
\`\`\`

### Module Not Found

Check path aliases in vitest.config.ts

### Async Tests Failing

Always await async operations:

\`\`\`typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
