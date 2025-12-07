import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    let response: string

    if (openaiKey && openaiKey.startsWith("sk-")) {
      response = await callOpenAI(message, history, openaiKey)
    } else if (geminiKey) {
      response = await callGemini(message, history, geminiKey)
    } else {
      // Demo mode
      response = generateMockResponse(message)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}

async function callOpenAI(message: string, history: any[], apiKey: string): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a helpful AI assistant. You are knowledgeable about technology, crypto, AI, business, and many other topics. Be concise but informative. Use markdown formatting when appropriate.`,
    },
    ...history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user",
      content: message,
    },
  ]

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(message: string, history: any[], apiKey: string): Promise<string> {
  const historyText = history
    .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n")

  const prompt = historyText
    ? `Previous conversation:\n${historyText}\n\nUser: ${message}\n\nAssistant:`
    : message

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

function generateMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("crypto") || lowerMessage.includes("bitcoin")) {
    return `Great question about crypto! Here's what I can tell you:

**Key Points:**
• The crypto market is highly volatile but has shown significant growth
• Bitcoin remains the dominant cryptocurrency by market cap
• Always do your own research (DYOR) before investing
• Consider dollar-cost averaging as a strategy

**Tips:**
1. Start with well-established coins (BTC, ETH)
2. Never invest more than you can afford to lose
3. Use reputable exchanges
4. Consider hardware wallets for security

⚡ *This is a demo response. Add your OpenAI or Gemini API key for real AI conversations!*`
  }

  if (lowerMessage.includes("ai") || lowerMessage.includes("agent")) {
    return `AI Agents are fascinating! Here's an overview:

**What are AI Agents?**
AI agents are autonomous systems that can perceive their environment, make decisions, and take actions to achieve specific goals.

**Key Characteristics:**
• Autonomy - Can operate without constant human input
• Reactivity - Respond to changes in environment
• Proactivity - Take initiative to achieve goals
• Social ability - Can interact with other agents or humans

**Examples:**
- Virtual assistants (Siri, Alexa)
- Trading bots
- Customer service chatbots
- Autonomous vehicles

⚡ *This is a demo response. Add your OpenAI or Gemini API key for real AI conversations!*`
  }

  // Generic response
  return `Thanks for your message! I understand you're asking about: "${message}"

I'd be happy to help you with this topic. Here are some general thoughts:

1. This is an interesting area to explore
2. There are many resources available online
3. Consider breaking down complex topics into smaller parts
4. Practice and experimentation are key to learning

**Want real AI responses?**
Add your API key to the .env.local file:
\`\`\`
OPENAI_API_KEY=sk-your-key-here
\`\`\`

Then restart the server and try again!

⚡ *Currently running in demo mode*`
}
