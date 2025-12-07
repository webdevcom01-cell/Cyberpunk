# 🏗️ Arhitektura Plan - Implementacija Kritičnih Funkcija

**Datum**: 1. Decembar 2025  
**Verzija**: 1.0  
**Status**: Planning Phase

---

## 📐 SISTEM ARHITEKTURA

### Current State (Što Imamo)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router                                         │
│  ├── Pages (26)                                                 │
│  │   ├── /research - AI Research                              │
│  │   ├── /chat - AI Chat                                      │
│  │   ├── /agents - Agent CRUD                                 │
│  │   ├── /workflows - Workflow Builder                        │
│  │   ├── /observability - Execution Traces                    │
│  │   └── ... (21 more pages)                                  │
│  └── Components (88)                                            │
│      ├── UI Components (shadcn/ui)                             │
│      ├── Feature Components                                     │
│      └── Layout Components                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (21)                                       │
│  ├── /api/agents - CRUD operations                            │
│  ├── /api/tasks - Task management                             │
│  ├── /api/workflows - Workflow operations                      │
│  ├── /api/research - AI research endpoint                      │
│  ├── /api/chat - Conversational AI                            │
│  ├── /api/execution/traces - Observability                     │
│  └── ... (15 more routes)                                      │
│                                                                  │
│  Middleware:                                                    │
│  ├── Authentication (Supabase Auth)                            │
│  ├── Rate Limiting (100 req/15min)                            │
│  └── Validation (Zod schemas)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                           │
│  ├── Tables (20+)                                              │
│  │   ├── agents, tasks, workflows                             │
│  │   ├── execution_traces, execution_logs                     │
│  │   ├── users, workspaces, workspace_members                 │
│  │   ├── integrations, marketplace_agents                     │
│  │   └── ... (more)                                           │
│  ├── Row Level Security (RLS)                                  │
│  ├── Realtime Subscriptions                                    │
│  └── Prisma ORM (Type-safe queries)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  ├── OpenAI API (GPT-4o-mini)                                 │
│  ├── Google Gemini API (1.5 Flash)                            │
│  ├── Supabase Auth                                             │
│  └── (Future: Sentry, Stripe, SendGrid, etc)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚧 Target State (Što Želimo)

### Dodati Nove Slojeve:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: ORCHESTRATION LAYER                     │
├─────────────────────────────────────────────────────────────────┤
│  Agent Execution Engine                                         │
│  ├── Task Queue (BullMQ ili pg-boss)                          │
│  ├── Agent Runner (izvršava AI agents)                        │
│  ├── Multi-Agent Coordinator                                   │
│  ├── Dependency Resolver                                       │
│  └── Error Handler & Retry Logic                              │
│                                                                  │
│  Integration Engine                                             │
│  ├── Integration Registry (50+ apps)                          │
│  ├── OAuth Manager                                             │
│  ├── Webhook Handler                                           │
│  └── Rate Limiter (per integration)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: MONITORING LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Observability Stack                                            │
│  ├── Sentry (Error tracking)                                   │
│  ├── Metrics Collector (Prometheus/OpenTelemetry)             │
│  ├── Cost Tracker (AI token counting)                         │
│  └── Alerting System (Email/Slack notifications)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: CACHING LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Redis (if needed)                                              │
│  ├── Session storage                                           │
│  ├── Rate limit counters                                       │
│  ├── Integration credentials cache                             │
│  └── Workflow execution state                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIJA PLAN

### 1. AI Cost Tracking System

#### Database Schema Changes
```sql
-- Add to existing execution_traces table
ALTER TABLE execution_traces
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 6) DEFAULT 0;

-- Create workspace_usage table
CREATE TABLE workspace_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 2) DEFAULT 0,
  budget_limit_usd DECIMAL(10, 2),
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, period_start)
);

-- Create cost_alerts table
CREATE TABLE cost_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'threshold', 'budget_exceeded'
  message TEXT NOT NULL,
  current_usage DECIMAL(10, 2),
  budget_limit DECIMAL(10, 2),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false
);
```

