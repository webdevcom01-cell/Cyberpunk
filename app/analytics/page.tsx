"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle2, AlertCircle, Download, Calendar } from "lucide-react"
import { useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const executionData = [
  { date: "Mon", completed: 12, failed: 2, pending: 3 },
  { date: "Tue", completed: 19, failed: 1, pending: 5 },
  { date: "Wed", completed: 15, failed: 3, pending: 2 },
  { date: "Thu", completed: 22, failed: 1, pending: 4 },
  { date: "Fri", completed: 28, failed: 2, pending: 3 },
  { date: "Sat", completed: 18, failed: 0, pending: 1 },
  { date: "Sun", completed: 14, failed: 1, pending: 2 },
]

const performanceData = [
  { time: "00:00", cpu: 45, memory: 62, latency: 120 },
  { time: "04:00", cpu: 38, memory: 58, latency: 95 },
  { time: "08:00", cpu: 72, memory: 75, latency: 180 },
  { time: "12:00", cpu: 85, memory: 82, latency: 210 },
  { time: "16:00", cpu: 68, memory: 71, latency: 165 },
  { time: "20:00", cpu: 52, memory: 64, latency: 135 },
]

const agentUtilization = [
  { name: "Research Agent", value: 35, color: "#00ff9f" },
  { name: "Code Generator", value: 28, color: "#00d4ff" },
  { name: "Writer Agent", value: 20, color: "#bd00ff" },
  { name: "Analyst Agent", value: 17, color: "#ff00d4" },
]

const durationData = [
  { task: "Market Analysis", duration: 3.2 },
  { task: "API Development", duration: 8.5 },
  { task: "Documentation", duration: 2.1 },
  { task: "Code Review", duration: 4.7 },
  { task: "Testing", duration: 6.3 },
  { task: "Deployment", duration: 1.8 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(false)

  const totalExecutions = executionData.reduce((sum, day) => sum + day.completed + day.failed + day.pending, 0)
  const successRate = (executionData.reduce((sum, day) => sum + day.completed, 0) / totalExecutions) * 100
  const avgDuration = durationData.reduce((sum, task) => sum + task.duration, 0) / durationData.length

  const prevWeekTotal = 98
  const growthRate = ((totalExecutions - prevWeekTotal) / prevWeekTotal) * 100

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Analytics"
          description="Performance metrics and insights"
          action={
            <div className="flex gap-1.5 md:gap-2 items-center">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24 md:w-32 h-8 md:h-10 bg-muted/50 border-white/10 text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
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
          {/* KPI Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 md:mb-6">
            <Card className="glass-card border-white/10 transition-all hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-foreground/90">Total Executions</CardTitle>
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{totalExecutions}</div>
                <div className="flex items-center gap-1 text-xs text-accent mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">+{growthRate.toFixed(1)}% from last week</span>
                  <span className="sm:hidden">+{growthRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-foreground/90">Success Rate</CardTitle>
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-accent" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-accent">{successRate.toFixed(1)}%</div>
                <div className="flex items-center gap-1 text-xs text-accent mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">+2.4% from last week</span>
                  <span className="sm:hidden">+2.4%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-foreground/90">Avg Duration</CardTitle>
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{avgDuration.toFixed(1)}s</div>
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span className="hidden sm:inline">-0.8s faster</span>
                  <span className="sm:hidden">-0.8s</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-foreground/90">Failed Tasks</CardTitle>
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-destructive">
                  {executionData.reduce((sum, day) => sum + day.failed, 0)}
                </div>
                <div className="flex items-center gap-1 text-xs text-accent mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span className="hidden sm:inline">-15% from last week</span>
                  <span className="sm:hidden">-15%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mb-4 md:mb-6">
            {/* Execution Trend */}
            <Card className="glass-card border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base text-foreground">Execution Trend</CardTitle>
                <CardDescription className="text-xs md:text-sm">Daily workflow execution status</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={executionData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff9f" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff9f" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff0055" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#00ff9f"
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="#ff0055"
                      fillOpacity={1}
                      fill="url(#colorFailed)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card className="glass-card border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base text-foreground">System Performance</CardTitle>
                <CardDescription className="text-xs md:text-sm">CPU, Memory and Latency over time</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="memory" stroke="#bd00ff" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="latency" stroke="#ff00d4" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Agent Utilization */}
            <Card className="glass-card border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base text-foreground">Agent Utilization</CardTitle>
                <CardDescription className="text-xs md:text-sm">Distribution of agent workload</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={agentUtilization}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {agentUtilization.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full md:flex-1 space-y-3">
                    {agentUtilization.map((agent) => (
                      <div key={agent.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: agent.color }} />
                            <span className="text-foreground text-xs md:text-sm">{agent.name}</span>
                          </div>
                          <span className="text-muted-foreground text-xs md:text-sm">{agent.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Duration */}
            <Card className="glass-card border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base text-foreground">Task Duration</CardTitle>
                <CardDescription className="text-xs md:text-sm">Average execution time by task type</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={durationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="task"
                      type="category"
                      stroke="rgba(255,255,255,0.5)"
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Bar dataKey="duration" fill="#00ff9f" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card className="glass-card border-white/10 mt-4 md:mt-6">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-sm md:text-base text-foreground">Performance Insights</CardTitle>
              <CardDescription className="text-xs md:text-sm">AI-powered recommendations and insights</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                    <h4 className="font-semibold text-accent text-sm md:text-base">High Performance</h4>
                  </div>
                  <p className="text-xs md:text-sm text-foreground/80">
                    Research Agent is performing 23% above average. Consider assigning more complex tasks.
                  </p>
                </div>

                <div className="rounded-xl border border-chart-4/30 bg-chart-4/10 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-chart-4" />
                    <h4 className="font-semibold text-chart-4 text-sm md:text-base">Optimization Opportunity</h4>
                  </div>
                  <p className="text-xs md:text-sm text-foreground/80">
                    API Development tasks can be optimized. Average duration reduced by caching.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h4 className="font-semibold text-primary text-sm md:text-base">Resource Scaling</h4>
                  </div>
                  <p className="text-xs md:text-sm text-foreground/80">
                    Peak usage detected at 12:00 PM. Consider auto-scaling for better performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
