"use client"
import { useState, useEffect } from "react"

interface AnnouncementProps {
  message: string
  politeness?: "polite" | "assertive"
  clearAfter?: number
}

export function Announcement({ message, politeness = "polite", clearAfter = 5000 }: AnnouncementProps) {
  const [announcement, setAnnouncement] = useState(message)

  useEffect(() => {
    setAnnouncement(message)

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setAnnouncement("")
      }, clearAfter)

      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  )
}

// Hook for programmatic announcements
export function useAnnouncement() {
  const [message, setMessage] = useState("")

  const announce = (text: string) => {
    setMessage("")
    // Force re-render for screen readers
    setTimeout(() => setMessage(text), 100)
  }

  return { message, announce }
}
