# 📋 SPRINT 1 - Task Breakdown (Nedelja 1-2)

**Sprint Cilj**: AI Cost Tracking + Top 10 Integracija  
**Start Datum**: 1. Decembar 2025  
**End Datum**: 14. Decembar 2025  
**Team Size**: TBD

---

## 🎯 SPRINT OBJECTIVES

### Primary Goals
1. ✅ AI Cost Tracking potpuno funkcionalan
2. ✅ 10 najvažnijih integracija implementirano
3. ✅ Monitoring dashboard live
4. ✅ Zero critical bugs

### Success Metrics
- [ ] Cost tracking sa 95%+ accuracy
- [ ] Sve 10 integracije testirane i rade
- [ ] Dashboard prikazuje real-time data
- [ ] Test coverage > 80%

---

## 📅 WEEK 1: AI Cost Tracking & Monitoring

### DAY 1-2: Cost Tracking Backend

#### Task 1.1: Database Schema (2h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Acceptance Criteria**:
- [x] ALTER execution_traces table (add token columns)
- [x] CREATE workspace_usage table
- [x] CREATE cost_alerts table
- [x] Add indexes for performance
- [x] Test migrations locally

**SQL File**: `scripts/011_add_cost_tracking.sql`

```sql
-- Add to execution_traces
ALTER TABLE execution_traces
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 6) DEFAULT 0;

-- Create workspace_usage
CREATE TABLE IF NOT EXISTS workspace_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 2) DEFAULT 0,
  budget_limit_usd DECIMAL(10, 2),
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, period_start)
);

-- Create cost_alerts
CREATE TABLE IF NOT EXISTS cost_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  current_usage DECIMAL(10, 2),
  budget_limit DECIMAL(10, 2),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_workspace_usage_workspace ON workspace_usage(workspace_id, period_start);
CREATE INDEX idx_cost_alerts_workspace ON cost_alerts(workspace_id, sent_at);
```

---

#### Task 1.2: Cost Tracker Library (4h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Files to Create**:
- `lib/monitoring/cost-tracker.ts`
- `lib/monitoring/token-counter.ts`
- `lib/monitoring/pricing.ts`

**Acceptance Criteria**:
- [x] Calculate cost za GPT-4o-mini, Gemini 1.5 Flash
- [x] Track usage per workspace
- [x] Check budget limits
- [x] Send alerts when threshold reached
- [x] Unit tests > 90% coverage

**Implementation Checklist**:
- [ ] Create pricing constants (per 1K tokens)
- [ ] Implement calculateCost() function
- [ ] Implement trackUsage() function
- [ ] Implement checkBudget() function
- [ ] Add alert sending logic
- [ ] Write 10+ unit tests
- [ ] Test with real API calls

---

#### Task 1.3: Integrate Cost Tracking into AI APIs (3h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Files to Modify**:
- `app/api/research/route.ts`
- `app/api/chat/route.ts`

**Acceptance Criteria**:
- [x] Count tokens u research endpoint
- [x] Count tokens u chat endpoint
- [x] Save token count to database
- [x] Calculate i save cost
- [x] Return usage info u response

**Code Changes**:
```typescript
// app/api/research/route.ts
import { AICostTracker } from '@/lib/monitoring/cost-tracker'

export async function POST(request: Request) {
  // ... existing code ...
  
  const response = await openai.chat.completions.create({...})
  
  // NEW: Track cost
  await AICostTracker.trackUsage(
    workspaceId,
    'gpt-4o-mini',
    response.usage.prompt_tokens,
    response.usage.completion_tokens
  )
  
  return NextResponse.json({
    result: response.choices[0].message.content,
    usage: {
      tokens: response.usage.total_tokens,
      cost: AICostTracker.calculateCost(
        'gpt-4o-mini',
        response.usage.prompt_tokens,
        response.usage.completion_tokens
      )
    }
  })
}
```

---

### DAY 3-4: Cost Dashboard & Budget Settings

#### Task 1.4: Cost Tracker Widget (4h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**File**: `components/cost-tracker-widget.tsx`

**Acceptance Criteria**:
- [x] Display current usage
- [x] Show progress bar (usage vs budget)
- [x] Display token count
- [x] Show cost breakdown by model
- [x] Link to detailed analytics
- [x] Real-time updates

**Component Structure**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>AI Usage & Cost</CardTitle>
    <CardDescription>Current billing period</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Progress Bar */}
    <Progress value={usagePercent} />
    
    {/* Current Cost */}
    <div className="text-3xl font-bold">${currentCost}</div>
    
    {/* Token Count */}
    <div>{totalTokens.toLocaleString()} tokens</div>
    
    {/* Model Breakdown */}
    <div>
      <div>GPT-4o-mini: $X.XX</div>
      <div>Gemini 1.5: $X.XX</div>
    </div>
    
    {/* Actions */}
    <Button>Set Budget</Button>
    <Button variant="outline">View Details</Button>
  </CardContent>
