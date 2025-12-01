import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const body = await request.json()
    const { prompt, models } = body

    const results = models.map((model: string) => {
      const costs: Record<string, number> = {
        "gpt-4": 0.5,
        "gemini-flash": 0.12,
        claude: 0.38,
        llama: 0.08,
      }

      const qualities: Record<string, number> = {
        "gpt-4": 95,
        "gemini-flash": 94,
        claude: 88,
        llama: 85,
      }

      return {
        model,
        rating: Math.floor(qualities[model.toLowerCase()] / 20),
        cost: costs[model.toLowerCase()] || 0.3,
        quality: qualities[model.toLowerCase()] || 80,
        response: `Response from ${model}: [AI generated content would be here]`,
      }
    })

    const supabase = await createClient()

    await supabase.from("playground_tests").insert({
      user_id: user.id,
      prompt,
      models,
      results,
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Error in playground compare:", error)
    return NextResponse.json({ error: "Failed to compare models" }, { status: 500 })
  }
}
