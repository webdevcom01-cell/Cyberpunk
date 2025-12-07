"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Bot, Workflow, Activity, Clock, CheckCircle2, Zap, FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import type { Agent, ExecutionTrace } from "@/lib/types"
import Link from "next/link"

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [traces, setTraces] = useState<ExecutionTrace[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [agentsRes, tracesRes] = await Promise.all([fetch("/api/agents"), fetch("/api/execution/traces")])

      const [agentsData, tracesData] = await Promise.all([agentsRes.json(), tracesRes.json()])

      setAgents(agentsData.agents || [])
      setTraces(tracesData.traces || [])
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const activeAgents = agents.filter((a) => a.status === "active")
  const runningWorkflows = traces.filter((t) => t.status === "running" && t.span_type === "workflow")
  const completedToday = traces.filter((t) => {
    const today = new Date()
    const traceDate = new Date(t.start_time)
    return traceDate.toDateString() === today.toDateString() && t.status === "completed"
  })

  // Show loading state until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-500 animate-pulse">CREWAI_SYS</div>
          <div className="text-green-400 mt-2">Initializing...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Overview"
          description="Monitor your AI agents and workflows"
          action={
            <div className="flex gap-1 md:gap-2">
              <Link href="/workflows" className="hidden sm:inline-block">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl bg-transparent text-xs md:text-sm">
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">New Workflow</span>
                </Button>
              </Link>
              <Link href="/settings" className="hidden lg:inline-block">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl bg-transparent text-xs md:text-sm">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Import</span>
                </Button>
              </Link>
              <Link href="/execution">
                <Button size="sm" className="gap-2 rounded-xl shadow-lg text-xs md:text-sm">
                  <Play className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Run</span>
                  <span className="sm:hidden">▶</span>
                </Button>
              </Link>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card shadow-xl rounded-2xl sm:col-span-2 lg:row-span-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Running Workflows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex items-baseline gap-2">
                  <div className="text-5xl md:text-7xl font-bold text-card-foreground">{runningWorkflows.length}</div>
                  {runningWorkflows.length > 0 && (
                    <div className="flex h-2 w-2 md:h-3 md:w-3 animate-pulse items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/50" />
                  )}
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">
                      {traces.filter((t) => t.status === "running").length - runningWorkflows.length} tasks active
                    </span>
                    <span className="text-accent font-medium">{activeAgents.length} agents online</span>
                  </div>
                  <Progress
                    value={(runningWorkflows.length / Math.max(traces.length, 1)) * 100}
                    className="h-1.5 md:h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {runningWorkflows.length} of {traces.filter((t) => t.span_type === "workflow").length} total
                    workflows
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Active Agents</CardTitle>
                <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-card-foreground">{activeAgents.length}</div>
                <p className="text-xs text-accent mt-1">{agents.length} total agents</p>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Completed Today</CardTitle>
                <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-card-foreground">{completedToday.length}</div>
                <p className="text-xs text-accent mt-1">
                  +
                  {Math.round(
                    (completedToday.length / Math.max(traces.filter((t) => t.status === "completed").length, 1)) * 100,
                  )}
                  % success rate
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl rounded-2xl sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">Avg Duration</CardTitle>
                <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/10">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-chart-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-card-foreground">
                  {traces.length > 0
                    ? `${(traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length / 1000).toFixed(1)}s`
                    : "0s"}
                </div>
                <p className="text-xs text-accent mt-1">Across all executions</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="glass-card shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Executions</CardTitle>
                <CardDescription>Latest workflow runs with execution timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {traces.slice(0, 4).map((trace) => {
                  const duration = trace.duration_ms ? `${(trace.duration_ms / 1000).toFixed(1)}s` : "Running..."
                  const timeAgo = Math.floor((Date.now() - new Date(trace.start_time).getTime()) / 60000)

                  return (
                    <div
                      key={trace.id}
                      className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 transition-all duration-200 hover:bg-card/60 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
                            <Workflow className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{trace.span_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo < 1 ? "Just now" : `${timeAgo}m ago`} • {duration}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            trace.status === "completed"
                              ? "default"
                              : trace.status === "running"
                                ? "secondary"
                                : "destructive"
                          }
                          className="capitalize rounded-lg"
                        >
                          {trace.status}
                        </Badge>
                      </div>

                      <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`absolute h-full rounded-full transition-all ${
                            trace.status === "completed"
                              ? "bg-accent"
                              : trace.status === "running"
                                ? "bg-primary animate-pulse"
                                : "bg-destructive"
                          }`}
                          style={{
                            left: "10%",
                            width: trace.status === "completed" ? "80%" : "40%",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}

                {traces.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No executions yet. Start a workflow to see results here.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">Active Agents</CardTitle>
                <CardDescription>Real-time agent status and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.slice(0, 3).map((agent) => (
                  <div
                    key={agent.id}
                    className="group flex flex-col gap-3 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 transition-all duration-200 hover:bg-card/60 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.role} • {agent.total_executions} executions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            agent.status === "active"
                              ? "bg-accent animate-pulse shadow-lg shadow-accent/50"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-xs capitalize text-muted-foreground">{agent.status}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-card-foreground">{agent.success_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.success_rate} className="h-1.5" />
                    </div>
                  </div>
                ))}

                {agents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">No agents configured yet.</div>
                )}

                <Link href="/agents">
                  <Button
                    variant="outline"
                    className="w-full bg-card/40 backdrop-blur-sm rounded-xl border-border/50 hover:bg-card/60"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Manage Agents
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 md:mt-6 glass-card shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm md:text-base text-card-foreground">System Health</CardTitle>
              <CardDescription className="text-xs md:text-sm">Real-time metrics and uptime monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-3 rounded-xl bg-muted/30 backdrop-blur-sm p-4 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CPU Usage</p>
                        <p className="text-xl font-semibold text-card-foreground">42%</p>
                      </div>
                    </div>
                  </div>
                  <Progress value={42} className="h-2" />
                  <p className="text-xs text-muted-foreground">Normal range (threshold: 70%)</p>
                </div>

                <div className="space-y-3 rounded-xl bg-muted/30 backdrop-blur-sm p-4 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                        <Activity className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Memory</p>
                        <p className="text-xl font-semibold text-card-foreground">1.2GB</p>
                      </div>
                    </div>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground">2.0GB available</p>
                </div>

                <div className="space-y-3 rounded-xl bg-muted/30 backdrop-blur-sm p-4 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10">
                        <Clock className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-xl font-semibold text-card-foreground">99.9%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last restart:</span>
                    <span>14 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