</Card>
```

---

#### Task 1.5: Budget Settings Page (3h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**File**: `app/settings/budget/page.tsx`

**Acceptance Criteria**:
- [x] Set monthly budget limit
- [x] Set alert threshold (%)
- [x] View historical usage
- [x] Configure alert emails
- [x] Pause workflows toggle

---

#### Task 1.6: Usage Analytics API (2h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**File**: `app/api/analytics/cost/route.ts`

**Endpoints**:
- `GET /api/analytics/cost?period=7d` - Get cost data
- `GET /api/analytics/cost/breakdown` - Get by model
- `GET /api/analytics/cost/history` - Historical data

---

### DAY 5: Testing & Bug Fixes

#### Task 1.7: Integration Testing (4h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Test Cases**:
- [ ] Cost calculation accuracy (compare with OpenAI dashboard)
- [ ] Budget alerts triggered correctly
- [ ] Workflows pause when budget exceeded
- [ ] Dashboard shows correct data
- [ ] Real-time updates work
- [ ] Edge cases (negative cost, zero tokens, etc)

---

#### Task 1.8: Documentation (2h)
**Assigned to**: TBD  
**Priority**: 🟡 MEDIUM

**Docs to Create**:
- [ ] How to set budget
- [ ] Understanding AI costs
- [ ] Budget alerts explained
- [ ] FAQ about billing

---

## 📅 WEEK 2: Top 10 Integrations

### Integration Priority List

1. **Slack** - Most requested
2. **GitHub** - Developer favorite
3. **Notion** - Popular for documentation
4. **Google Sheets** - Data operations
5. **Discord** - Community engagement
6. **Stripe** - Payment processing
7. **SendGrid** - Email sending
8. **Twilio** - SMS notifications
9. **Airtable** - Database operations
10. **Trello** - Project management

---

### DAY 6-7: Integration Framework + Slack

#### Task 2.1: Integration Framework (4h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Files to Create**:
- `lib/integrations/base.ts` - Base class
- `lib/integrations/registry.ts` - Registry
- `lib/integrations/oauth-handler.ts` - OAuth manager
- `lib/integrations/types.ts` - TypeScript types

**Acceptance Criteria**:
- [x] BaseIntegration class with standard methods
- [x] Integration registry system
- [x] OAuth flow handler
- [x] Type definitions
- [x] Error handling

---

#### Task 2.2: Slack Integration (6h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Files to Create**:
- `lib/integrations/slack/index.ts`
- `lib/integrations/slack/oauth.ts`
- `lib/integrations/slack/api.ts`
- `app/api/integrations/slack/auth/route.ts`
- `app/api/integrations/slack/webhook/route.ts`

**Features**:
- [ ] OAuth 2.0 flow
- [ ] Send message to channel
- [ ] List channels
- [ ] Get user info
- [ ] Handle incoming webhooks

**Test Cases**:
- [ ] OAuth flow completes successfully
- [ ] Message sent to #general
- [ ] Webhook receives message
- [ ] Error handling works

---

### DAY 8: GitHub Integration

#### Task 2.3: GitHub Integration (6h)
**Assigned to**: TBD  
**Priority**: 🔴 CRITICAL

**Features**:
- [ ] OAuth 2.0 flow
- [ ] Create issue
- [ ] Create PR
- [ ] Get repository info
- [ ] Handle webhooks (push, PR, etc)

**Use Cases**:
- Automatically create issue when workflow fails
- Post PR when agent generates code
- Track repo activity

---

### DAY 9: Notion + Google Sheets

#### Task 2.4: Notion Integration (3h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**Features**:
- [ ] OAuth flow
- [ ] Create page
- [ ] Update database
- [ ] Query database
- [ ] Get page content

---

#### Task 2.5: Google Sheets Integration (3h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**Features**:
- [ ] OAuth flow (Google API)
- [ ] Read spreadsheet
- [ ] Write to cells
- [ ] Append row
- [ ] Get sheet list

---

### DAY 10: Discord + Stripe

#### Task 2.6: Discord Integration (2h)
**Assigned to**: TBD  
**Priority**: 🟡 MEDIUM

**Features**:
- [ ] Webhook URL configuration
- [ ] Send message
- [ ] Send embed
- [ ] Bot commands (future)

---

#### Task 2.7: Stripe Integration (4h)
**Assigned to**: TBD  
**Priority**: 🟠 HIGH

**Features**:
- [ ] OAuth/API key setup
- [ ] Create payment intent
- [ ] List customers
- [ ] Create subscription
- [ ] Handle webhooks (payment success, etc)

---

### DAY 11-12: Final 5 Integrations

#### Task 2.8: SendGrid (1h)
**Features**: Send email, templates

#### Task 2.9: Twilio (1h)
**Features**: Send SMS, WhatsApp messages

#### Task 2.10: Airtable (2h)
**Features**: CRUD records, list bases

#### Task 2.11: Trello (2h)
**Features**: Create card, list boards

#### Task 2.12: Integration Marketplace UI (4h)
**File**: `app/integrations/page.tsx`

**Features**:
- [ ] List all integrations
- [ ] Search & filter
- [ ] Integration cards (icon, name, description)
- [ ] "Connect" button
- [ ] "Connected" status indicator
- [ ] "Setup Guide" link

---

### DAY 13-14: Testing & Polish

#### Task 2.13: Integration Testing (6h)
**Test Each Integration**:
- [ ] OAuth flow works
- [ ] API calls successful
- [ ] Error handling works
- [ ] Webhooks received
- [ ] UI shows correct status

#### Task 2.14: Integration Documentation (4h)
**For Each Integration**:
- [ ] Setup guide (how to get API keys)
- [ ] Example workflows
- [ ] Troubleshooting
- [ ] API reference

---

## 🧪 DEFINITION OF DONE

### For Each Task
- [ ] Code written and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests written
- [ ] Documentation updated
- [ ] Tested locally
- [ ] Tested on staging
- [ ] No critical bugs
- [ ] Performance acceptable

### For Sprint
- [ ] All tasks complete
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Demo prepared
- [ ] Deployed to staging
- [ ] Ready for production

---

## 🎬 DAILY STANDUP FORMAT

**What did you do yesterday?**
- Task completed
- Progress made
- Blockers encountered

**What will you do today?**
- Tasks planned
- Expected completion

**Any blockers?**
- Technical issues
- Dependency on others
- Resource needs

---

## 📊 SPRINT TRACKING

### Progress Dashboard

**Week 1** (Cost Tracking):
- [x] Day 1: Database schema ✅
- [x] Day 2: Cost tracker library ⏳
- [ ] Day 3: Dashboard UI 🔜
- [ ] Day 4: Budget settings 🔜
- [ ] Day 5: Testing & fixes 🔜

**Week 2** (Integrations):
- [ ] Day 6-7: Framework + Slack 🔜
- [ ] Day 8: GitHub 🔜
- [ ] Day 9: Notion + Sheets 🔜
- [ ] Day 10: Discord + Stripe 🔜
- [ ] Day 11-12: Final 5 + UI 🔜
- [ ] Day 13-14: Testing 🔜

**Legend**:
- ✅ Complete
- ⏳ In Progress
- 🔜 Not Started
- ⚠️ Blocked

---

## 🚨 RISK MANAGEMENT

### Identified Risks

**Risk 1: Integration API Rate Limits**
- **Impact**: HIGH
- **Probability**: MEDIUM
- **Mitigation**: Implement proper rate limiting, caching

**Risk 2: OAuth Flow Complexity**
- **Impact**: MEDIUM
- **Probability**: HIGH
- **Mitigation**: Use tested OAuth libraries, good docs

**Risk 3: Cost Calculation Accuracy**
- **Impact**: HIGH
- **Probability**: LOW
- **Mitigation**: Double-check with OpenAI/Gemini pricing, add tests

**Risk 4: Time Estimates Too Optimistic**
- **Impact**: MEDIUM
- **Probability**: MEDIUM
- **Mitigation**: Buffer time, prioritize ruthlessly

---

## 🎯 SPRINT REVIEW AGENDA

**Date**: 14. Decembar 2025  
**Duration**: 1 hour

**Agenda**:
1. Demo cost tracking system (10 min)
2. Demo each integration (20 min)
3. Show monitoring dashboard (10 min)
4. Discuss what went well (10 min)
5. Discuss what to improve (10 min)
6. Plan next sprint (10 min)

---

## 🚀 NEXT SPRINT PREVIEW

**Sprint 2 Focus**:
- Real AI agent execution engine
- Next 20 integrations
- Template marketplace beta
- Advanced analytics

**Estimated Start**: 15. Decembar 2025

---

**Status**: ✅ SPRINT 1 PLAN COMPLETE  
**Ready to Start**: YES  
**Team Assignment**: Pending  
**First Task**: Task 1.1 - Database Schema (Start NOW!)

