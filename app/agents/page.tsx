"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Plus, Trash2, Edit2, Copy, MoreVertical, Zap, Activity, Cpu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import { AgentDialog } from "@/components/agent-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import type { Agent } from "@/lib/types"
import { useRealtimeAgents } from "@/lib/hooks/use-realtime-agents"
import { toast } from "sonner"
import { SearchBar } from "@/components/search-bar"
import { FilterDropdown } from "@/components/filter-dropdown"
import { SortDropdown } from "@/components/sort-dropdown"
import { ExportMenu } from "@/components/export-menu"

export default function AgentsPage() {
  const { agents, loading, connectionStatus } = useRealtimeAgents()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filteredAndSortedAgents = useMemo(() => {
    let result = [...agents]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (agent) =>
          (agent.name?.toLowerCase() || "").includes(query) ||
          (agent.role?.toLowerCase() || "").includes(query) ||
          (agent.goal?.toLowerCase() || "").includes(query),
      )
    }

    // Filter by status
    if (statusFilters.length > 0) {
      result = result.filter((agent) => statusFilters.includes(agent.status))
    }

    // Sort
    result.sort((a, b) => {
      let aValue = a[sortField as keyof Agent]
      let bValue = b[sortField as keyof Agent]

      if (typeof aValue === "string") aValue = aValue?.toLowerCase() || ""
      if (typeof bValue === "string") bValue = bValue?.toLowerCase() || ""

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [agents, searchQuery, statusFilters, sortField, sortDirection])

  const handleAddAgent = () => {
    setEditingAgent(null)
    setDialogOpen(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }

  const handleDeleteAgent = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" })
      toast.success("Agent deleted successfully")
    } catch (error) {
      toast.error("Failed to delete agent")
    }
  }

  const handleDuplicateAgent = async (agent: Agent) => {
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...agent,
          name: `${agent.name} (Copy)`,
        }),
      })
      toast.success("Agent duplicated successfully")
    } catch (error) {
      toast.error("Failed to duplicate agent")
    }
  }

  const handleSaveAgent = async (agent: Partial<Agent>) => {
    try {
      if (editingAgent) {
        await fetch(`/api/agents/${editingAgent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agent),
        })
      } else {
        await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agent),
        })
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save agent")
    }
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Agents"
          description="Configure and manage your AI agents"
          action={
            <div className="flex gap-1 md:gap-2 items-center">
              <Badge
                variant={connectionStatus === "connected" ? "default" : "secondary"}
                className="text-xs hidden sm:inline-flex"
              >
                {connectionStatus === "connected" ? "Live" : "Offline"}
              </Badge>
              <Button onClick={handleAddAgent} size="sm" className="gap-1 md:gap-2 shadow-lg text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Add Agent</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="mb-4 md:mb-6 grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">Total Agents</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{agents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {agents.filter((a) => a.status === "active").length} active
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">Models Used</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-4/20 to-primary/20">
                  <Cpu className="h-5 w-5 text-chart-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{new Set(agents.map((a) => a.model)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">Different AI models</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/90">Total Tools</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-chart-4/20">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{new Set(agents.flatMap((a) => a.tools)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique tools available</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-full md:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search agents..." />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <FilterDropdown
                label="Status"
                options={[
                  { label: "Active", value: "active", checked: statusFilters.includes("active") },
                  { label: "Idle", value: "idle", checked: statusFilters.includes("idle") },
                  { label: "Disabled", value: "disabled", checked: statusFilters.includes("disabled") },
                ]}
                onToggle={toggleStatusFilter}
                activeCount={statusFilters.length}
              />
              <SortDropdown
                options={[
                  { label: "Name", value: "name" },
                  { label: "Created Date", value: "created_at" },
                  { label: "Role", value: "role" },
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
                data={filteredAndSortedAgents}
                filename="agents"
                disabled={filteredAndSortedAgents.length === 0}
              />
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedAgents.map((agent) => (
              <Card
                key={agent.id}
                className="glass-card border-white/10 group transition-all hover:scale-[1.02] hover:shadow-2xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
                        <Bot className="h-7 w-7 text-primary" />
                        {agent.status === "active" && (
                          <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-accent shadow-lg shadow-accent/50" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">{agent.name}</CardTitle>
                        <CardDescription className="text-xs">{agent.role}</CardDescription>
                      </div>
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
                        <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateAgent(agent)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteAgent(agent.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Goal</p>
                    <p className="text-sm text-foreground/90 line-clamp-2">{agent.goal}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Utilization</p>
                      <span className="text-xs font-medium text-foreground">
                        {agent.status === "active" ? "78%" : "0%"}
                      </span>
                    </div>
                    <Progress value={agent.status === "active" ? 78 : 0} className="h-1.5" />
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">Configuration</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Model</span>
                        <Badge variant="secondary" className="text-xs">
                          {agent.model}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Temperature</span>
                        <span className="text-foreground font-mono">{agent.temperature}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Max Tokens</span>
                        <span className="text-foreground font-mono">{agent.maxTokens}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">Tools ({agent.tools.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.slice(0, 3).map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs border-white/10">
                          {tool}
                        </Badge>
                      ))}
                      {agent.tools.length > 3 && (
                        <Badge variant="outline" className="text-xs border-white/10">
                          +{agent.tools.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full shadow-lg ${
                          agent.status === "active"
                            ? "bg-accent shadow-accent/50 animate-pulse"
                            : agent.status === "idle"
                              ? "bg-chart-4 shadow-chart-4/50"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-xs capitalize text-muted-foreground">{agent.status}</span>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedAgents.length === 0 && !loading && (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {searchQuery || statusFilters.length > 0 ? "No agents found" : "No agents yet"}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {searchQuery || statusFilters.length > 0
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first AI agent"}
                </p>
                {searchQuery || statusFilters.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilters([])
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={handleAddAgent} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Agent
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <AgentDialog open={dialogOpen} onOpenChange={setDialogOpen} agent={editingAgent} onSave={handleSaveAgent} />
    </div>
  )
}
