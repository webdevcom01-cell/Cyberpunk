"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Trophy } from "lucide-react"
import { useState } from "react"

interface ModelResult {
  model: string
  rating: number
  cost: number
  quality: number
}

export default function PlaygroundPage() {
  const [results] = useState<ModelResult[]>([
    { model: "GPT-4", rating: 5, cost: 0.5, quality: 95 },
    { model: "Gemini Flash", rating: 5, cost: 0.12, quality: 94 },
    { model: "Claude", rating: 4, cost: 0.38, quality: 88 },
    { model: "LLama", rating: 4, cost: 0.08, quality: 85 },
  ])

  const winner = results.reduce((prev, current) =>
    current.quality / current.cost > prev.quality / prev.cost ? current : prev,
  )

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="AI Playground"
          description="Test and compare different AI models"
          action={
            <Badge variant="secondary" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              Sandbox Mode
            </Badge>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Card className="glass-card border-yellow-500/30 bg-yellow-500/5 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <p className="font-semibold">PLAYGROUND MODE</p>
                  <p className="text-sm text-muted-foreground">Changes won't affect production</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Try different AI models:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["GPT-4", "Gemini", "Claude", "LLama"].map((model) => (
                <Button key={model} variant={model === "GPT-4" ? "default" : "outline"} className="h-auto py-4">
                  {model}
                </Button>
              ))}
            </div>
          </div>

          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle>A/B Test Results:</CardTitle>
              <CardDescription>Side-by-side model comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, idx) => (
                <div
                  key={result.model}
                  className={`p-4 rounded-xl border ${
                    result.model === winner.model ? "border-accent bg-accent/10" : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{idx + 1}.</span>
                      <span className="font-semibold">{result.model}:</span>
                      {result.model === winner.model && (
                        <Badge variant="default" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < result.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">${result.cost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Quality:</span>
                      <span className="font-medium">{result.quality}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cost per 1M tokens:</span>
                      <span className="font-medium">${result.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/50 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Winner: {winner.model} (cheaper!)</p>
                  <p className="text-sm text-muted-foreground">
                    Switch to Gemini Flash → save ${(0.5 - winner.cost).toFixed(2)}/month with same quality
                  </p>
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Apply to Production
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
