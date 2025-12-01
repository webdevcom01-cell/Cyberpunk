"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Calendar, Check } from "lucide-react"

interface Agent {
  name: string
  role: string
  goal: string
}

interface Task {
  description: string
  agent: string
}

interface ParsedWorkflow {
  agents: Agent[]
  tasks: Task[]
  schedule?: string
}

export function NaturalLanguageWorkflowBuilder({ userId }: { userId: string }) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [workflow, setWorkflow] = useState<ParsedWorkflow | null>(null)
  const [step, setStep] = useState<"input" | "preview" | "customize">("input")

  const examplePrompts = [
    "I want to analyze my competitors' websites every week and send me a report",
    "Monitor social media mentions and generate weekly sentiment analysis",
    "Scrape job postings from tech sites and match with our candidate database",
  ]

  const handleParse = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/workflow-builder/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, userId }),
      })

      if (!response.ok) throw new Error("Failed to parse workflow")

      const data = await response.json()
      setWorkflow(data.workflow)
      setStep("preview")
    } catch (error) {
      console.error("Error parsing workflow:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async () => {
    if (!workflow) return

    setLoading(true)
    try {
      const response = await fetch("/api/workflow-builder/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, userId }),
      })

      if (!response.ok) throw new Error("Failed to create workflow")

      window.location.href = "/workflows"
    } catch (error) {
      console.error("Error creating workflow:", error)
    } finally {
      setLoading(false)
    }
  }

  if (step === "preview" && workflow) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              I'll create this workflow for you:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🤖</span> Agents needed:
              </h3>
              <div className="space-y-2">
                {workflow.agents.map((agent, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                    <span className="text-lg font-bold text-primary">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span> Tasks:
              </h3>
              <div className="space-y-2">
                {workflow.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                    <span className="text-lg font-bold text-primary">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="text-sm">{task.description}</div>
                      <Badge variant="outline" className="mt-1">
                        {task.agent}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {workflow.schedule && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule:
                </h3>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-sm font-medium">{workflow.schedule}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleCreateWorkflow} size="lg" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Looks good! Create Workflow
              </>
            )}
          </Button>
          <Button onClick={() => setStep("input")} variant="outline" size="lg">
            Customize
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe your workflow</CardTitle>
          <CardDescription>Tell me what you want to automate in plain English</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I want to analyze my competitors' websites every week and send me a report"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <div className="space-y-2">
            <div className="text-sm font-medium">Try an example:</div>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-xs h-auto py-2 px-3"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleParse} disabled={!input.trim() || loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
