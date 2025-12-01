"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg border border-primary/30 bg-card/80">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" aria-hidden="true" />
        <p className="text-xs md:text-sm font-mono text-primary tracking-wider">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  )
}
