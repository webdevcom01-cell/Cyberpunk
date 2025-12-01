"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Task } from "@/lib/types"
import { toast } from "sonner"

export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  useEffect(() => {
    const supabase = createClient()

    const fetchTasks = async () => {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_tasks")

        if (!rpcError && rpcData) {
          setTasks(rpcData)
          setLoading(false)
          return
        }

        const { data } = await supabase.from("tasks").select("*").order("execution_order", { ascending: true })

        if (data) {
          setTasks(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()

    const channel = supabase
      .channel("tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((current) =>
              [...current, payload.new as Task].sort((a, b) => (a.execution_order || 0) - (b.execution_order || 0)),
            )
            toast.success(`Task "${(payload.new as Task).name}" created`)
          } else if (payload.eventType === "UPDATE") {
            setTasks((current) => current.map((task) => (task.id === payload.new.id ? (payload.new as Task) : task)))
            const updatedTask = payload.new as Task
            if (updatedTask.status === "completed") {
              toast.success(`Task "${updatedTask.name}" completed`)
            } else if (updatedTask.status === "failed") {
              toast.error(`Task "${updatedTask.name}" failed`)
            }
          } else if (payload.eventType === "DELETE") {
            setTasks((current) => current.filter((task) => task.id !== payload.old.id))
            toast.info("Task deleted")
          }
        },
      )
      .on("system", {}, (payload) => {
        if (payload.status === "SUBSCRIBED") {
          setConnectionStatus("connected")
        } else if (payload.status === "CLOSED" || payload.status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected")
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { tasks, loading, connectionStatus }
}
