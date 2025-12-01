import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "trending"

    const supabase = await createClient()

    let query = supabase.from("marketplace_agents").select("*").order("uses", { ascending: false }).limit(50)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data: agents, error } = await query

    if (error) {
      console.error("[v0] Error fetching marketplace agents:", error)
      return NextResponse.json({ agents: [] }, { status: 200 })
    }

    return NextResponse.json({ agents: agents || [] })
  } catch (error) {
    console.error("[v0] Error in marketplace API:", error)
    return NextResponse.json({ agents: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const { data: agent, error } = await supabase
      .from("marketplace_agents")
      .insert({
        name: body.name,
        description: body.description,
        creator_id: user.id,
        creator_name: body.creatorName,
        rating: 0,
        uses: 0,
        price: body.price || 0,
        verified: false,
        premium: body.price > 0,
        agent_config: body.agentConfig,
        category: body.category,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating marketplace agent:", error)
    return NextResponse.json({ error: "Failed to create marketplace agent" }, { status: 500 })
  }
}