#### Backend Implementation
```typescript
// lib/ai-cost-tracker.ts
export class AICostTracker {
  private static PRICING = {
    'gpt-4o-mini': {
      input: 0.00015,  // per 1K tokens
      output: 0.0006,  // per 1K tokens
    },
    'gemini-1.5-flash': {
      input: 0.000075, // per 1K tokens
      output: 0.0003,  // per 1K tokens
    },
  }

  static calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.PRICING[model]
    if (!pricing) return 0

    const inputCost = (inputTokens / 1000) * pricing.input
    const outputCost = (outputTokens / 1000) * pricing.output
    return inputCost + outputCost
  }

  static async trackUsage(
    workspaceId: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ) {
    const cost = this.calculateCost(model, inputTokens, outputTokens)
    const totalTokens = inputTokens + outputTokens

    // Update workspace usage
    await supabase.rpc('increment_workspace_usage', {
      p_workspace_id: workspaceId,
      p_tokens: totalTokens,
      p_cost: cost,
    })

    // Check budget and send alerts if needed
    await this.checkBudget(workspaceId)
  }

  static async checkBudget(workspaceId: string) {
    const { data: usage } = await supabase
      .from('workspace_usage')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()

    if (!usage || !usage.budget_limit_usd) return

    const usagePercent = usage.total_cost_usd / usage.budget_limit_usd

    if (usagePercent >= 1.0) {
      // Budget exceeded - pause workflows
      await this.pauseWorkflows(workspaceId)
      await this.sendAlert(workspaceId, 'budget_exceeded', usage)
    } else if (usagePercent >= usage.alert_threshold) {
      // Threshold reached - send warning
      await this.sendAlert(workspaceId, 'threshold', usage)
    }
  }
}
```

#### Frontend Components
```tsx
// components/cost-tracker-widget.tsx
export function CostTrackerWidget() {
  const [usage, setUsage] = useState(null)
  const [period, setPeriod] = useState('month')

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Usage & Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span>Current Period</span>
              <span className="font-bold">${usage?.total_cost_usd || 0}</span>
            </div>
            <Progress 
              value={(usage?.total_cost_usd / usage?.budget_limit_usd) * 100} 
            />
            <p className="text-sm text-muted-foreground mt-1">
              Budget: ${usage?.budget_limit_usd || 0}
            </p>
          </div>

          {/* Token usage */}
          <div>
            <h4 className="font-semibold mb-2">Token Usage</h4>
            <div className="text-2xl font-bold">
              {usage?.total_tokens?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Total tokens this {period}
            </p>
          </div>

          {/* Cost breakdown */}
          <div>
            <h4 className="font-semibold mb-2">Cost Breakdown</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>GPT-4o-mini</span>
                <span>$X.XX</span>
              </div>
              <div className="flex justify-between">
                <span>Gemini 1.5</span>
                <span>$X.XX</span>
              </div>
            </div>
          </div>

          {/* Set budget */}
          <Button onClick={() => openBudgetDialog()}>
            Set Monthly Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### 2. Integration System Architecture

#### Integration Framework
```typescript
// lib/integrations/base.ts
export abstract class BaseIntegration {
  abstract id: string
  abstract name: string
  abstract icon: string
  abstract authType: 'oauth2' | 'api_key' | 'basic'

  abstract authenticate(credentials: any): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract testConnection(): Promise<boolean>
  
  // Standard methods all integrations implement
  abstract getData(endpoint: string, params?: any): Promise<any>
  abstract postData(endpoint: string, data: any): Promise<any>
  abstract handleWebhook(payload: any): Promise<void>
}

// lib/integrations/slack/index.ts
export class SlackIntegration extends BaseIntegration {
  id = 'slack'
  name = 'Slack'
  icon = '/integrations/slack.svg'
  authType = 'oauth2' as const

  async authenticate(credentials: { code: string }) {
    // OAuth flow
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: credentials.code,
      }),
    })
    
    const data = await response.json()
    
    // Save to database
    await supabase.from('integrations').insert({
      type: 'slack',
      config: { workspace: data.team.name },
      credentials: { access_token: data.access_token },
    })
    
    return true
  }

  async sendMessage(channel: string, text: string) {
    const { data: integration } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('type', 'slack')
      .single()

    return fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text }),
    })
  }
}
```

#### Integration Registry
```typescript
// lib/integrations/registry.ts
import { SlackIntegration } from './slack'
import { GitHubIntegration } from './github'
import { NotionIntegration } from './notion'
// ... import 47 more

