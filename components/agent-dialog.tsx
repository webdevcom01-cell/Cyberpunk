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
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { agentSchema, type AgentFormData } from "@/lib/validations"
import { toast } from "sonner"
import { z } from "zod"

interface Agent {
  id: string
  name: string
  role: string
  goal: string
  backstory: string
  model: string
  temperature: number
  maxTokens: number
  tools: string[]
  status: "active" | "idle" | "disabled"
}

interface AgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (agent: Agent) => void
}

const availableTools = [
  "web_search",
  "calculator",
  "file_reader",
  "text_formatter",
  "grammar_check",
  "data_visualizer",
  "csv_parser",
  "image_generator",
  "code_executor",
]

const modelOptions = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet", "llama-2-70b"]

export function AgentDialog({ open, onOpenChange, agent, onSave }: AgentDialogProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    tools: [] as string[],
    status: "active" as "active" | "idle" | "disabled",
  })

  const [newTool, setNewTool] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({})

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
        backstory: agent.backstory,
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        tools: agent.tools,
        status: agent.status,
      })
    } else {
      setFormData({
        name: "",
        role: "",
        goal: "",
        backstory: "",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
        tools: [],
        status: "active",
      })
    }
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [agent, open])

  const handleSave = () => {
    try {
      const validatedData = agentSchema.parse(formData)
      const savedAgent: Agent = {
        id: agent?.id || Date.now().toString(),
        ...validatedData,
      }
      onSave(savedAgent)
      toast.success(agent ? "Agent updated successfully" : "Agent created successfully")
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof AgentFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof AgentFormData] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error("Please fix the errors in the form")
      }
    }
  }

  const addTool = (tool: string) => {
    if (tool && !formData.tools.includes(tool)) {
      setFormData({ ...formData, tools: [...formData.tools, tool] })
      setNewTool("")
    }
  }

  const removeTool = (tool: string) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((t) => t !== tool),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        aria-labelledby="agent-dialog-title"
        aria-describedby="agent-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="agent-dialog-title" className="text-base md:text-lg">
            {agent ? "Edit Agent" : "Create New Agent"}
          </DialogTitle>
          <DialogDescription id="agent-dialog-description" className="text-xs md:text-sm">
            Configure your AI agent with specific roles, goals, and capabilities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4" role="form" aria-label="Agent configuration form">
          <fieldset className="space-y-3 md:space-y-4">
            <legend className="sr-only">Basic Information</legend>
            <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  ref={firstInputRef}
                  id="agent-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Research Agent"
                  className={errors.name ? "border-destructive" : ""}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-role">Role</Label>
                <Input
                  id="agent-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Senior Research Analyst"
                  className={errors.role ? "border-destructive" : ""}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? "role-error" : undefined}
                />
                {errors.role && (
                  <p id="role-error" className="text-xs text-destructive" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-goal">Goal</Label>
              <Textarea
                id="agent-goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="What should this agent accomplish?"
                rows={2}
                className={errors.goal ? "border-destructive" : ""}
                aria-invalid={!!errors.goal}
                aria-describedby={errors.goal ? "goal-error" : undefined}
              />
              {errors.goal && (
                <p id="goal-error" className="text-xs text-destructive" role="alert">
                  {errors.goal}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-backstory">Backstory</Label>
              <Textarea
                id="agent-backstory"
                value={formData.backstory}
                onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                placeholder="Give your agent context and personality"
                rows={3}
                className={errors.backstory ? "border-destructive" : ""}
                aria-invalid={!!errors.backstory}
                aria-describedby={errors.backstory ? "backstory-error" : undefined}
              />
              {errors.backstory && (
                <p id="backstory-error" className="text-xs text-destructive" role="alert">
                  {errors.backstory}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Model Configuration</legend>

            <div className="space-y-2">
              <Label htmlFor="agent-model">AI Model</Label>
              <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                <SelectTrigger id="agent-model" aria-label="Select AI model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="agent-temperature">
                  Temperature: <span aria-live="polite">{formData.temperature}</span>
                </Label>
              </div>
              <Slider
                id="agent-temperature"
                value={[formData.temperature]}
                onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
                aria-label={`Temperature slider, current value ${formData.temperature}`}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={formData.temperature}
              />
              <p id="temperature-hint" className="text-xs text-muted-foreground">
                Lower values make output more focused, higher values more creative
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-maxTokens">Max Tokens</Label>
              <Input
                id="agent-maxTokens"
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: Number.parseInt(e.target.value) || 0 })}
                min={100}
                max={8000}
                step={100}
                className={errors.maxTokens ? "border-destructive" : ""}
                aria-invalid={!!errors.maxTokens}
                aria-describedby={errors.maxTokens ? "maxTokens-error" : undefined}
              />
              {errors.maxTokens && (
                <p id="maxTokens-error" className="text-xs text-destructive" role="alert">
                  {errors.maxTokens}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-3 md:space-y-4">
            <legend className="text-xs md:text-sm font-semibold text-foreground">Tools</legend>

            <div className="space-y-2">
              <Label htmlFor="agent-tools" className="text-xs md:text-sm">
                Add Tools
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Select value={newTool} onValueChange={setNewTool}>
                    <SelectTrigger id="agent-tools" className="text-xs md:text-sm" aria-label="Select a tool to add">
                      <SelectValue placeholder="Select a tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTools
                        .filter((tool) => !formData.tools.includes(tool))
                        .map((tool) => (
                          <SelectItem key={tool} value={tool} className="text-xs md:text-sm">
                            {tool}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={() => addTool(newTool)}
                  size="sm"
                  className="text-xs md:text-sm h-11"
                  disabled={!newTool}
                  aria-label="Add selected tool"
                >
                  Add
                </Button>
              </div>
            </div>

            {formData.tools.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label={`Selected tools: ${formData.tools.length} tools`}
              >
                {formData.tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="gap-1 text-xs" role="listitem">
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTool(tool)}
                      className="ml-1 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Remove ${tool} tool`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="agent-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "idle" | "disabled") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="agent-status" aria-label="Select agent status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
            className="w-full sm:w-auto text-xs md:text-sm h-11"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm" className="w-full sm:w-auto text-xs md:text-sm h-11">
            {agent ? "Save Changes" : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
