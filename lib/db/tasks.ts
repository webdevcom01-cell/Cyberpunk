import { prisma } from "@/lib/prisma"
import type { Task } from "@prisma/client"

export async function getTasks() {
  return await prisma.task.findMany({
    include: { agent: true },
    orderBy: { created_at: "desc" },
  })
}

export async function getTaskById(id: string) {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      agent: true,
      execution_traces: {
        orderBy: { start_time: "desc" },
        take: 10,
      },
    },
  })
}

export async function createTask(data: Omit<Task, "id" | "created_at" | "updated_at">) {
  return await prisma.task.create({
    data,
  })
}

export async function updateTask(id: string, data: Partial<Task>) {
  return await prisma.task.update({
    where: { id },
    data,
  })
}

export async function deleteTask(id: string) {
  return await prisma.task.delete({
    where: { id },
  })
}

export async function getTaskStats() {
  const [total, pending, running, completed, failed] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "pending" } }),
    prisma.task.count({ where: { status: "running" } }),
    prisma.task.count({ where: { status: "completed" } }),
    prisma.task.count({ where: { status: "failed" } }),
  ])

  return { total, pending, running, completed, failed }
}
