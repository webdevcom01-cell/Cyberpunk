"use client"

import { Handle, Position } from "reactflow"
import { CheckSquare } from "lucide-react"

export function TaskNode({ data }: { data: { label: string; id: string } }) {
  return (
    <div className="glass-card border-primary/50 rounded-xl p-4 min-w-[200px] shadow-xl shadow-primary/20">
      <Handle type="target" position={Position.Top} className="!bg-primary !border-primary/50 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center">
          <CheckSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Task</div>
          <div className="text-sm font-medium text-foreground">{data.label}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary/50 !w-3 !h-3" />
    </div>
  )
}
