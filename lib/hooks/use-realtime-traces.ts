"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ExecutionTrace } from "@/lib/types"
import { toast } from "sonner"

export function useRealtimeTraces() {
  const [traces, setTraces] = useState<ExecutionTrace[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  useEffect(() => {
    const supabase = createClient()

    const fetchTraces = async () => {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_execution_traces", { limit_count: 50 })

        if (!rpcError && rpcData) {
          setTraces(rpcData)
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from("execution_traces")
          .select("*")
          .order("start_time", { ascending: false })
          .limit(50)

        if (data) {
          setTraces(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch traces:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTraces()

    const channel = supabase
      .channel("execution_traces_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "execution_traces",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTraces((current) => [payload.new as ExecutionTrace, ...current].slice(0, 50))
            const trace = payload.new as ExecutionTrace
            if (trace.span_type === "workflow") {
              toast.info(`Workflow execution started: ${trace.span_name}`)
            }
          } else if (payload.eventType === "UPDATE") {
            setTraces((current) =>
              current.map((trace) => (trace.id === payload.new.id ? (payload.new as ExecutionTrace) : trace)),
            )
            const trace = payload.new as ExecutionTrace
            if (trace.status === "completed" && trace.span_type === "workflow") {
              toast.success(`Workflow "${trace.span_name}" completed successfully`)
            } else if (trace.status === "failed" && trace.span_type === "workflow") {
              toast.error(`Workflow "${trace.span_name}" failed`)
            }
          } else if (payload.eventType === "DELETE") {
            setTraces((current) => current.filter((trace) => trace.id !== payload.old.id))
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

  return { traces, loading, connectionStatus }
}
