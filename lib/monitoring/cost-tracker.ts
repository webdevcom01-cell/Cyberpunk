// AI Cost Tracker - Core tracking functionality
// Tracks token usage and costs for AI API calls

import { createClient } from '@/lib/supabase/server'

// Pricing per 1,000 tokens (as of Dec 2024)
export const AI_PRICING = {
  'gpt-4o-mini': {
    input: 0.00015,   // $0.15 per 1M input tokens
    output: 0.0006,   // $0.60 per 1M output tokens
  },
  'gpt-4o': {
    input: 0.0025,    // $2.50 per 1M input tokens
    output: 0.01,     // $10.00 per 1M output tokens
  },
  'gemini-1.5-flash': {
    input: 0.000075,  // $0.075 per 1M input tokens
    output: 0.0003,   // $0.30 per 1M output tokens
  },
  'gemini-1.5-pro': {
    input: 0.00125,   // $1.25 per 1M input tokens
    output: 0.005,    // $5.00 per 1M output tokens
  },
  'claude-3-5-sonnet': {
    input: 0.003,     // $3.00 per 1M input tokens
    output: 0.015,    // $15.00 per 1M output tokens
  },
} as const

export type AIModel = keyof typeof AI_PRICING

interface UsageMetrics {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  model: AIModel
}

export class AICostTracker {
  /**
   * Calculate cost for AI API call
   */
  static calculateCost(
    model: AIModel,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = AI_PRICING[model]
    if (!pricing) {
      console.warn(`Unknown model: ${model}, returning 0 cost`)
      return 0
    }

    const inputCost = (inputTokens / 1000) * pricing.input
    const outputCost = (outputTokens / 1000) * pricing.output
    const totalCost = inputCost + outputCost

    return Math.round(totalCost * 1000000) / 1000000 // Round to 6 decimals
  }

  /**
   * Track usage for a workspace
   */
  static async trackUsage(
    workspaceId: string,
    model: AIModel,
    inputTokens: number,
    outputTokens: number,
    traceId?: string
  ): Promise<UsageMetrics> {
    try {
      const cost = this.calculateCost(model, inputTokens, outputTokens)
      const totalTokens = inputTokens + outputTokens

      const supabase = await createClient()

      // Update execution trace if provided
      if (traceId) {
        await supabase
          .from('execution_traces')
          .update({
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
            model_used: model,
            cost_usd: cost,
          })
          .eq('id', traceId)
      }

      // Increment workspace usage
      const { error } = await supabase.rpc('increment_workspace_usage', {
        p_workspace_id: workspaceId,
        p_tokens: totalTokens,
        p_cost: cost,
      })

      if (error) {
        console.error('Failed to increment workspace usage:', error)
      }

      // Check budget and send alerts if needed
      await this.checkBudget(workspaceId)

      return {
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        model,
      }
    } catch (error) {
      console.error('Error tracking AI usage:', error)
      throw error
    }
  }

  /**
   * Check if workspace is over budget and send alerts
   */
  static async checkBudget(workspaceId: string): Promise<void> {
    try {
      const supabase = await createClient()

      const { data: budgetCheck, error } = await supabase.rpc(
        'check_workspace_budget',
        { p_workspace_id: workspaceId }
      )

      if (error || !budgetCheck || budgetCheck.length === 0) {
        return
      }

      const check = budgetCheck[0]
      const usagePercent = check.usage_percent || 0

      // Budget exceeded - pause workflows
      if (check.is_over_budget) {
        await this.pauseWorkflows(workspaceId)
        await this.sendAlert(workspaceId, 'budget_exceeded', {
          currentUsage: check.current_usage,
          budgetLimit: check.budget_limit,
          usagePercent,
        })
      }
      // Threshold reached (default 80%) - send warning
      else if (usagePercent >= 80) {
        await this.sendAlert(workspaceId, 'threshold', {
          currentUsage: check.current_usage,
          budgetLimit: check.budget_limit,
          usagePercent,
        })
      }
    } catch (error) {
      console.error('Error checking budget:', error)
    }
  }

