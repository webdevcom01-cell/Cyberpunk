import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { workflowSchema } from "@/lib/validations"
import { validateRequest, validationErrorResponse } from "@/lib/api-validation"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: workflows, error } = await supabase
      .from("workflows")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error fetching workflows:", error)
      return NextResponse.json({ workflows: [] })
    }

    return NextResponse.json({ workflows: workflows || [] })
  } catch (error) {
    console.error("[v0] Error fetching workflows:", error)
    return NextResponse.json({ workflows: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const validation = validateRequest(workflowSchema, body)
    if (!validation.success) {
      const errorResponse = validationErrorResponse(validation)
      return errorResponse || NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert({
        name: validation.data.name,
        description: validation.data.description,
        agent_ids: validation.data.agent_ids || [],
        task_ids: validation.data.task_ids || [],
        status: validation.data.status || "draft",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating workflow:", error)
    return NextResponse.json(
      { error: "Failed to create workflow", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
