import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: agent, error } = await supabase.from("agents").select("*").eq("id", id).single()

    if (error) throw error

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("[v0] Error fetching agent:", error)
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: agent, error } = await supabase.from("agents").update(body).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("[v0] Error updating agent:", error)
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("agents").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting agent:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
