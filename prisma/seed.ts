import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  const hashedPassword = await bcrypt.hash("demo123", 10)
  const user = await prisma.user.upsert({
    where: { email: "demo@crewai.com" },
    update: {},
    create: {
      email: "demo@crewai.com",
      password: hashedPassword,
      name: "Demo User",
      emailVerified: true,
    },
  })

  console.log("✓ Created user:", user.email)

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      plan: "pro",
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  })

  console.log("✓ Created workspace:", workspace.name)

  const researchAgent = await prisma.agent.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      workspaceId: workspace.id,
      createdById: user.id,
      name: "Research Analyst",
      role: "Senior Researcher",
      goal: "Conduct comprehensive research and analysis on given topics",
      backstory: "Expert researcher with 10+ years of experience in data analysis and market research",
      model: "openai/gpt-4.1",
      tools: ["web_search", "data_analysis"],
      status: "active",
      total_executions: 156,
      success_rate: 94.5,
      avg_response_time: 2800,
    },
  })

  const codeAgent = await prisma.agent.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      workspaceId: workspace.id,
      createdById: user.id,
      name: "Code Generator",
      role: "Senior Developer",
      goal: "Generate high-quality, production-ready code",
      backstory: "Full-stack developer specializing in TypeScript, Python, and modern frameworks",
      model: "anthropic/claude-sonnet-4",
      tools: ["code_interpreter", "file_system"],
      status: "active",
      total_executions: 89,
      success_rate: 91.2,
      avg_response_time: 3200,
    },
  })

  const writerAgent = await prisma.agent.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      workspaceId: workspace.id,
      createdById: user.id,
      name: "Content Writer",
      role: "Creative Writer",
      goal: "Create engaging and SEO-optimized content",
      backstory: "Professional content writer with expertise in technical and creative writing",
      model: "openai/gpt-4.1",
      tools: ["web_search", "grammar_check"],
      status: "idle",
      total_executions: 234,
      success_rate: 96.8,
      avg_response_time: 1900,
    },
  })

  console.log("✓ Created agents:", {
    researchAgent: researchAgent.name,
    codeAgent: codeAgent.name,
    writerAgent: writerAgent.name,
  })

  const task1 = await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0000-000000000011" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000011",
      workspaceId: workspace.id,
      name: "Market Analysis",
      description: "Analyze current market trends and competitor landscape",
      agent_id: researchAgent.id,
      priority: "high",
      expected_output: "Comprehensive market analysis report with actionable insights",
      status: "completed",
      execution_order: 1,
    },
  })

  const task2 = await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0000-000000000012" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000012",
      workspaceId: workspace.id,
      name: "API Development",
      description: "Develop RESTful API endpoints with proper error handling",
      agent_id: codeAgent.id,
      priority: "critical",
      expected_output: "Production-ready API code with tests",
      status: "running",
      execution_order: 2,
    },
  })

  const task3 = await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0000-000000000013" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000013",
      workspaceId: workspace.id,
      name: "Documentation",
      description: "Create comprehensive technical documentation",
      agent_id: writerAgent.id,
      priority: "medium",
      expected_output: "Clear and detailed documentation",
      status: "pending",
      execution_order: 3,
    },
  })

  console.log("✓ Created tasks:", {
    task1: task1.name,
    task2: task2.name,
    task3: task3.name,
  })

  const workflow = await prisma.workflow.upsert({
    where: { id: "00000000-0000-0000-0000-000000000021" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000021",
      workspaceId: workspace.id,
      name: "Product Launch",
      description: "Complete workflow for new product launch",
      agent_ids: [researchAgent.id, codeAgent.id, writerAgent.id],
      task_ids: [task1.id, task2.id, task3.id],
      status: "active",
    },
  })

  console.log("✓ Created workflow:", workflow.name)

  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
