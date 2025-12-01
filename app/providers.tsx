"use client"

import type React from "react"

import { useEffect } from "react"
import { initSentry } from "@/lib/sentry"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSentry()
  }, [])

  return <>{children}</>
}
