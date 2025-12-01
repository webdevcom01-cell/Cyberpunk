import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data: progress, error } = await supabase.from("user_onboarding").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({
      progress: progress || {
        completed_steps: [],
        current_step: 1,
        completed: false,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching onboarding progress:", error)
    return NextResponse.json({ error: "Failed to fetch onboarding progress" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const { data: progress, error } = await supabase
      .from("user_onboarding")
      .upsert({
        user_id: user.id,
        completed_steps: body.completedSteps,
        current_step: body.currentStep,
        completed: body.completed,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[v0] Error updating onboarding progress:", error)
    return NextResponse.json({ error: "Failed to update onboarding progress" }, { status: 500 })
  }
}
