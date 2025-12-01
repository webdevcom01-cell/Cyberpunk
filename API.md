# API Documentation

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Currently, authentication is handled via Supabase. Include the user's session token in requests:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit info is returned in response headers

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
\`\`\`

When rate limit is exceeded, you'll receive a 429 status code:

\`\`\`json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
\`\`\`

## Endpoints

### Agents

#### GET /api/agents

Get all agents.

**Response:**
\`\`\`json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Research Agent",
      "role": "Senior Researcher",
      "goal": "Conduct research",
      "status": "active",
      ...
    }
  ]
}
\`\`\`

#### POST /api/agents

Create a new agent.

**Request Body:**
\`\`\`json
{
  "name": "Research Agent",
  "role": "Senior Researcher",
  "goal": "Conduct comprehensive research",
  "backstory": "Expert researcher...",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000,
  "tools": ["web_search"],
  "status": "active"
}
\`\`\`

**Response:** 201 Created
\`\`\`json
{
  "agent": { ... }
}
\`\`\`

### Tasks

#### GET /api/tasks

Get all tasks.

#### POST /api/tasks

Create a new task.

**Request Body:**
\`\`\`json
{
  "name": "Market Analysis",
  "description": "Analyze market trends...",
  "agent": "agent-id",
  "expectedOutput": "Market analysis report",
  "priority": "high"
}
\`\`\`

### Workflows

#### GET /api/workflows

Get all workflows.

#### POST /api/workflows

Create a new workflow.

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": "Error type",
  "message": "Detailed error message",
  "errors": {
    "field": "Field-specific error"
  }
}
\`\`\`

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

## Interactive Documentation

Visit `/api-docs` in your browser for interactive API documentation with examples and schema definitions.

## Postman Collection

Import our Postman collection for easy API testing:

[Download Collection](./postman_collection.json)
