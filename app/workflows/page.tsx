"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Save, Plus, Activity, Zap } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { FilterDropdown } from "@/components/filter-dropdown"
import { SortDropdown } from "@/components/sort-dropdown"
import { ExportMenu } from "@/components/export-menu"
import { WorkflowDialog } from "@/components/workflow-dialog"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface Workflow {
  id: string
  name: string
  description: string
  status: "draft" | "active" | "paused" | "completed" | "failed"
  agent_ids?: string[]
  task_ids?: string[]
  created_at: string
}

const sampleWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Product Launch Workflow",
    description: "Complete workflow for new product launch including research, development, and marketing",
    status: "active",
    agent_ids: ["a1", "a2", "a3"],
    task_ids: ["t1", "t2", "t3", "t4", "t5"],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Content Creation Pipeline",
    description: "Automated content generation and publishing workflow",
    status: "draft",
    agent_ids: ["a4", "a5"],
    task_ids: ["t6", "t7", "t8"],
    created_at: new Date().toISOString(),
  },
]

// Helper function to format date consistently on client and server
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [mounted, setMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredAndSortedWorkflows = useMemo(() => {
    let result = [...workflows]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (workflow) =>
          (workflow.name?.toLowerCase() || "").includes(query) ||
          (workflow.description?.toLowerCase() || "").includes(query),
      )
    }

    if (statusFilters.length > 0) {
      result = result.filter((workflow) => statusFilters.includes(workflow.status))
    }

    result.sort((a, b) => {
      let aValue = a[sortField as keyof Workflow]
      let bValue = b[sortField as keyof Workflow]

      if (typeof aValue === "string") aValue = aValue?.toLowerCase() || ""
      if (typeof bValue === "string") bValue = bValue?.toLowerCase() || ""

      if ((aValue ?? "") < (bValue ?? "")) return sortDirection === "asc" ? -1 : 1
      if ((aValue ?? "") > (bValue ?? "")) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [workflows, searchQuery, statusFilters, sortField, sortDirection])

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/workflows")
        if (response.ok) {
          const data = await response.json()
          if (data.workflows && data.workflows.length > 0) {
            setWorkflows(data.workflows)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch workflows")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  const handleAddWorkflow = () => {
    setEditingWorkflow(null)
    setDialogOpen(true)
  }

  const handleSaveWorkflow = async (workflowData: any) => {
    try {
      if (editingWorkflow) {
        await fetch(`/api/workflows/${editingWorkflow.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflowData),
        })
        toast.success("Workflow updated successfully")
      } else {
        await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflowData),
        })
        toast.success("Workflow created successfully")
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save workflow")
    }
  }

  const getStatusColor = (status: Workflow["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed":
        return "bg-primary/20 text-primary border-primary/30"
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleRunWorkflow = (workflow: Workflow) => {
    toast.success(`Starting workflow: ${workflow.name}`)
    // In a real app, this would trigger the workflow execution
  }

  const handlePauseWorkflow = (workflow: Workflow) => {
    toast.info(`Pausing workflow: ${workflow.name}`)
    // In a real app, this would pause the workflow
  }

  const handleQuickSave = (workflow: Workflow) => {
    toast.success(`Workflow saved: ${workflow.name}`)
    // In a real app, this would save workflow changes
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Header
          title="Workflow Matrix"
          description="Orchestrate multi-agent task sequences"
          action={
            <Button onClick={handleAddWorkflow} className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Workflow</span>
              <span className="sm:hidden">New</span>
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6 relative z-10">
          {error && (
            <Card className="glass-card border-destructive/50 mb-4 md:mb-6">
              <CardContent className="pt-4 md:pt-6">
                <p className="text-destructive text-xs md:text-sm">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3"
          >
            <Card className="glass-card border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Total Workflows</CardTitle>
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold font-mono">{workflows.length}</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20 bg-green-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Active</CardTitle>
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-400 font-mono">
                  {workflows.filter((w) => w.status === "active").length}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 bg-purple-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-purple-400 font-mono">
                  {workflows.filter((w) => w.status === "completed").length}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4">
            <div className="w-full">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search workflows..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterDropdown
                label="Status"
                options={[
                  { label: "Draft", value: "draft", checked: statusFilters.includes("draft") },
                  { label: "Active", value: "active", checked: statusFilters.includes("active") },
                  { label: "Paused", value: "paused", checked: statusFilters.includes("paused") },
                  { label: "Completed", value: "completed", checked: statusFilters.includes("completed") },
                  { label: "Failed", value: "failed", checked: statusFilters.includes("failed") },
                ]}
                onToggle={toggleStatusFilter}
                activeCount={statusFilters.length}
              />
              <SortDropdown
                options={[
                  { label: "Created Date", value: "created_at" },
                  { label: "Name", value: "name" },
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
                data={filteredAndSortedWorkflows}
                filename="workflows"
                disabled={filteredAndSortedWorkflows.length === 0}
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {filteredAndSortedWorkflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card border-white/10 hover:border-primary/30 transition-all group">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <CardTitle className="text-base md:text-lg font-mono">{workflow.name}</CardTitle>
                          <Badge className={`${getStatusColor(workflow.status)} border`}>{workflow.status}</Badge>
                        </div>
                        <CardDescription className="text-xs md:text-sm">{workflow.description}</CardDescription>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {workflow.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseWorkflow(workflow)}
                            className="gap-1.5 md:gap-2 bg-transparent flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9 border-yellow-500/30 hover:bg-yellow-500/10"
                          >
                            <Pause className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Pause</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRunWorkflow(workflow)}
                            className="gap-1.5 md:gap-2 flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                          >
                            <Play className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Run</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickSave(workflow)}
                          className="gap-1.5 md:gap-2 bg-transparent text-xs md:text-sm h-8 md:h-9 border-primary/20 hover:bg-primary/10"
                        >
                          <Save className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                        <span className="font-mono">{workflow.agent_ids?.length || 0} Agents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                        <span className="font-mono">{workflow.task_ids?.length || 0} Tasks</span>
                      </div>
                      <div className="sm:ml-auto text-xs font-mono">
                        {mounted ? `Created ${formatDate(workflow.created_at)}` : 'Loading...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredAndSortedWorkflows.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-dashed border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-16 p-4 md:p-6">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Activity className="h-10 w-10 text-primary/50" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    {searchQuery || statusFilters.length > 0 ? "No workflows found" : "Matrix Empty"}
                  </h3>
                  <p className="mb-6 text-xs md:text-sm text-muted-foreground text-center max-w-md">
                    {searchQuery || statusFilters.length > 0
                      ? "Try adjusting your search or filters"
                      : "Initialize your first workflow sequence to begin orchestration"}
                  </p>
                  {searchQuery || statusFilters.length > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilters([])
                      }}
                      className="text-xs md:text-sm border-primary/20 hover:bg-primary/10"
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={handleAddWorkflow} className="gap-2 text-xs md:text-sm shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                      <Plus className="h-4 w-4" />
                      New Workflow
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workflow={editingWorkflow}
        onSave={handleSaveWorkflow}
      />
    </div>
  )
}
