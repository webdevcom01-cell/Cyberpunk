"use client"

import { Handle, Position } from "reactflow"
import { Bot } from "lucide-react"

export function AgentNode({ data }: { data: { label: string; id: string } }) {
  return (
    <div className="glass-card border-accent/50 rounded-xl p-4 min-w-[200px] shadow-xl shadow-accent/20">
      <Handle type="target" position={Position.Top} className="!bg-accent !border-accent/50 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <Bot className="h-5 w-5 text-accent" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">Agent</div>
          <div className="text-sm font-medium text-foreground">{data.label}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent !border-accent/50 !w-3 !h-3" />
    </div>
  )
}
