import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { agentSchema } from "@/lib/validations"
import { validateRequest, validationErrorResponse } from "@/lib/api-validation"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: agents, error } = await supabase.from("agents").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error fetching agents:", error)
      return NextResponse.json({ agents: [] })
    }

    return NextResponse.json({ agents: agents || [] })
  } catch (error) {
    console.error("[v0] Error fetching agents:", error)
    return NextResponse.json({ agents: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const validation = validateRequest(agentSchema, body)
    if (!validation.success) {
      const errorResponse = validationErrorResponse(validation)
      return errorResponse || NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name: validation.data.name,
        role: validation.data.role,
        goal: validation.data.goal,
        backstory: validation.data.backstory,
        model: validation.data.model,
        temperature: validation.data.temperature,
        max_tokens: validation.data.maxTokens,
        tools: validation.data.tools,
        status: validation.data.status || "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