export const INTEGRATIONS = {
  slack: new SlackIntegration(),
  github: new GitHubIntegration(),
  notion: new NotionIntegration(),
  // ... 47 more
}

export function getIntegration(id: string) {
  return INTEGRATIONS[id]
}

export function getAllIntegrations() {
  return Object.values(INTEGRATIONS)
}
```

---

### 3. Agent Execution Engine

#### Architecture
```typescript
// lib/execution/agent-runner.ts
export class AgentExecutionEngine {
  private queue: TaskQueue
  private llmClient: LLMClient

  async executeWorkflow(workflowId: string) {
    const workflow = await this.loadWorkflow(workflowId)
    const tasks = await this.loadTasks(workflow.task_ids)
    
    // Sort tasks by dependencies
    const sortedTasks = this.topologicalSort(tasks)
    
    // Execute each task
    const results = new Map()
    
    for (const task of sortedTasks) {
      const agent = await this.loadAgent(task.agent_id)
      
      // Wait for dependencies
      await this.waitForDependencies(task, results)
      
      // Execute task
      const result = await this.executeTask(task, agent, results)
      results.set(task.id, result)
      
      // Track execution
      await this.trackExecution(task, agent, result)
    }
    
    return results
  }

  async executeTask(task: Task, agent: Agent, previousResults: Map) {
    // Build context from previous tasks
    const context = this.buildContext(task, previousResults)
    
    // Prepare prompt
    const prompt = this.buildPrompt(agent, task, context)
    
    // Call LLM
    const response = await this.llmClient.complete({
      model: agent.model,
      prompt,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
    })
    
    // Track cost
    await AICostTracker.trackUsage(
      agent.workspace_id,
      agent.model,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    )
    
    return {
      output: response.content,
      tokens: response.usage,
      cost: response.cost,
    }
  }

  private topologicalSort(tasks: Task[]): Task[] {
    // Implement dependency resolution
    const sorted = []
    const visited = new Set()
    
    function visit(task: Task) {
      if (visited.has(task.id)) return
      
      // Visit dependencies first
      for (const depId of task.dependencies) {
        const dep = tasks.find(t => t.id === depId)
        if (dep) visit(dep)
      }
      
      visited.add(task.id)
      sorted.push(task)
    }
    
    tasks.forEach(visit)
    return sorted
  }
}
```

---

### 4. Monitoring Dashboard

#### Backend Metrics Collection
```typescript
// lib/monitoring/metrics.ts
export class MetricsCollector {
  static async recordWorkflowExecution(
    workflowId: string,
    status: 'success' | 'failed',
    duration: number,
    cost: number
  ) {
    await supabase.from('workflow_runs').insert({
      workflow_id: workflowId,
      status,
      duration_ms: duration,
      cost_usd: cost,
    })
  }

