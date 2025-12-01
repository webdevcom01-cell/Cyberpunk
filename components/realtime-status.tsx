"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useRealtimeConnection } from "@/lib/hooks/use-realtime-connection"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function RealtimeStatus() {
  const { status, reconnectAttempts, reconnect, isConnected, isConnecting, hasError } = useRealtimeConnection()

  const getStatusColor = () => {
    if (isConnected) return "default"
    if (isConnecting) return "secondary"
    if (hasError) return "destructive"
    return "secondary"
  }

  const getStatusText = () => {
    if (isConnected) return "Live"
    if (isConnecting) return "Connecting..."
    if (hasError) return "Error"
    return "Offline"
  }

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-3 w-3" />
    if (isConnecting) return <RefreshCw className="h-3 w-3 animate-spin" />
    return <WifiOff className="h-3 w-3" />
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant={getStatusColor()} className="gap-1 cursor-pointer hover:opacity-80 transition-opacity">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Real-time Connection</h4>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{status}</span>
            </p>
            {reconnectAttempts > 0 && (
              <p className="text-sm text-muted-foreground">
                Reconnect attempts: <span className="font-medium">{reconnectAttempts}</span>
              </p>
            )}
          </div>

          {!isConnected && (
            <Button onClick={reconnect} size="sm" className="w-full gap-2" disabled={isConnecting}>
              <RefreshCw className={`h-4 w-4 ${isConnecting ? "animate-spin" : ""}`} />
              {isConnecting ? "Reconnecting..." : "Reconnect"}
            </Button>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Live updates for:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Agents</li>
              <li>Tasks</li>
              <li>Workflows</li>
              <li>Execution traces</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
