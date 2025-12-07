"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Plus, Trash2, Edit2, Copy, MoreVertical, Zap, Activity, Cpu, Search, Terminal } from "lucide-react"
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
import { motion, AnimatePresence } from "framer-motion"

export default function AgentsPage() {
  const { agents, loading, connectionStatus } = useRealtimeAgents()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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

      if ((aValue ?? "") < (bValue ?? "")) return sortDirection === "asc" ? -1 : 1
      if ((aValue ?? "") > (bValue ?? "")) return sortDirection === "asc" ? 1 : -1
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
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Header
          title="Agent Forge"
          description="Deploy and manage autonomous neural entities"
          action={
            <div className="flex gap-1 md:gap-2 items-center">
              <Badge
                variant={connectionStatus === "connected" ? "default" : "secondary"}
                className="text-xs hidden sm:inline-flex border-primary/20 bg-primary/10 text-primary animate-pulse"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5" />
                {connectionStatus === "connected" ? "Netrunner Link Active" : "Offline"}
              </Badge>
              <Button onClick={handleAddAgent} size="sm" className="gap-1 md:gap-2 shadow-lg shadow-primary/20 text-xs md:text-sm border-primary/50 hover:bg-primary/20">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Deploy Agent</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <Card className="glass-card border-primary/20 bg-primary/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Units</CardTitle>
                <Bot className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">{agents.length}</div>
                <p className="text-xs text-primary/80 mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  {agents.filter((a) => a.status === "active").length} operational
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Neural Models</CardTitle>
                <Cpu className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">{new Set(agents.map((a) => a.model)).size}</div>
                <p className="text-xs text-purple-400 mt-1">Unique architectures</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tool Capabilities</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground font-mono">{new Set(agents.flatMap((a) => a.tools)).size}</div>
                <p className="text-xs text-amber-400 mt-1">Modules installed</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
            <div className="flex-1 max-w-full md:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search neural patterns..." />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 items-center">
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
              <div className="h-8 w-[1px] bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className={viewMode === "list" ? "bg-accent/20 text-accent" : ""}
              >
                <Terminal className="h-4 w-4" />
              </Button>
              <ExportMenu
                data={filteredAndSortedAgents}
                filename="agents"
                disabled={filteredAndSortedAgents.length === 0}
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className={viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-2"
              }
            >
              {filteredAndSortedAgents.map((agent) => (
                <motion.div
                  layout
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`glass-card border-white/5 group transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.15)] ${viewMode === "list" ? "flex flex-row items-center p-2" : ""
                      }`}
                  >
                    <CardHeader className={viewMode === "list" ? "p-3 flex-1" : "p-6"}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 ${viewMode === "list" ? "h-10 w-10" : "h-14 w-14"
                            }`}>
                            <Bot className={`${viewMode === "list" ? "h-5 w-5" : "h-7 w-7"} text-primary`} />
                            {agent.status === "active" && (
                              <div className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base text-foreground font-mono tracking-tight">{agent.name}</CardTitle>
                            <CardDescription className="text-xs text-primary/70">{agent.role}</CardDescription>
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
                              Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateAgent(agent)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Clone Matrix
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteAgent(agent.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Terminate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    {viewMode === "grid" && (
                      <CardContent className="space-y-4 p-6 pt-0">
                        <div className="h-[40px]">
                          <p className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wider">Directive</p>
                          <p className="text-sm text-foreground/90 line-clamp-2 text-balance">{agent.goal}</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground font-mono">CPU LOAD</p>
                            <span className="text-xs font-medium text-primary font-mono">
                              {agent.status === "active" ? "78%" : "0%"}
                            </span>
                          </div>
                          <Progress value={agent.status === "active" ? 78 : 0} className="h-1 bg-primary/20" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-muted-foreground block mb-1">Model</span>
                            <span className="font-mono text-primary truncate block">{agent.model}</span>
                          </div>
                          <div className="p-2 rounded bg-white/5 border border-white/5">
                            <span className="text-muted-foreground block mb-1">Tools</span>
                            <span className="font-mono text-foreground">{agent.tools.length} modules</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${agent.status === "active"
                                  ? "bg-green-500 shadow-[0_0_8px_#22c55e]"
                                  : agent.status === "idle"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            />
                            <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">{agent.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredAndSortedAgents.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/20 animate-pulse">
                <Bot className="h-12 w-12 text-primary/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Active Units Detected</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                The neural network is empty. Initialize a new autonomous agent to begin operations.
              </p>
              <Button onClick={handleAddAgent} size="lg" className="gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <Plus className="h-5 w-5" />
                Initialize Agent
              </Button>
            </motion.div>
          )}
        </main>
      </div>

      <AgentDialog open={dialogOpen} onOpenChange={setDialogOpen} agent={editingAgent} onSave={handleSaveAgent} />
    </div>
  )
}
