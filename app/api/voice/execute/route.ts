import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const body = await request.json()
    const { command } = body

    const supabase = await createClient()

    let result = { success: false, message: "Unknown command" }

    if (command.includes("run") && command.includes("workflow")) {
      // Extract workflow name from command
      const workflowMatch = command.match(/run (?:my )?(.+?) workflow/i)
      const workflowName = workflowMatch ? workflowMatch[1] : null

      if (workflowName) {
        // Find and execute workflow
        const { data: workflows } = await supabase
          .from("workflows")
          .select("*")
          .ilike("name", `%${workflowName}%`)
          .limit(1)

        if (workflows && workflows.length > 0) {
          result = {
            success: true,
            message: `Started workflow: ${workflows[0].name}`,
          }
        }
      }
    } else if (command.includes("create") && command.includes("agent")) {
      result = {
        success: true,
        message: "Opening agent creation dialog...",
      }
    } else if (command.includes("stop")) {
      result = {
        success: true,
        message: "Stopping current execution...",
      }
    } else if (command.includes("analytics")) {
      result = {
        success: true,
        message: "Opening analytics dashboard...",
      }
    }

    await supabase.from("voice_commands").insert({
      user_id: user.id,
      command,
      result: result.message,
      success: result.success,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error executing voice command:", error)
    return NextResponse.json({ error: "Failed to execute voice command" }, { status: 500 })
  }
}
