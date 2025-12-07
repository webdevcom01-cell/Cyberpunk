"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

interface UseRealtimeConnectionOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  maxReconnectAttempts?: number
  reconnectInterval?: number
}

export function useRealtimeConnection(options: UseRealtimeConnectionOptions = {}) {
  const { onConnect, onDisconnect, onError, maxReconnectAttempts = 5, reconnectInterval = 3000 } = options

  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const supabase = createClient()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  const connect = useCallback(() => {
    setStatus("connecting")

    try {
      // Create a test channel to monitor connection
      const channel = supabase.channel("connection-monitor")

      channel
        .on("presence", { event: "sync" }, () => {
          setStatus("connected")
          setReconnectAttempts(0)
          onConnect?.()
          toast.success("Real-time connection established")
        })
        .on("presence", { event: "join" }, () => {
          setStatus("connected")
        })
        .on("presence", { event: "leave" }, () => {
          setStatus("disconnected")
          onDisconnect?.()
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setStatus("connected")
            setReconnectAttempts(0)
            onConnect?.()
          } else if (status === "CHANNEL_ERROR") {
            setStatus("error")
            handleReconnect()
          } else if (status === "TIMED_OUT") {
            setStatus("disconnected")
            handleReconnect()
          }
        })

      channelRef.current = channel
    } catch (error) {
      setStatus("error")
      onError?.(error as Error)
      handleReconnect()
    }
  }, [supabase, onConnect, onDisconnect, onError])

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setStatus("error")
      toast.error("Failed to establish real-time connection after multiple attempts")
      return
    }

    setReconnectAttempts((prev) => prev + 1)
    toast.info(`Reconnecting... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)

    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, reconnectInterval * Math.pow(2, reconnectAttempts)) // Exponential backoff
  }, [reconnectAttempts, maxReconnectAttempts, reconnectInterval, connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    setStatus("disconnected")
  }, [supabase])

  const reconnect = useCallback(() => {
    disconnect()
    setReconnectAttempts(0)
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    status,
    reconnectAttempts,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    hasError: status === "error",
    reconnect,
    disconnect,
  }
}
