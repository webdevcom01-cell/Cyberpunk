import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { taskSchema } from "@/lib/validations"
import { validateRequest, validationErrorResponse } from "@/lib/api-validation"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        *,
        agent:agents(id, name, role)
      `)
      .order("execution_order", { ascending: true })

    if (error) {
      console.error("[v0] Database error fetching tasks:", error)
      return NextResponse.json({ tasks: [] })
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ tasks: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const validation = validateRequest(taskSchema, body)
    if (!validation.success) {
      const errorResponse = validationErrorResponse(validation)
      return errorResponse || NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        name: validation.data.name,
        description: validation.data.description,
        agent_id: validation.data.agent,
        workflow_id: body.workflow_id,
        dependencies: validation.data.dependencies,
        priority: validation.data.priority,
        expected_output: validation.data.expectedOutput,
        context_variables: { context: validation.data.context },
        execution_order: validation.data.order,
        status: validation.data.status,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
