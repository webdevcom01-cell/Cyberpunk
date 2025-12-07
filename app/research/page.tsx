"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Sparkles, Copy, Download, RefreshCw, Database, Zap, Brain } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface ResearchResult {
  id: string
  query: string
  result: string
  timestamp: Date
  status: "completed" | "error"
}

export default function ResearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResearchResult[]>([])
  const [currentResult, setCurrentResult] = useState<string | null>(null)

  const exampleQueries = [
    "Research crypto market trends for 2024",
    "Analyze top 5 AI startups and their valuations",
    "Compare Bitcoin vs Ethereum performance",
    "Find latest news about tech layoffs",
  ]

  const handleResearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a research query")
      return
    }

    setLoading(true)
    setCurrentResult(null)

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      setCurrentResult(data.result)
      setResults((prev) => [
        {
          id: crypto.randomUUID(),
          query,
          result: data.result,
          timestamp: new Date(),
          status: "completed",
        },
        ...prev,
      ])
      toast.success("Research completed!")
    } catch (error) {
      toast.error("Failed to complete research")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const downloadResult = (result: ResearchResult) => {
    const content = `Query: ${result.query}\n\nResult:\n${result.result}\n\nGenerated: ${result.timestamp.toLocaleString()}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `research-${Date.now()}.txt`
    a.click()
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        </div>

        <Header
          title="Deep Research Protocol"
          description="Neural network-powered intelligence gathering"
          action={
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary">
                <Brain className="h-3 w-3 animate-pulse" />
                <span className="hidden sm:inline">AI Core Active</span>
              </Badge>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card mb-6 border-primary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                    Initialize Research Query
                  </span>
                </CardTitle>
                <CardDescription className="text-base">
                  Deploy autonomous agents to gather and synthesize intelligence from the data matrix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="relative">
                  <Textarea
                    placeholder="e.g., Conduct deep analysis on quantum computing breakthroughs and their impact on cryptography..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={5}
                    className="resize-none text-base bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl p-4 shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Sparkles className="h-5 w-5 text-primary/30" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Quick Deploy Templates:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exampleQueries.map((example, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(example)}
                        className="text-xs justify-start h-auto py-3 border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <Database className="h-3 w-3 mr-2 text-primary/50 group-hover:text-cyan-400 transition-colors" />
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleResearch}
                  disabled={!query.trim() || loading}
                  size="lg"
                  className="w-full h-14 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scanning Data Matrix...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Execute Research Protocol
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loading State with Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6"
              >
                <Card className="glass-card border-primary/30 bg-primary/5">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-primary">Neural Processing Active</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Deploying autonomous agents across the network...
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 rounded-full bg-primary animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Result */}
          <AnimatePresence>
            {currentResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Card className="glass-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
                        Intelligence Report
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(currentResult)}
                          className="border-primary/20 hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Clone
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery("")
                            setCurrentResult(null)
                          }}
                          className="border-primary/20 hover:bg-primary/10"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed p-6 rounded-xl bg-background/30 border border-primary/10 backdrop-blur-sm">
                        {currentResult}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Archive Log
                  </CardTitle>
                  <CardDescription>Historical intelligence queries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.slice(0, 10).map((result, idx) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm font-mono">{result.query}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.result)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadResult(result)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.result.substring(0, 200)}...
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {results.length === 0 && !currentResult && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-dashed border-primary/20">
                <CardContent className="py-16 text-center">
                  <div className="h-24 w-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                    <Search className="h-12 w-12 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Archive Empty
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    No intelligence reports in the database. Initialize your first research protocol to begin data collection.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
