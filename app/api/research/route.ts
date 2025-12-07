import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Simple AI research endpoint
export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    let result: string

    if (openaiKey && openaiKey !== "sk-...") {
      // Use OpenAI
      result = await callOpenAI(query, openaiKey)
    } else if (geminiKey) {
      // Use Gemini
      result = await callGemini(query, geminiKey)
    } else {
      // Demo mode - generate mock response
      result = generateMockResearch(query)
    }

    // Save to database
    const supabase = await createClient()
    await supabase.from("execution_logs").insert({
      trace_id: crypto.randomUUID(),
      span_id: crypto.randomUUID(),
      log_level: "info",
      message: `Research completed: ${query.substring(0, 100)}`,
      metadata: { query, result_length: result.length },
    })

    return NextResponse.json({ result, query })
  } catch (error) {
    console.error("Research error:", error)
    return NextResponse.json(
      { error: "Failed to complete research", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

async function callOpenAI(query: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert research analyst. Provide comprehensive, well-structured research on the given topic. 
Include:
- Key findings and insights
- Current trends and data
- Important statistics if available
- Actionable conclusions

Format your response with clear sections and bullet points for readability.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(query: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert research analyst. Provide comprehensive, well-structured research on the following topic:

${query}

Include:
- Key findings and insights
- Current trends and data
- Important statistics if available
- Actionable conclusions

Format your response with clear sections and bullet points for readability.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
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

function generateMockResearch(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  // Detect topic and generate relevant mock response
  if (lowerQuery.includes("crypto") || lowerQuery.includes("bitcoin") || lowerQuery.includes("ethereum")) {
    return `# Crypto Market Research Report

## Executive Summary
Based on the latest market analysis for your query: "${query}"

## Key Findings

### Market Overview
• Total cryptocurrency market cap: $2.1 trillion (as of late 2024)
• Bitcoin dominance: 52.3%
• 24-hour trading volume: $78 billion

### Top Performing Assets (2024)
1. **Bitcoin (BTC)**: +145% YTD
   - Current price range: $90,000 - $100,000
   - Institutional adoption at all-time high

2. **Ethereum (ETH)**: +89% YTD
   - ETF approval driving institutional interest
   - Layer 2 solutions gaining traction

3. **Solana (SOL)**: +520% YTD
   - Fastest growing ecosystem
   - DeFi TVL exceeding $5 billion

### Market Trends
• Institutional investment continues to grow
• Regulatory clarity improving in major markets
• DeFi and real-world asset tokenization expanding
• AI + Crypto intersection becoming major narrative

### Risk Factors
⚠️ Regulatory uncertainty in some jurisdictions
⚠️ Market volatility remains high
⚠️ Security concerns with bridges and protocols

## Recommendations
1. Diversify across major assets (BTC, ETH, SOL)
2. Consider DCA (Dollar Cost Averaging) strategy
3. Keep 10-20% in stablecoins for opportunities
4. Stay updated on regulatory developments

---
⚡ *Note: This is demo data. Add your OpenAI or Gemini API key for real-time research.*`
  }

  if (lowerQuery.includes("ai") || lowerQuery.includes("startup") || lowerQuery.includes("tech")) {
    return `# AI & Tech Industry Research Report

## Executive Summary
Analysis for: "${query}"

## Key Findings

### AI Industry Overview (2024)
• Global AI market size: $196 billion
• Expected CAGR: 37.3% through 2030
• Investment in AI startups: $50+ billion in 2024

### Top AI Companies by Valuation
1. **OpenAI** - $86 billion
   - Leading in LLM development
   - ChatGPT has 180M+ users

2. **Anthropic** - $18 billion
   - Focus on AI safety
   - Claude models gaining enterprise adoption

3. **xAI** - $24 billion
   - Elon Musk's AI venture
   - Grok model integrated with X platform

4. **Mistral AI** - $6 billion
   - European AI champion
   - Open-source model leader

### Emerging Trends
• AI Agents becoming mainstream
• Multimodal AI (text, image, video, audio)
• Enterprise AI adoption accelerating
• AI regulation taking shape globally

### Investment Opportunities
✓ AI infrastructure (NVIDIA, cloud providers)
✓ AI application layer companies
✓ AI-enabled SaaS platforms
✓ Vertical-specific AI solutions

## Recommendations
1. Monitor AI regulatory developments
2. Consider AI infrastructure investments
3. Watch for AI + industry vertical plays
4. Evaluate AI safety and ethics positioning

---
⚡ *Note: This is demo data. Add your OpenAI or Gemini API key for real-time research.*`
  }

  // Generic research response
  return `# Research Report

## Query Analysis
"${query}"

## Key Findings

### Overview
This research covers the main aspects of your query. Here are the key insights:

### Main Points
• **Market Context**: The topic you've queried is relevant in today's market landscape
• **Current Trends**: Several developments are shaping this space
• **Key Players**: Multiple organizations are active in this area
• **Future Outlook**: Growth potential remains significant

### Analysis
1. **Opportunity Assessment**: Medium-High
2. **Risk Level**: Moderate
3. **Timeline**: Short to medium term

### Recommendations
1. Continue monitoring developments in this area
2. Consider deeper analysis of specific segments
3. Evaluate competitive landscape
4. Assess regulatory implications

### Data Sources
- Industry reports
- Market analysis
- Expert opinions
- Recent news and developments

---
⚡ *Note: This is demo data. To get real AI-powered research:*
*Add OPENAI_API_KEY or GEMINI_API_KEY to your .env.local file*

Example:
\`\`\`
OPENAI_API_KEY=sk-your-key-here
\`\`\`

Then restart the server and try again!`
}
