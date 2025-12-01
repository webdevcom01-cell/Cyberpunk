"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Workflow } from "@/lib/types"
import { toast } from "sonner"

export function useRealtimeWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  useEffect(() => {
    const supabase = createClient()

    const fetchWorkflows = async () => {
      try {
        // Try RPC function first
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_workflows")

        if (!rpcError && rpcData) {
          setWorkflows(rpcData)
          setLoading(false)
          return
        }

        // Fallback to direct query
        const { data } = await supabase.from("workflows").select("*").order("created_at", { ascending: false })

        if (data) {
          setWorkflows(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch workflows:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()

    const channel = supabase
      .channel("workflows_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflows",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setWorkflows((current) => [payload.new as Workflow, ...current])
            toast.success(`New workflow "${(payload.new as Workflow).name}" created`)
          } else if (payload.eventType === "UPDATE") {
            setWorkflows((current) =>
              current.map((workflow) => (workflow.id === payload.new.id ? (payload.new as Workflow) : workflow)),
            )
            toast.info(`Workflow "${(payload.new as Workflow).name}" updated`)
          } else if (payload.eventType === "DELETE") {
            setWorkflows((current) => current.filter((workflow) => workflow.id !== payload.old.id))
            toast.info("Workflow deleted")
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

  return { workflows, loading, connectionStatus }
}
