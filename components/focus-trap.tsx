"use client"

import type * as React from "react"
import { useCallback, useEffect, useRef } from "react"

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  onEscape?: () => void
}

export function FocusTrap({ children, active = true, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return

      if (e.key === "Escape" && onEscape) {
        onEscape()
        return
      }

      if (e.key !== "Tab") return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    [active, getFocusableElements, onEscape],
  )

  useEffect(() => {
    if (!active) return

    document.addEventListener("keydown", handleKeyDown)

    // Focus first element on mount
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [active, getFocusableElements, handleKeyDown])

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
