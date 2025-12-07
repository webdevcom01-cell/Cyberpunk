"use client"

import type React from "react"

import { useEffect } from "react"
import { ThemeProvider } from "next-themes"
import { initSentry } from "@/lib/sentry"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSentry()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
