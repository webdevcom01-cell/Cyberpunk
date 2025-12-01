"use client"

import { useEffect } from "react"
import { useRealtimeConnection } from "@/lib/hooks/use-realtime-connection"
import { toast } from "sonner"

export function ConnectionToast() {
  const { status } = useRealtimeConnection()

  useEffect(() => {
    if (status === "connected") {
      toast.success("Real-time connection established", {
        id: "connection-status",
      })
    } else if (status === "disconnected") {
      toast.warning("Real-time connection lost", {
        id: "connection-status",
        description: "Attempting to reconnect...",
      })
    } else if (status === "error") {
      toast.error("Connection error", {
        id: "connection-status",
        description: "Failed to establish real-time connection",
      })
    }
  }, [status])

  return null
}
