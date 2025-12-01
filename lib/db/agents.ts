import { prisma } from "@/lib/prisma"
import type { Agent } from "@prisma/client"

export async function getAgents() {
  return await prisma.agent.findMany({
    orderBy: { created_at: "desc" },
  })
}

export async function getAgentById(id: string) {
  return await prisma.agent.findUnique({
    where: { id },
    include: {
      tasks: true,
      execution_traces: {
        orderBy: { start_time: "desc" },
        take: 10,
      },
    },
  })
}

export async function createAgent(data: Omit<Agent, "id" | "created_at" | "updated_at">) {
  return await prisma.agent.create({
    data,
  })
}

export async function updateAgent(id: string, data: Partial<Agent>) {
  return await prisma.agent.update({
    where: { id },
    data,
  })
}

export async function deleteAgent(id: string) {
  return await prisma.agent.delete({
    where: { id },
  })
}

export async function getAgentStats() {
  const [total, active, idle, error] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "active" } }),
    prisma.agent.count({ where: { status: "idle" } }),
    prisma.agent.count({ where: { status: "error" } }),
  ])

  return { total, active, idle, error }
}
