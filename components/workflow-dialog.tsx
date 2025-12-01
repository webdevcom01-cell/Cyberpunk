"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow?: any
  onSave: (workflow: any) => void
  availableAgents?: any[]
  availableTasks?: any[]
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
  availableAgents = [],
  availableTasks = [],
}: WorkflowDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"draft" | "active" | "paused">("draft")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  useEffect(() => {
    if (workflow) {
      setName(workflow.name || "")
      setDescription(workflow.description || "")
      setStatus(workflow.status || "draft")
      setSelectedAgents(workflow.agent_ids || [])
      setSelectedTasks(workflow.task_ids || [])
    } else {
      setName("")
      setDescription("")
      setStatus("draft")
      setSelectedAgents([])
      setSelectedTasks([])
    }
  }, [workflow, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const workflowData = {
      name,
      description,
      status,
      agent_ids: selectedAgents,
      task_ids: selectedTasks,
    }

    onSave(workflowData)
  }

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">{workflow ? "Edit Workflow" : "Create New Workflow"}</DialogTitle>
          <DialogDescription>Orchestrate agents and tasks into a powerful workflow</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Launch Workflow"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Agents Selection */}
              <div className="space-y-2">
                <Label>Agents ({selectedAgents.length})</Label>
                <div className="rounded-lg border border-white/10 bg-muted/30 p-4">
                  {availableAgents.length > 0 ? (
                    <div className="space-y-2">
                      {availableAgents.slice(0, 5).map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => toggleAgent(agent.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedAgents.includes(agent.id)}
                              onChange={() => toggleAgent(agent.id)}
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {agent.status}
                          </Badge>
                        </div>
                      ))}
                      {availableAgents.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{availableAgents.length - 5} more agents available
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No agents available. Create agents first.
                    </p>
                  )}
                </div>
              </div>

              {/* Tasks Selection */}
              <div className="space-y-2">
                <Label>Tasks ({selectedTasks.length})</Label>
                <div className="rounded-lg border border-white/10 bg-muted/30 p-4">
                  {availableTasks.length > 0 ? (
                    <div className="space-y-2">
                      {availableTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => toggleTask(task.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTask(task.id)}
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{task.name}</p>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                      {availableTasks.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{availableTasks.length - 5} more tasks available
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks available. Create tasks first.
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Items Summary */}
              {(selectedAgents.length > 0 || selectedTasks.length > 0) && (
                <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
                  <h4 className="text-sm font-semibold text-accent mb-3">Workflow Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Agents:</span>
                      <span className="font-medium text-foreground">{selectedAgents.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Tasks:</span>
                      <span className="font-medium text-foreground">{selectedTasks.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/80 text-black">
              {workflow ? "Update Workflow" : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
