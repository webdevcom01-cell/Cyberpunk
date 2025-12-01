import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const workflow = parseWorkflowFromPrompt(prompt)

    return NextResponse.json({
      workflow,
      draftId: `draft-${Date.now()}`,
    })
  } catch (error) {
    console.error("Error parsing workflow:", error)
    return NextResponse.json({ error: "Failed to parse workflow" }, { status: 500 })
  }
}

function parseWorkflowFromPrompt(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()

  const agents: Array<{ name: string; role: string; goal: string }> = []
  const tasks: Array<{ description: string; agent: string }> = []
  let schedule: string | undefined = undefined

  // Detect competitor analysis workflow
  if (lowerPrompt.includes("competitor") || lowerPrompt.includes("analysis") || lowerPrompt.includes("website")) {
    agents.push(
      { name: "Web Scraper Agent", role: "Data Collector", goal: "Scrape competitor websites for data" },
      { name: "Data Analyzer Agent", role: "Analyst", goal: "Analyze collected data and identify trends" },
      { name: "Report Writer Agent", role: "Writer", goal: "Generate comprehensive reports" },
    )
    tasks.push(
      { description: "Scrape competitor sites", agent: "Web Scraper Agent" },
      { description: "Extract key metrics", agent: "Data Analyzer Agent" },
      { description: "Compare with last week", agent: "Data Analyzer Agent" },
      { description: "Generate PDF report", agent: "Report Writer Agent" },
      { description: "Email to you", agent: "Report Writer Agent" },
    )
  }

  // Detect blog/content workflow
  if (lowerPrompt.includes("blog") || lowerPrompt.includes("content") || lowerPrompt.includes("write")) {
    agents.push(
      { name: "Research Agent", role: "Researcher", goal: "Research topics and gather information" },
      { name: "Writer Agent", role: "Content Writer", goal: "Write engaging blog posts" },
      { name: "SEO Agent", role: "SEO Specialist", goal: "Optimize content for search engines" },
    )
    tasks.push(
      { description: "Research topic", agent: "Research Agent" },
      { description: "Create outline", agent: "Writer Agent" },
      { description: "Write first draft", agent: "Writer Agent" },
      { description: "Optimize for SEO", agent: "SEO Agent" },
      { description: "Final review", agent: "Writer Agent" },
    )
  }

  // Detect social media workflow
  if (lowerPrompt.includes("social") || lowerPrompt.includes("twitter") || lowerPrompt.includes("instagram")) {
    agents.push(
      { name: "Content Creator Agent", role: "Creator", goal: "Create engaging social media content" },
      { name: "Scheduler Agent", role: "Scheduler", goal: "Schedule posts at optimal times" },
      { name: "Analytics Agent", role: "Analyst", goal: "Track engagement and performance" },
    )
    tasks.push(
      { description: "Create content calendar", agent: "Content Creator Agent" },
      { description: "Generate posts", agent: "Content Creator Agent" },
      { description: "Schedule posts", agent: "Scheduler Agent" },
      { description: "Monitor engagement", agent: "Analytics Agent" },
    )
  }

  // Detect email workflow
  if (lowerPrompt.includes("email") || lowerPrompt.includes("newsletter") || lowerPrompt.includes("send")) {
    agents.push(
      { name: "Email Writer Agent", role: "Writer", goal: "Write compelling email content" },
      { name: "Personalization Agent", role: "Personalizer", goal: "Personalize emails for each recipient" },
      { name: "Delivery Agent", role: "Sender", goal: "Send emails and track delivery" },
    )
    tasks.push(
      { description: "Write email template", agent: "Email Writer Agent" },
      { description: "Personalize content", agent: "Personalization Agent" },
      { description: "Send emails", agent: "Delivery Agent" },
      { description: "Track opens and clicks", agent: "Delivery Agent" },
    )
  }

  // Default workflow if nothing specific detected
  if (agents.length === 0) {
    agents.push(
      { name: "Assistant Agent", role: "General Assistant", goal: "Help with various tasks" },
      { name: "Executor Agent", role: "Task Executor", goal: "Execute assigned tasks efficiently" },
    )
    tasks.push(
      { description: "Analyze request", agent: "Assistant Agent" },
      { description: "Execute task", agent: "Executor Agent" },
      { description: "Review results", agent: "Assistant Agent" },
    )
  }

  // Detect schedule
  if (lowerPrompt.includes("every week") || lowerPrompt.includes("weekly")) {
    schedule = "Every Monday 9am"
  }
  if (lowerPrompt.includes("every day") || lowerPrompt.includes("daily")) {
    schedule = "Every day 9am"
  }
  if (lowerPrompt.includes("every month") || lowerPrompt.includes("monthly")) {
    schedule = "First Monday of month 9am"
  }

  return {
    agents,
    tasks,
    schedule,
    name: generateWorkflowName(prompt),
    description: prompt,
  }
}

function generateWorkflowName(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("competitor")) return "Competitor Analysis Workflow"
  if (lowerPrompt.includes("blog")) return "Blog Content Workflow"
  if (lowerPrompt.includes("social")) return "Social Media Workflow"
  if (lowerPrompt.includes("email")) return "Email Campaign Workflow"
  if (lowerPrompt.includes("report")) return "Report Generation Workflow"

  return "Custom AI Workflow"
}
