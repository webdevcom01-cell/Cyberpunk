"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, Download, Terminal, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealtimeTraces } from "@/lib/hooks/use-realtime-traces"

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "success" | "warning" | "error"
  agent: string
  task: string
  message: string
}

interface ExecutionState {
  isRunning: boolean
  currentTask: string
  progress: number
  startTime: Date | null
  estimatedCompletion: Date | null
}

export default function ExecutionPage() {
  const { traces } = useRealtimeTraces()
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isRunning: false,
    currentTask: "",
    progress: 0,
    startTime: null,
    estimatedCompletion: null,
  })

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedTab, setSelectedTab] = useState("console")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    const runningTraces = traces.filter((t) => t.status === "running")
    if (runningTraces.length > 0 && !executionState.isRunning) {
      setExecutionState({
        isRunning: true,
        currentTask: runningTraces[0].span_name,
        progress: 50,
        startTime: new Date(runningTraces[0].start_time),
        estimatedCompletion: new Date(Date.now() + 300000),
      })
    } else if (runningTraces.length === 0 && executionState.isRunning) {
      setExecutionState({
        ...executionState,
        isRunning: false,
        progress: 100,
      })
    }
  }, [traces]) // Removed executionState.isRunning from the dependency array

  const handleStartExecution = async () => {
    try {
      const res = await fetch("/api/workflows/1/execute", {
        method: "POST",
      })
      const data = await res.json()
      console.log("[v0] Started execution:", data)
    } catch (error) {
      console.error("[v0] Failed to start execution:", error)
    }
  }

  const handleStopExecution = () => {
    setExecutionState({
      ...executionState,
      isRunning: false,
    })
  }

  const handleExportLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.agent}] [${log.task}] ${log.message}`,
      )
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `execution-logs-${Date.now()}.txt`
    a.click()
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-accent"
      case "warning":
        return "text-chart-4"
      case "error":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Execution Console"
          description="Monitor and control workflow execution"
          action={
            <div className="flex gap-1.5 md:gap-2">
              {executionState.isRunning ? (
                <Button
                  onClick={handleStopExecution}
                  variant="destructive"
                  className="gap-1.5 md:gap-2 h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm whitespace-nowrap"
                >
                  <Square className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Stop</span>
                </Button>
              ) : (
                <Button
                  onClick={handleStartExecution}
                  className="gap-1.5 md:gap-2 h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm whitespace-nowrap"
                >
                  <Play className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Run Workflow</span>
                  <span className="sm:hidden">Run</span>
                </Button>
              )}
            </div>
          }
        />

        <main className="flex-1 overflow-hidden p-3 md:p-6">
          <div className="flex h-full flex-col gap-3 md:gap-6">
            {/* Execution Status */}
            <Card className="glass-card border-white/10">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm md:text-base text-card-foreground">Workflow Status</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      {executionState.isRunning ? "Execution in progress" : "Ready to execute"}
                    </CardDescription>
                  </div>
                  <Badge variant={executionState.isRunning ? "default" : "secondary"} className="text-xs md:text-sm">
                    {executionState.isRunning ? "Running" : "Idle"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                {executionState.isRunning && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground">Current Task</span>
                        <span className="font-medium text-card-foreground truncate ml-2 max-w-[200px]">
                          {executionState.currentTask}
                        </span>
                      </div>
                      <Progress value={executionState.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{executionState.progress}% complete</span>
                        <span className="hidden sm:inline">
                          Est. completion: {executionState.estimatedCompletion?.toLocaleTimeString()}
                        </span>
                        <span className="sm:hidden">{executionState.estimatedCompletion?.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:gap-4 grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-muted/30 p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-muted-foreground">Start Time</p>
                        <p className="text-xs md:text-sm font-medium text-card-foreground">
                          {executionState.startTime?.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-muted/30 p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-muted-foreground">Active Traces</p>
                        <p className="text-xs md:text-sm font-medium text-card-foreground">
                          {traces.filter((t) => t.status === "running").length}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-muted/30 p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-muted-foreground">Completed</p>
                        <p className="text-xs md:text-sm font-medium text-card-foreground">
                          {traces.filter((t) => t.status === "completed").length}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {!executionState.isRunning && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No workflow currently running</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Console and Logs */}
            <Card className="flex-1 glass-card border-white/10 overflow-hidden flex flex-col min-h-0">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <CardTitle className="text-sm md:text-base text-card-foreground">Console Output</CardTitle>
                  </div>
                  <div className="flex gap-1.5 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogs([])}
                      disabled={logs.length === 0}
                      className="h-7 md:h-8 px-2 md:px-3 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportLogs}
                      disabled={logs.length === 0}
                      className="gap-1.5 md:gap-2 bg-transparent h-7 md:h-8 px-2 md:px-3 text-xs"
                    >
                      <Download className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  <div className="p-3 md:p-6">
                    {traces.slice(0, 20).map((trace) => (
                      <div key={trace.id} className="mb-2 font-mono text-[10px] md:text-xs break-all">
                        <span className="text-muted-foreground">
                          [{new Date(trace.start_time).toLocaleTimeString()}]
                        </span>{" "}
                        <span
                          className={`uppercase ${
                            trace.status === "completed"
                              ? "text-accent"
                              : trace.status === "failed"
                                ? "text-destructive"
                                : "text-primary"
                          }`}
                        >
                          [{trace.status}]
                        </span>{" "}
                        <span className="text-primary">[{trace.span_type}]</span>{" "}
                        <span className="text-foreground">{trace.span_name}</span>
                      </div>
                    ))}
                    {traces.length === 0 && (
                      <div className="flex items-center justify-center py-12 text-xs md:text-sm text-muted-foreground">
                        No execution logs to display
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
