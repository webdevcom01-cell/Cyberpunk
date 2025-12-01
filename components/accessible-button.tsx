"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AccessibleButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, isLoading, loadingText, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "h-11 w-11",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{loadingText || "Loading..."}</span>
            <span className="sr-only">Please wait</span>
          </>
        ) : (
          children
        )}
      </Button>
    )
  },
)

AccessibleButton.displayName = "AccessibleButton"
