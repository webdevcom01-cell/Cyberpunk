"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Calendar, Check, ArrowRight, Bot, Layers, Zap } from "lucide-react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge
} from "reactflow"
import "reactflow/dist/style.css"
import { motion } from "framer-motion"

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

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const examplePrompts = [
    "I want to analyze my competitors' websites every week and send me a report",
    "Monitor social media mentions and generate weekly sentiment analysis",
    "Scrape job postings from tech sites and match with our candidate database",
  ]

  // Convert workflow to nodes and edges when workflow changes
  useEffect(() => {
    if (workflow) {
      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      let yOffset = 50

      // Create Agent Nodes (Top Row)
      workflow.agents.forEach((agent, index) => {
        newNodes.push({
          id: `agent-${index}`,
          type: 'default',
          data: { label: `🤖 ${agent.name}\n(${agent.role})` },
          position: { x: 100 + (index * 250), y: 50 },
          style: {
            background: '#1a1a1a',
            border: '1px solid #22c55e',
            color: '#fff',
            borderRadius: '8px',
            width: 200,
            fontSize: '12px',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
          },
        })
      })

      yOffset += 150

      // Create Task Nodes (Bottom Row)
      workflow.tasks.forEach((task, index) => {
        const nodeId = `task-${index}`
        newNodes.push({
          id: nodeId,
          type: 'default',
          data: { label: `📋 ${task.description}` },
          position: { x: 100 + (index * 250), y: yOffset },
          style: {
            background: '#0a0a0a',
            border: '1px solid #3b82f6',
            color: '#fff',
            borderRadius: '8px',
            width: 200,
            fontSize: '12px',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
          },
        })

        // Connect previous task to current task
        if (index > 0) {
          newEdges.push({
            id: `edge-${index - 1}-${index}`,
            source: `task-${index - 1}`,
            target: nodeId,
            animated: true,
            style: { stroke: '#3b82f6' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          })
        }

        // Connect Agent to Task
        const agentIndex = workflow.agents.findIndex(a => a.name === task.agent)
        if (agentIndex >= 0) {
          newEdges.push({
            id: `edge-agent-${agentIndex}-task-${index}`,
            source: `agent-${agentIndex}`,
            target: nodeId,
            style: { stroke: '#22c55e', strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
          })
        }
      })

      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [workflow, setNodes, setEdges])

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
      <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
        <Card className="flex-1 border-primary/20 bg-background/50 backdrop-blur-sm relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <CardHeader className="relative z-10 border-b border-border/50 bg-background/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                  Neural Workflow Matrix
                </span>
              </CardTitle>
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                {workflow.agents.length} Agents • {workflow.tasks.length} Tasks
              </Badge>
            </div>
          </CardHeader>

          <div className="flex-1 relative min-h-[400px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
              className="bg-background/50"
            >
              <Background color="#333" gap={20} size={1} />
              <Controls className="bg-background border border-border" />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === 'input') return '#0041d0';
                  if (n.type === 'output') return '#ff0072';
                  if (n.type === 'default') return '#1a192b';
                  return '#eee';
                }}
                nodeColor={(n) => {
                  if (n.style?.background) return n.style.background as string;
                  return '#fff';
                }}
                maskColor="rgba(0, 0, 0, 0.7)"
                className="bg-background border border-border"
              />
            </ReactFlow>
          </div>
        </Card>

        <div className="flex gap-4 relative z-10">
          <Button onClick={handleCreateWorkflow} size="lg" disabled={loading} className="flex-1 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initializing Matrix...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Execute Sequence
              </>
            )}
          </Button>
          <Button onClick={() => setStep("input")} variant="outline" size="lg" className="border-primary/20 hover:bg-primary/10">
            <Layers className="mr-2 h-4 w-4" />
            Reconfigure
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-purple-500">
          Describe Your Objective
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The neural engine will analyze your request and architect a multi-agent workflow automatically.
        </p>
      </motion.div>

      <Card className="glass-card border-primary/20 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-8 space-y-6 relative z-10">
          <Textarea
            placeholder="e.g., 'Research the latest advancements in quantum computing, summarize key breakthroughs, and draft a blog post about the potential impact on cryptography.'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="resize-none bg-background/50 border-primary/20 focus:border-primary/50 text-lg p-6 rounded-xl shadow-inner"
          />

          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggested Directives:
            </div>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-xs h-auto py-2 px-4 rounded-full border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleParse}
            disabled={!input.trim() || loading}
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Neural Patterns...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Workflow Matrix
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
