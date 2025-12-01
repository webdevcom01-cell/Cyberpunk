import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const traceId = searchParams.get("trace_id")

    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from("execution_logs")
      .select("*")
      .eq("trace_id", traceId)
      .order("timestamp", { ascending: true })

    if (error) throw error

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("[v0] Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { error } = await supabase.from("execution_logs").insert({
      trace_id: body.trace_id,
      span_id: body.span_id,
      log_level: body.log_level,
      message: body.message,
      metadata: body.metadata || {},
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error creating log:", error)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }
}
