"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Clock, DollarSign, Zap, AlertTriangle, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ExecutionTrace, ExecutionLog } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ObservabilityPage() {
  const [traces, setTraces] = useState<ExecutionTrace[]>([])
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("1h")

  useEffect(() => {
    fetchTraces()
    fetchLogs()
    const interval = setInterval(() => {
      fetchTraces()
      fetchLogs()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchTraces = async () => {
    try {
      const res = await fetch("/api/execution/traces")
      const data = await res.json()
      setTraces(data.traces || [])
    } catch (error) {
      console.error("[v0] Failed to fetch traces:", error)
    }
  }

  const fetchLogs = async () => {
    try {
      if (selectedTrace) {
        const res = await fetch(`/api/execution/logs?trace_id=${selectedTrace}`)
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch logs:", error)
    }
  }

  const totalTraces = traces.length
  const runningTraces = traces.filter((t) => t.status === "running").length
  const failedTraces = traces.filter((t) => t.status === "failed").length
  const avgDuration =
    traces.length > 0 ? traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length / 1000 : 0
  const totalCost = traces.reduce((sum, t) => sum + (t.cost_usd || 0), 0)
  const totalTokens = traces.reduce((sum, t) => sum + (t.tokens_used || 0), 0)

  const handleExportTrace = (trace: ExecutionTrace) => {
    const data = {
      trace,
      logs: logs.filter((l) => l.trace_id === trace.trace_id),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trace-${trace.trace_id}.json`
    a.click()
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Observability"
          description="Enterprise-grade distributed tracing and monitoring"
          action={
            <div className="flex gap-1.5 md:gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24 md:w-32 h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 min</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="gap-1.5 md:gap-2 bg-transparent h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm whitespace-nowrap"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {/* Metrics Overview */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-4 md:mb-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Traces</CardTitle>
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">{totalTraces}</div>
                <p className="text-xs text-accent mt-1">{runningTraces} running</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Avg Duration</CardTitle>
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">{avgDuration.toFixed(1)}s</div>
                <p className="text-xs text-accent mt-1">-12% vs last hour</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  {totalTraces > 0 ? ((1 - failedTraces / totalTraces) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">{failedTraces} failed</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Cost</CardTitle>
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">${totalCost.toFixed(4)}</div>
                <p className="text-xs text-muted-foreground mt-1">API costs</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Tokens</CardTitle>
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-foreground">{(totalTokens / 1000).toFixed(1)}K</div>
                <p className="text-xs text-muted-foreground mt-1">tokens used</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-muted-foreground">Errors</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-destructive">{failedTraces}</div>
                <p className="text-xs text-muted-foreground mt-1">in time range</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="traces" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
              <TabsList className="glass-card border-white/10 inline-flex w-auto min-w-full md:w-auto">
                <TabsTrigger value="traces" className="text-xs md:text-sm whitespace-nowrap">
                  Traces
                </TabsTrigger>
                <TabsTrigger value="metrics" className="text-xs md:text-sm whitespace-nowrap">
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-xs md:text-sm whitespace-nowrap">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs md:text-sm whitespace-nowrap">
                  Errors
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Distributed Traces Tab */}
            <TabsContent value="traces" className="space-y-4">
              <Card className="glass-card border-white/10">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base text-foreground">Execution Traces</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Distributed tracing with span details and dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <ScrollArea className="h-[400px] md:h-[600px]">
                    <div className="space-y-3">
                      {traces.map((trace) => {
                        const duration = trace.duration_ms ? `${(trace.duration_ms / 1000).toFixed(2)}s` : "Running..."
                        const cost = trace.cost_usd ? `$${trace.cost_usd.toFixed(6)}` : "-"

                        return (
                          <div
                            key={trace.id}
                            className="glass-card border-white/10 rounded-xl p-3 md:p-4 hover:bg-card/60 transition-colors cursor-pointer"
                            onClick={() => setSelectedTrace(trace.trace_id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                <div
                                  className={`h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    trace.span_type === "workflow"
                                      ? "bg-primary/20"
                                      : trace.span_type === "agent"
                                        ? "bg-accent/20"
                                        : trace.span_type === "task"
                                          ? "bg-chart-4/20"
                                          : "bg-muted/20"
                                  }`}
                                >
                                  <span className="text-xs font-mono uppercase text-foreground">
                                    {trace.span_type[0]}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs md:text-sm font-medium text-foreground truncate">
                                    {trace.span_name}
                                  </p>
                                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                                    Trace: {trace.trace_id.slice(0, 8)}... • Span: {trace.span_id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  trace.status === "completed"
                                    ? "default"
                                    : trace.status === "running"
                                      ? "secondary"
                                      : trace.status === "failed"
                                        ? "destructive"
                                        : "outline"
                                }
                                className="ml-2 flex-shrink-0 text-xs"
                              >
                                {trace.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs mb-3">
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px] md:text-xs">Duration</p>
                                <p className="font-mono text-foreground text-xs">{duration}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px] md:text-xs">Cost</p>
                                <p className="font-mono text-foreground text-xs">{cost}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px] md:text-xs">Tokens</p>
                                <p className="font-mono text-foreground text-xs">{trace.tokens_used || 0}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px] md:text-xs">Started</p>
                                <p className="font-mono text-foreground text-xs">
                                  {new Date(trace.start_time).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {trace.duration_ms && (
                              <div className="relative h-1.5 md:h-2 rounded-full bg-muted/30 overflow-hidden">
                                <div
                                  className={`absolute h-full rounded-full ${
                                    trace.status === "completed"
                                      ? "bg-accent"
                                      : trace.status === "failed"
                                        ? "bg-destructive"
                                        : "bg-primary animate-pulse"
                                  }`}
                                  style={{ width: "100%" }}
                                />
                              </div>
                            )}

                            {trace.error_message && (
                              <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-xs text-destructive">{trace.error_message}</p>
                              </div>
                            )}

                            <div className="flex gap-1.5 md:gap-2 mt-3">
                              <Button size="sm" variant="ghost" className="h-6 md:h-7 text-[10px] md:text-xs px-2">
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 md:h-7 text-[10px] md:text-xs px-2"
                                onClick={() => handleExportTrace(trace)}
                              >
                                Export
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base text-foreground">Performance Metrics</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Response times and throughput</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">P50 Latency</span>
                        <span className="font-mono text-foreground">1.2s</span>
                      </div>
                      <Progress value={40} className="h-2 md:h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">P95 Latency</span>
                        <span className="font-mono text-foreground">3.8s</span>
                      </div>
                      <Progress value={75} className="h-2 md:h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">P99 Latency</span>
                        <span className="font-mono text-foreground">5.2s</span>
                      </div>
                      <Progress value={95} className="h-2 md:h-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base text-foreground">Cost Analysis</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Token usage and API costs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-medium text-foreground">GPT-4</span>
                        <span className="font-mono text-foreground">$0.0234</span>
                      </div>
                      <Progress value={60} className="h-2 md:h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-medium text-foreground">Claude 3</span>
                        <span className="font-mono text-foreground">$0.0156</span>
                      </div>
                      <Progress value={40} className="h-2 md:h-3" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-medium text-foreground">Total Cost</span>
                        <span className="font-mono font-bold text-accent">${totalCost.toFixed(4)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm md:text-base text-foreground">Performance Analysis</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Detailed performance breakdown by operation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Workflow Execution", "Agent Processing", "Task Completion", "LLM Calls"].map((operation, i) => (
                      <div key={i} className="glass-card border-white/10 rounded-lg p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm md:text-base font-medium text-foreground">{operation}</span>
                          <Badge variant="outline" className="text-sm md:text-base">
                            50 calls
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 md:gap-6 text-sm md:text-base mt-3">
                          <div>
                            <p className="text-muted-foreground mb-1">Avg Duration</p>
                            <p className="font-mono text-foreground">1.2s</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Success Rate</p>
                            <p className="font-mono text-accent">95%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Error Rate</p>
                            <p className="font-mono text-destructive">2%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Errors Tab */}
            <TabsContent value="errors">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm md:text-base text-foreground">Error Tracking</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Failed executions and error patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] md:h-[500px]">
                    <div className="space-y-3">
                      {traces
                        .filter((t) => t.status === "failed")
                        .map((trace) => (
                          <div
                            key={trace.id}
                            className="glass-card border-destructive/20 rounded-lg p-4 md:p-6 bg-destructive/5"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm md:text-base font-medium text-foreground">{trace.span_name}</p>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {new Date(trace.start_time).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="destructive" className="text-sm md:text-base">
                                Error
                              </Badge>
                            </div>
                            {trace.error_message && (
                              <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-xs md:text-sm text-destructive">{trace.error_message}</p>
                              </div>
                            )}
                            <div className="flex gap-1.5 md:gap-2 mt-3">
                              <Button size="sm" variant="ghost" className="h-6 md:h-7 text-[10px] md:text-sm px-2">
                                View Stack Trace
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 md:h-7 text-[10px] md:text-sm px-2">
                                Re-run
                              </Button>
                            </div>
                          </div>
                        ))}
                      {traces.filter((t) => t.status === "failed").length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No errors in the selected time range
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