  /**
   * Pause all workflows for a workspace
   */
  private static async pauseWorkflows(workspaceId: string): Promise<void> {
    try {
      const supabase = await createClient()

      // Update workspace_usage to paused
      await supabase
        .from('workspace_usage')
        .update({ paused: true })
        .eq('workspace_id', workspaceId)
        .eq('period_start', this.getCurrentPeriodStart())

      // TODO: Stop any running workflow executions
      console.log(`Workflows paused for workspace: ${workspaceId}`)
    } catch (error) {
      console.error('Error pausing workflows:', error)
    }
  }

  /**
   * Send budget alert
   */
  private static async sendAlert(
    workspaceId: string,
    alertType: 'threshold' | 'budget_exceeded',
    data: { currentUsage: number; budgetLimit: number; usagePercent: number }
  ): Promise<void> {
    try {
      const supabase = await createClient()

      const message =
        alertType === 'budget_exceeded'
          ? `⚠️ Budget exceeded! You've used $${data.currentUsage} of your $${data.budgetLimit} budget (${data.usagePercent}%). Workflows have been paused.`
          : `⚡ Budget alert: You've used $${data.currentUsage} of your $${data.budgetLimit} budget (${data.usagePercent}%).`

      // Check if we already sent this alert recently (within 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const { data: recentAlerts } = await supabase
        .from('cost_alerts')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('alert_type', alertType)
        .gte('sent_at', oneHourAgo.toISOString())
        .limit(1)

      if (recentAlerts && recentAlerts.length > 0) {
        // Already sent alert recently, skip
        return
      }

      // Insert alert
      await supabase.from('cost_alerts').insert({
        workspace_id: workspaceId,
        alert_type: alertType,
        message,
        current_usage: data.currentUsage,
        budget_limit: data.budgetLimit,
      })

      // TODO: Send email notification
      console.log(`Alert sent to workspace ${workspaceId}: ${message}`)
    } catch (error) {
      console.error('Error sending alert:', error)
    }
  }

  /**
   * Get current billing period start
   */
  private static getCurrentPeriodStart(): string {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }

  /**
   * Get usage statistics for a workspace
   */
  static async getUsageStats(workspaceId: string) {
    try {
      const supabase = await createClient()

      const { data: usage, error } = await supabase
        .from('workspace_usage')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('period_start', this.getCurrentPeriodStart())
        .single()

      if (error) {
        return {
          totalTokens: 0,
          totalCost: 0,
          budgetLimit: null,
          usagePercent: 0,
          paused: false,
        }
      }

      const usagePercent = usage.budget_limit_usd
        ? (usage.total_cost_usd / usage.budget_limit_usd) * 100
        : 0

      return {
        totalTokens: usage.total_tokens || 0,
        totalCost: parseFloat(usage.total_cost_usd || '0'),
        budgetLimit: usage.budget_limit_usd ? parseFloat(usage.budget_limit_usd) : null,
        usagePercent: Math.round(usagePercent * 100) / 100,
        paused: usage.paused || false,
      }
    } catch (error) {
      console.error('Error getting usage stats:', error)
      throw error
    }
  }

  /**
   * Set budget for a workspace
   */
  static async setBudget(workspaceId: string, budgetLimit: number): Promise<void> {
    try {
      const supabase = await createClient()

      await supabase
        .from('workspace_usage')
        .upsert({
          workspace_id: workspaceId,
          period_start: this.getCurrentPeriodStart(),
          period_end: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1
          ).toISOString(),
          budget_limit_usd: budgetLimit,
        })

      console.log(`Budget set to $${budgetLimit} for workspace ${workspaceId}`)
    } catch (error) {
      console.error('Error setting budget:', error)
      throw error
    }
  }
}
