import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"
import { StarfieldBackground } from "@/components/starfield-background"
import { Toaster } from "@/components/ui/sonner"
import { SkipLink } from "@/components/skip-link"
import { GlobalKeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CrewAI Orchestrator",
  description: "Multi-Agent AI Orchestration Platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.className} antialiased`}>
        <ErrorBoundary>
          <SkipLink />
          <StarfieldBackground />
          <div className="relative z-10">{children}</div>
          <Toaster />
          <GlobalKeyboardShortcuts />
        </ErrorBoundary>
      </body>
    </html>
  )
}
