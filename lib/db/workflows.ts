import { prisma } from "@/lib/prisma"
import type { Workflow } from "@prisma/client"

export async function getWorkflows() {
  return await prisma.workflow.findMany({
    orderBy: { created_at: "desc" },
  })
}

export async function getWorkflowById(id: string) {
  return await prisma.workflow.findUnique({
    where: { id },
    include: {
      execution_traces: {
        orderBy: { start_time: "desc" },
        take: 20,
      },
    },
  })
}

export async function createWorkflow(data: Omit<Workflow, "id" | "created_at" | "updated_at">) {
  return await prisma.workflow.create({
    data,
  })
}

export async function updateWorkflow(id: string, data: Partial<Workflow>) {
  return await prisma.workflow.update({
    where: { id },
    data,
  })
}

export async function deleteWorkflow(id: string) {
  return await prisma.workflow.delete({
    where: { id },
  })
}

export async function getWorkflowStats() {
  const [total, draft, active, paused, completed, failed] = await Promise.all([
    prisma.workflow.count(),
    prisma.workflow.count({ where: { status: "draft" } }),
    prisma.workflow.count({ where: { status: "active" } }),
    prisma.workflow.count({ where: { status: "paused" } }),
    prisma.workflow.count({ where: { status: "completed" } }),
    prisma.workflow.count({ where: { status: "failed" } }),
  ])

  return { total, draft, active, paused, completed, failed }
}
