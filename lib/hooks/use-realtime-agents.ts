"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Agent } from "@/lib/types"
import { toast } from "sonner"
import { useRealtimeConnection } from "./use-realtime-connection"

export function useRealtimeAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected, status: connectionStatus } = useRealtimeConnection()

  useEffect(() => {
    const supabase = createClient()

    const fetchAgents = async () => {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_agents")

        if (!rpcError && rpcData) {
          setAgents(rpcData)
          setLoading(false)
          return
        }

        const { data } = await supabase.from("agents").select("*").order("created_at", { ascending: false })

        if (data) {
          setAgents(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()

    if (!isConnected) return

    const channel = supabase
      .channel("agents_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAgents((current) => [payload.new as Agent, ...current])
            toast.success(`New agent "${(payload.new as Agent).name}" created`)
          } else if (payload.eventType === "UPDATE") {
            setAgents((current) =>
              current.map((agent) => (agent.id === payload.new.id ? (payload.new as Agent) : agent)),
            )
            toast.info(`Agent "${(payload.new as Agent).name}" updated`)
          } else if (payload.eventType === "DELETE") {
            setAgents((current) => current.filter((agent) => agent.id !== payload.old.id))
            toast.info("Agent deleted")
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isConnected])

  return { agents, loading, connectionStatus, isConnected }
}
