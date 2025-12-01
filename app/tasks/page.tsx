"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Trash2, Edit2, Copy, MoreVertical, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo } from "react"
import { TaskDialog } from "@/components/task-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { SearchBar } from "@/components/search-bar"
import { FilterDropdown } from "@/components/filter-dropdown"
import { SortDropdown } from "@/components/sort-dropdown"
import { ExportMenu } from "@/components/export-menu"

interface Task {
  id: string
  name: string
  description: string
  agent: string
  expectedOutput: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in-progress" | "completed" | "failed"
  dependencies: string[]
  context: string[]
  order: number
}

const sampleTasks: Task[] = [
  {
    id: "1",
    name: "Market Analysis",
    description: "Analyze current market trends and competitor landscape",
    agent: "Research Agent",
    expectedOutput: "Comprehensive market analysis report with actionable insights",
    priority: "high",
    status: "completed",
    dependencies: [],
    context: ["market_data", "competitor_info"],
    order: 1,
  },
  {
    id: "2",
    name: "API Development",
    description: "Develop RESTful API endpoints with proper error handling",
    agent: "Code Generator",
    expectedOutput: "Production-ready API code with tests",
    priority: "critical",
    status: "in-progress",
    dependencies: ["1"],
    context: ["api_specs"],
    order: 2,
  },
  {
    id: "3",
    name: "Documentation",
    description: "Create comprehensive technical documentation",
    agent: "Content Writer",
    expectedOutput: "Clear and detailed documentation",
    priority: "medium",
    status: "pending",
    dependencies: ["2"],
    context: ["code_structure"],
    order: 3,
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState("order")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          (task.name?.toLowerCase() || "").includes(query) ||
          (task.description?.toLowerCase() || "").includes(query) ||
          (task.agent?.toLowerCase() || "").includes(query),
      )
    }

    if (statusFilters.length > 0) {
      result = result.filter((task) => statusFilters.includes(task.status))
    }

    if (priorityFilters.length > 0) {
      result = result.filter((task) => priorityFilters.includes(task.priority))
    }

    result.sort((a, b) => {
      let aValue = a[sortField as keyof Task]
      let bValue = b[sortField as keyof Task]

      if (typeof aValue === "string") aValue = aValue?.toLowerCase() || ""
      if (typeof bValue === "string") bValue = bValue?.toLowerCase() || ""

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [tasks, searchQuery, statusFilters, priorityFilters, sortField, sortDirection])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks")
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setTasks(data)
          }
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAddTask = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    } catch (error) {}
  }

  const handleDuplicateTask = async (task: any) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...task,
          name: `${task.name} (Copy)`,
        }),
      })
    } catch (error) {}
  }

  const handleSaveTask = async (task: any) => {
    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })
      }
      setDialogOpen(false)
    } catch (error) {}
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-accent" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-chart-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-chart-4 text-foreground"
      case "medium":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const statusCounts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters((prev) => (prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]))
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Tasks"
          description="Design and manage your task workflows"
          action={
            <Button onClick={handleAddTask} className="gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">Pending</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{statusCounts.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting execution</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">In Progress</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/20">
                  <Clock className="h-5 w-5 text-chart-4 animate-spin" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-4">{statusCounts.inProgress}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">Completed</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{statusCounts.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4">
            <div className="w-full">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tasks..."
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterDropdown
                label="Status"
                options={[
                  { label: "Pending", value: "pending", checked: statusFilters.includes("pending") },
                  { label: "In Progress", value: "in-progress", checked: statusFilters.includes("in-progress") },
                  { label: "Completed", value: "completed", checked: statusFilters.includes("completed") },
                  { label: "Failed", value: "failed", checked: statusFilters.includes("failed") },
                ]}
                onToggle={toggleStatusFilter}
                activeCount={statusFilters.length}
              />
              <FilterDropdown
                label="Priority"
                options={[
                  { label: "Critical", value: "critical", checked: priorityFilters.includes("critical") },
                  { label: "High", value: "high", checked: priorityFilters.includes("high") },
                  { label: "Medium", value: "medium", checked: priorityFilters.includes("medium") },
                  { label: "Low", value: "low", checked: priorityFilters.includes("low") },
                ]}
                onToggle={togglePriorityFilter}
                activeCount={priorityFilters.length}
              />
              <SortDropdown
                options={[
                  { label: "Order", value: "order" },
                  { label: "Name", value: "name" },
                  { label: "Priority", value: "priority" },
                  { label: "Status", value: "status" },
                ]}
                value={sortField}
                direction={sortDirection}
                onSort={(field, dir) => {
                  setSortField(field)
                  setSortDirection(dir)
                }}
              />
              <ExportMenu
                data={filteredAndSortedTasks}
                filename="tasks"
                disabled={filteredAndSortedTasks.length === 0}
              />
            </div>
          </div>

          {filteredAndSortedTasks.length > 0 ? (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Task Flow</CardTitle>
                    <CardDescription>Sequential execution order and dependencies</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredAndSortedTasks.length} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAndSortedTasks.map((task, index) => (
                    <div key={task.id} className="group relative">
                      {index < filteredAndSortedTasks.length - 1 && (
                        <div className="absolute left-6 top-20 h-6 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                      )}

                      <div className="glass-card border-white/10 flex items-start gap-4 rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-xl">
                        <div className="flex items-center gap-3">
                          <button className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                            <GripVertical className="h-5 w-5" />
                          </button>
                          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
                            {getStatusIcon(task.status)}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">
                                  {task.order}. {task.name}
                                </h4>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass-card border-white/10">
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateTask(task)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {task.status === "in-progress" && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium text-foreground">45%</span>
                              </div>
                              <Progress value={45} className="h-1.5" />
                            </div>
                          )}

                          <div className="grid gap-3 text-sm md:grid-cols-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Agent:</span>
                              <Badge variant="secondary" className="text-xs">
                                {task.agent}
                              </Badge>
                            </div>

                            {task.dependencies.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Depends on:</span>
                                <div className="flex flex-wrap gap-1">
                                  {task.dependencies.map((depId) => {
                                    const depTask = tasks.find((t) => t.id === depId)
                                    return (
                                      <Badge key={depId} variant="outline" className="text-xs border-white/10">
                                        Task {depTask?.order || depId}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {task.context.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Context:</span>
                                <Badge variant="outline" className="text-xs border-white/10">
                                  {task.context.length} vars
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="rounded-lg bg-muted/30 border border-white/5 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Expected Output:</p>
                            <p className="text-sm text-foreground/90">{task.expectedOutput}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {searchQuery || statusFilters.length > 0 || priorityFilters.length > 0
                    ? "No tasks found"
                    : "No tasks yet"}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {searchQuery || statusFilters.length > 0 || priorityFilters.length > 0
                    ? "Try adjusting your search or filters"
                    : "Create your first task to get started"}
                </p>
                {searchQuery || statusFilters.length > 0 || priorityFilters.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilters([])
                      setPriorityFilters([])
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={handleAddTask} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        existingTasks={tasks}
      />
    </div>
  )
}
