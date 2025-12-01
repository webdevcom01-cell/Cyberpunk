import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const traceId = searchParams.get("trace_id")

    const supabase = await createClient()

    let query = supabase.from("metrics").select("*").order("timestamp", { ascending: false })

    if (traceId) {
      query = query.eq("trace_id", traceId)
    }

    const { data: metrics, error } = await query.limit(1000)

    if (error) {
      console.error("[v0] Database error fetching metrics:", error)
      return NextResponse.json({ metrics: [] })
    }

    return NextResponse.json({ metrics: metrics || [] })
  } catch (error) {
    console.error("[v0] Error fetching metrics:", error)
    return NextResponse.json({ metrics: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { error } = await supabase.from("metrics").insert({
      trace_id: body.trace_id,
      metric_name: body.metric_name,
      metric_value: body.metric_value,
      metric_type: body.metric_type,
      tags: body.tags || {},
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error creating metric:", error)
    return NextResponse.json({ error: "Failed to create metric" }, { status: 500 })
  }
}