  static async getMetrics(workspaceId: string, timeRange: string) {
    const { data } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('start_time', this.getTimeRangeStart(timeRange))

    return {
      totalRuns: data.length,
      successRate: data.filter(r => r.status === 'success').length / data.length,
      avgDuration: data.reduce((acc, r) => acc + r.duration_ms, 0) / data.length,
      totalCost: data.reduce((acc, r) => acc + r.cost_usd, 0),
    }
  }
}
```

#### Frontend Dashboard
```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* KPI Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Total Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">156</div>
          <p className="text-sm text-green-600">+12% from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">98.5%</div>
          <p className="text-sm text-green-600">+2.3% from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2.3s</div>
          <p className="text-sm text-red-600">+0.5s from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Cost (MTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$45.20</div>
          <p className="text-sm text-muted-foreground">Budget: $100</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Workflow Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="executions" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={costData} dataKey="value" nameKey="name" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📦 FILE STRUCTURE

### New Files to Create

```
lib/
├── integrations/
│   ├── base.ts                    # Base integration class
│   ├── registry.ts                # Integration registry
│   ├── oauth-handler.ts           # OAuth flow manager
│   ├── slack/
│   │   ├── index.ts
│   │   ├── oauth.ts
│   │   └── api.ts
│   ├── github/
│   │   └── ...
│   ├── notion/
│   │   └── ...
│   └── ... (47 more)
│
├── execution/
│   ├── agent-runner.ts            # Agent execution engine
│   ├── task-queue.ts              # Task queue management
│   ├── dependency-resolver.ts     # Task dependency resolution
│   └── error-handler.ts           # Retry logic & error handling
│
├── monitoring/
│   ├── metrics.ts                 # Metrics collection
│   ├── cost-tracker.ts            # AI cost tracking
│   ├── alerting.ts                # Alert system
│   └── health-check.ts            # Health check utilities
│
└── llm/
    ├── client.ts                  # Unified LLM client
    ├── openai.ts                  # OpenAI implementation
    ├── gemini.ts                  # Gemini implementation
    └── token-counter.ts           # Token counting utilities

app/
├── api/
│   ├── health/route.ts            # Health check endpoint
│   ├── metrics/route.ts           # Metrics endpoint
│   ├── integrations/
│   │   ├── [id]/
│   │   │   ├── auth/route.ts      # OAuth callback
│   │   │   ├── test/route.ts      # Test connection
│   │   │   └── webhook/route.ts   # Webhook handler
│   │   └── route.ts               # List integrations
│   └── execution/
│       ├── start/route.ts         # Start workflow execution
│       ├── status/route.ts        # Check execution status
│       └── stop/route.ts          # Stop execution
│
├── dashboard/
│   └── page.tsx                   # Monitoring dashboard
│
├── integrations/
│   ├── page.tsx                   # Integration marketplace
│   ├── [id]/
│   │   ├── page.tsx               # Integration detail
│   │   └── setup/page.tsx         # Setup wizard
│   └── custom/
│       └── page.tsx               # Custom integration builder
│
└── settings/
    ├── billing/page.tsx           # Usage & billing
    └── budget/page.tsx            # Budget settings

components/
├── cost-tracker-widget.tsx        # Cost tracking widget
├── integration-card.tsx           # Integration card component
├── metrics-chart.tsx              # Metrics visualization
└── budget-alert.tsx               # Budget alert component
```

---

## 🔐 Environment Variables Needed

```bash
# .env.local additions

# AI Providers
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Monitoring
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Integrations - Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

# Integrations - GitHub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Integrations - Notion
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...

# Email (SendGrid)
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...

# Stripe (Future)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
```typescript
// __tests__/lib/cost-tracker.test.ts
describe('AICostTracker', () => {
  it('calculates GPT-4o-mini cost correctly', () => {
    const cost = AICostTracker.calculateCost('gpt-4o-mini', 1000, 1000)
    expect(cost).toBe(0.00075) // $0.00075
  })

  it('sends alert when budget threshold reached', async () => {
    // Test alert logic
  })
})

// __tests__/lib/agent-runner.test.ts
describe('AgentExecutionEngine', () => {
  it('resolves task dependencies correctly', () => {
    // Test topological sort
  })

  it('executes workflow with correct order', async () => {
    // Test execution flow
  })
})
```

### Integration Tests
```typescript
// __tests__/api/integrations/slack.test.ts
describe('Slack Integration', () => {
  it('completes OAuth flow', async () => {
    // Test OAuth
  })

  it('sends message successfully', async () => {
    // Test message sending
  })
})
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Production
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Load testing completed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring setup
- [ ] Alerting configured
- [ ] Backup system tested

### Production
- [ ] Deploy to Vercel/production
- [ ] Run database migrations
- [ ] Enable monitoring
- [ ] Test critical paths
- [ ] Monitor for 24h
- [ ] Document any issues
- [ ] Prepare rollback plan

---

**Status**: ✅ ARHITEKTURA PLAN COMPLETE  
**Next Step**: Započeti implementaciju po prioritetima iz PRIORITET_LISTA.md  
**Estimated Time**: 4-6 nedelja za sve kritične feature  
**Risk Level**: MEDIUM (clear plan, solid foundation)

