import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const body = await request.json()
    const { audio } = body

    // In production, this would call OpenAI Whisper API
    const mockTranscriptions: Record<string, string> = {
      "run-workflow": "Hey CrewAI, run my blog workflow",
      "create-agent": "Create a new research agent for market analysis",
      "stop-execution": "Stop the current execution",
      "show-analytics": "Show me today's analytics",
    }

    const transcription = mockTranscriptions[audio] || "Unknown command"

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error("[v0] Error transcribing audio:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
