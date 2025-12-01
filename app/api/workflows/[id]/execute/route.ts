import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get workflow with tasks and agents
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select(`
        *,
        tasks:task_ids
      `)
      .eq("id", id)
      .single()

    if (workflowError) throw workflowError

    // Generate trace ID for this execution
    const traceId = crypto.randomUUID()
    const workflowSpanId = crypto.randomUUID()

    // Create workflow execution trace
    const { error: traceError } = await supabase.from("execution_traces").insert({
      trace_id: traceId,
      span_id: workflowSpanId,
      workflow_id: id,
      span_name: `Execute: ${workflow.name}`,
      span_type: "workflow",
      start_time: new Date().toISOString(),
      status: "running",
      metadata: {
        total_tasks: workflow.task_ids?.length || 0,
      },
    })

    if (traceError) throw traceError

    // Update workflow status
    await supabase.from("workflows").update({ status: "active" }).eq("id", id)

    // Log execution start
    await supabase.from("execution_logs").insert({
      trace_id: traceId,
      span_id: workflowSpanId,
      log_level: "info",
      message: `Workflow execution started: ${workflow.name}`,
      metadata: { workflow_id: id },
    })

    return NextResponse.json({
      trace_id: traceId,
      span_id: workflowSpanId,
      status: "started",
    })
  } catch (error) {
    console.error("[v0] Error executing workflow:", error)
    return NextResponse.json({ error: "Failed to execute workflow" }, { status: 500 })
  }
}
