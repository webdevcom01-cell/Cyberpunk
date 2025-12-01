"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function WorkflowsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Workflows Error]:", error)
  }, [error])

  return (
    <div className="container mx-auto p-6">
      <Card className="border-red-500/20 bg-red-950/10 p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-500">Failed to Load Workflows</h3>
            <p className="text-sm text-muted-foreground">{error.message || "Unable to fetch workflows data"}</p>
          </div>

          <Button variant="outline" size="sm" onClick={reset} className="gap-2 bg-transparent">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    </div>
  )
}
