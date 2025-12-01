"use client"

import type React from "react"
import { UserDropdown } from "@/components/user-dropdown"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationCenter } from "@/components/notification-center"

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header
      className="flex min-h-14 md:h-16 items-center justify-between border-b border-primary/20 bg-card/30 backdrop-blur-md px-3 md:px-6 scanlines flex-wrap gap-2 py-2"
      role="banner"
    >
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <MobileNav />
        <div className="min-w-0 flex-1">
          <h1
            id="main-content"
            className="text-xs sm:text-sm md:text-lg font-bold text-primary terminal-glow tracking-wider uppercase truncate"
            tabIndex={-1}
          >
            &gt; {title}
          </h1>
          {description && (
            <p className="hidden sm:block text-xs text-muted-foreground font-mono truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
        {action && <div className="flex-shrink-0">{action}</div>}
        <NotificationCenter />
        <div className="hidden sm:block">
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
