"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { taskSchema, type TaskFormData } from "@/lib/validations"
import { toast } from "sonner"
import { z } from "zod"

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

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (task: Task) => void
  existingTasks: Task[]
}

const agentOptions = ["Research Agent", "Writer Agent", "Analyst Agent"]

export function TaskDialog({ open, onOpenChange, task, onSave, existingTasks }: TaskDialogProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agent: "Research Agent",
    expectedOutput: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    status: "pending" as "pending" | "in-progress" | "completed" | "failed",
    dependencies: [] as string[],
    context: [] as string[],
    order: 0,
  })

  const [newContext, setNewContext] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        agent: task.agent,
        expectedOutput: task.expectedOutput,
        priority: task.priority,
        status: task.status,
        dependencies: task.dependencies,
        context: task.context,
        order: task.order,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        agent: "Research Agent",
        expectedOutput: "",
        priority: "medium",
        status: "pending",
        dependencies: [],
        context: [],
        order: 0,
      })
    }
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [task, open])

  const handleSave = () => {
    try {
      const validatedData = taskSchema.parse(formData)
      const savedTask: Task = {
        id: task?.id || Date.now().toString(),
        ...validatedData,
      }
      onSave(savedTask)
      toast.success(task ? "Task updated successfully" : "Task created successfully")
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof TaskFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof TaskFormData] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error("Please fix the errors in the form")
      }
    }
  }

  const addContext = () => {
    if (newContext && !formData.context.includes(newContext)) {
      setFormData({ ...formData, context: [...formData.context, newContext] })
      setNewContext("")
    }
  }

  const removeContext = (ctx: string) => {
    setFormData({
      ...formData,
      context: formData.context.filter((c) => c !== ctx),
    })
  }

  const toggleDependency = (taskId: string) => {
    if (formData.dependencies.includes(taskId)) {
      setFormData({
        ...formData,
        dependencies: formData.dependencies.filter((d) => d !== taskId),
      })
    } else {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, taskId],
      })
    }
  }

  const availableDependencies = existingTasks.filter((t) => t.id !== task?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        aria-labelledby="task-dialog-title"
        aria-describedby="task-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="task-dialog-title">{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription id="task-dialog-description">
            Define a task for your AI agents to execute
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4" role="form" aria-label="Task configuration form">
          <fieldset className="space-y-4">
            <legend className="sr-only">Basic Information</legend>

            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                ref={firstInputRef}
                id="task-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Research Market Trends"
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "task-name-error" : undefined}
              />
              {errors.name && (
                <p id="task-name-error" className="text-xs text-destructive" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this task should accomplish"
                rows={3}
                className={errors.description ? "border-destructive" : ""}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "task-description-error" : undefined}
              />
              {errors.description && (
                <p id="task-description-error" className="text-xs text-destructive" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-expectedOutput">Expected Output</Label>
              <Textarea
                id="task-expectedOutput"
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                placeholder="What should be delivered when this task completes?"
                rows={2}
                className={errors.expectedOutput ? "border-destructive" : ""}
                aria-invalid={!!errors.expectedOutput}
                aria-describedby={errors.expectedOutput ? "task-expectedOutput-error" : undefined}
              />
              {errors.expectedOutput && (
                <p id="task-expectedOutput-error" className="text-xs text-destructive" role="alert">
                  {errors.expectedOutput}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="sr-only">Assignment and Priority</legend>

            <div className="space-y-2">
              <Label htmlFor="task-agent">Assign to Agent</Label>
              <Select value={formData.agent} onValueChange={(value) => setFormData({ ...formData, agent: value })}>
                <SelectTrigger id="task-agent" aria-label="Select agent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentOptions.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="task-priority" aria-label="Select priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          {availableDependencies.length > 0 && (
            <fieldset className="space-y-4">
              <legend className="font-medium">Dependencies</legend>
              <p className="text-xs text-muted-foreground">
                Select tasks that must complete before this task can start
              </p>
              <div
                className="space-y-2 rounded-lg border border-border p-4"
                role="group"
                aria-label="Task dependencies"
              >
                {availableDependencies.map((t) => (
                  <div key={t.id} className="flex items-center space-x-2 h-11">
                    <Checkbox
                      id={`dep-${t.id}`}
                      checked={formData.dependencies.includes(t.id)}
                      onCheckedChange={() => toggleDependency(t.id)}
                      aria-describedby={`dep-${t.id}-agent`}
                    />
                    <label
                      htmlFor={`dep-${t.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t.name}
                    </label>
                    <Badge variant="outline" className="text-xs" id={`dep-${t.id}-agent`}>
                      {t.agent}
                    </Badge>
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-4">
            <legend className="font-medium">Context Variables</legend>
            <p className="text-xs text-muted-foreground">Add context that will be available to this task</p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="task-context-input"
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addContext())}
                placeholder="Add context (e.g., previous_data)"
                aria-label="New context variable"
              />
              <Button
                type="button"
                onClick={addContext}
                className="h-11"
                disabled={!newContext}
                aria-label="Add context variable"
              >
                Add
              </Button>
            </div>

            {formData.context.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label={`Context variables: ${formData.context.length} items`}
              >
                {formData.context.map((ctx) => (
                  <Badge key={ctx} variant="secondary" className="gap-1" role="listitem">
                    {ctx}
                    <button
                      type="button"
                      onClick={() => removeContext(ctx)}
                      className="ml-1 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Remove ${ctx} context`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "pending" | "in-progress" | "completed" | "failed") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="task-status" aria-label="Select task status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-11">
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
