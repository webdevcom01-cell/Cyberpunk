import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const traceId = searchParams.get("trace_id")
    const workflowId = searchParams.get("workflow_id")

    const supabase = await createClient()

    let query = supabase.from("execution_traces").select("*").order("start_time", { ascending: false })

    if (traceId) {
      query = query.eq("trace_id", traceId)
    }

    if (workflowId) {
      query = query.eq("workflow_id", workflowId)
    }

    const { data: traces, error } = await query.limit(100)

    if (error) {
      console.error("[v0] Database error fetching traces:", error)
      return NextResponse.json({ traces: [] })
    }

    return NextResponse.json({ traces: traces || [] })
  } catch (error) {
    console.error("[v0] Error fetching traces:", error)
    return NextResponse.json({ traces: [] })
  }
}
