"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-8 md:py-16 px-4 text-center", className)}
      role="status"
    >
      <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-sm md:text-base font-bold text-primary tracking-wider mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm" className="h-11">
          {action.label}
        </Button>
      )}
    </div>
  )
}
