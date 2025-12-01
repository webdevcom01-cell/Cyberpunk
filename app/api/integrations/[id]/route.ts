import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: integration, error } = await supabase.from("integrations").update(body).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ integration })
  } catch (error) {
    console.error("[v0] Error updating integration:", error)
    return NextResponse.json({ error: "Failed to update integration" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("integrations").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting integration:", error)
    return NextResponse.json({ error: "Failed to delete integration" }, { status: 500 })
  }
}
