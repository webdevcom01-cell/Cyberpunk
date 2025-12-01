"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Sparkles, Search } from "lucide-react"
import { useState, useEffect } from "react"

interface AgentState {
  name: string
  status: "thinking" | "working" | "done"
  progress: number
  currentTask: string
  thinking: string
  result?: string
}

export default function LivePreviewPage() {
  const [agents, setAgents] = useState<AgentState[]>([
    {
      name: "Research Agent",
      status: "thinking",
      progress: 45,
      currentTask: "Analyzing: AI trends 2025",
      thinking: "I need to filter for reliable sources. Let me check authority scores first...",
    },
  ])

  const [displayedThinking, setDisplayedThinking] = useState("")

  useEffect(() => {
    if (agents[0]?.thinking) {
      let index = 0
      const interval = setInterval(() => {
        setDisplayedThinking(agents[0].thinking.slice(0, index))
        index++
        if (index > agents[0].thinking.length) {
          clearInterval(interval)
        }
      }, 30)
      return () => clearInterval(interval)
    }
  }, [agents])

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Live Preview"
          description="Watch AI agents think and work in real-time"
          action={
            <Badge variant="default" className="animate-pulse">
              Live
            </Badge>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {agents.map((agent, idx) => (
              <Card key={idx} className="glass-card border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50">
                        <Bot className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">{agent.name} is thinking...</CardTitle>
                        <CardDescription className="text-sm mt-1">{agent.currentTask}</CardDescription>
                      </div>
                    </div>
                    <Sparkles className="h-5 w-5 text-primary animate-spin" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{agent.progress}%</span>
                    </div>
                    <Progress value={agent.progress} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Search className="h-4 w-4 text-accent" />
                      <span>Analyzing: "AI trends 2025"</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <Search className="h-4 w-4" />
                      <span>Found 127 sources</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>Processing data...</span>
                    </div>
                  </div>

                  <Card className="bg-muted/30 border-muted">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-sm font-semibold">Internal monologue:</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground italic font-mono">
                        "{displayedThinking}"<span className="animate-pulse">|</span>
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
