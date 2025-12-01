"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const keyMatch = event.key?.toLowerCase() === shortcut.key?.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export function GlobalKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: ShortcutConfig[] = [
    {
      key: "k",
      ctrl: true,
      action: () => toast.info("Command palette coming soon!"),
      description: "Open command palette",
    },
    {
      key: "1",
      ctrl: true,
      action: () => router.push("/"),
      description: "Go to Overview",
    },
    {
      key: "2",
      ctrl: true,
      action: () => router.push("/agents"),
      description: "Go to Agents",
    },
    {
      key: "3",
      ctrl: true,
      action: () => router.push("/tasks"),
      description: "Go to Tasks",
    },
    {
      key: "4",
      ctrl: true,
      action: () => router.push("/workflows"),
      description: "Go to Workflows",
    },
    {
      key: "/",
      ctrl: true,
      action: () =>
        toast.info(
          "Keyboard shortcuts:\n• Ctrl+K: Command palette\n• Ctrl+1-4: Navigate pages\n• Escape: Close dialogs",
        ),
      description: "Show keyboard shortcuts",
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return null
}
