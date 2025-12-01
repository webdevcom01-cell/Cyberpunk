"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import * as Sentry from "@sentry/react"
import { Button } from "./ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error)

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-red-500/20 bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred. Our team has been notified.
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="rounded-md bg-red-500/10 p-4 text-left">
                  <p className="font-mono text-xs text-red-500">{this.state.error.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
