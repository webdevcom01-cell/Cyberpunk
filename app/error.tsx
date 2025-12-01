"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("[App Error]:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md border-red-500/20 bg-red-950/10 p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Error Icon */}
          <div className="rounded-full bg-red-500/20 p-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-500">Application Error</h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "Something went wrong while loading this page"}
            </p>
            {error.digest && <p className="text-xs text-muted-foreground/60">Error ID: {error.digest}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={reset} className="gap-2 bg-transparent">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="default" size="sm" asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">If this problem persists, please contact support</p>
        </div>
      </Card>
    </div>
  )
}
