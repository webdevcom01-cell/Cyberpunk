"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Activity,
  Settings,
  Terminal,
  TrendingUp,
  Plug,
  Wand2,
  BarChart3,
  Eye,
  Gamepad2,
  Store,
  ImageIcon,
  Search,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RealtimeStatus } from "./realtime-status"

const navItems = [
  { title: "OVERVIEW", href: "/", icon: LayoutDashboard },
  { title: "🔥 AI RESEARCH", href: "/research", icon: Search },
  { title: "💬 AI CHAT", href: "/chat", icon: MessageSquare },
  { title: "NL BUILDER", href: "/workflow-builder", icon: Wand2 },
  { title: "AGENTS", href: "/agents", icon: Bot },
  { title: "TASKS", href: "/tasks", icon: Workflow },
  { title: "WORKFLOWS", href: "/workflows", icon: Activity },
  { title: "LIVE PREVIEW", href: "/live-preview", icon: Eye },
  { title: "PLAYGROUND", href: "/playground", icon: Gamepad2 },
  { title: "MARKETPLACE", href: "/marketplace", icon: Store },
  { title: "TEMPLATES", href: "/templates", icon: ImageIcon },
  { title: "ANALYTICS", href: "/analytics", icon: BarChart3 },
  { title: "EXECUTION", href: "/execution", icon: Terminal },
  { title: "OBSERVABILITY", href: "/observability", icon: TrendingUp },
  { title: "INTEGRATIONS", href: "/integrations", icon: Plug },
  { title: "SETTINGS", href: "/settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside
      className="glass-sidebar hidden md:flex h-screen w-64 flex-col scanlines"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center gap-3 border-b border-primary/20 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/50 bg-primary/10 shadow-lg shadow-primary/20">
          <Terminal className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary terminal-glow tracking-wider">CREWAI_SYS</span>
          <span className="text-xs text-muted-foreground font-mono" aria-label="Version 2.0.1">
            &gt; v2.0.1
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto" role="menubar" aria-orientation="vertical">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded border px-4 py-3 text-xs font-bold tracking-wider transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary/50 bg-primary/10 text-primary shadow-lg shadow-primary/20 border-glow"
                  : "border-border/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive && "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]",
                )}
                aria-hidden="true"
              />
              <span>{item.title}</span>
              {isActive && (
                <span className="ml-auto text-primary" aria-hidden="true">
                  &gt;
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-primary/20 p-4 space-y-3" aria-label="Connection status">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-muted-foreground tracking-wider" id="connection-label">
            CONNECTION
          </span>
          <RealtimeStatus />
        </div>

        <div
          className="flex items-center gap-3 rounded border border-primary/30 bg-primary/5 px-4 py-3 shadow-md shadow-primary/10"
          role="status"
          aria-live="polite"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded border border-primary/50 bg-primary/10 text-xs font-bold text-primary shadow-sm shadow-primary/20"
            aria-hidden="true"
          >
            AI
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary tracking-wider">SYSTEM_STATUS</span>
            <span className="text-xs text-muted-foreground font-mono">OPERATIONAL</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
