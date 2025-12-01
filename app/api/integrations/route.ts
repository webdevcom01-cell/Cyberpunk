import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: integrations, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error fetching integrations:", error)
      return NextResponse.json({ integrations: [] })
    }

    return NextResponse.json({ integrations: integrations || [] })
  } catch (error) {
    console.error("[v0] Error fetching integrations:", error)
    return NextResponse.json({ integrations: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: integration, error } = await supabase
      .from("integrations")
      .insert({
        name: body.name,
        type: body.type,
        config: body.config,
        credentials: body.credentials,
        enabled: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ integration }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating integration:", error)
    return NextResponse.json({ error: "Failed to create integration" }, { status: 500 })
  }
}
