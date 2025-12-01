import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("workflow_id")

    const supabase = await createClient()

    const { data: sessions, error } = await supabase
      .from("collaboration_sessions")
      .select("*")
      .eq("workflow_id", workflowId)
      .eq("active", true)

    if (error) {
      console.error("[v0] Error fetching collaboration sessions:", error)
      return NextResponse.json({ sessions: [] }, { status: 200 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error("[v0] Error in collaboration API:", error)
    return NextResponse.json({ sessions: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const { data: session, error } = await supabase
      .from("collaboration_sessions")
      .insert({
        user_id: user.id,
        workflow_id: body.workflowId,
        cursor_position: body.cursorPosition,
        status: body.status || "viewing",
        active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating collaboration session:", error)
    return NextResponse.json({ error: "Failed to join collaboration session" }, { status: 500 })
  }
}
