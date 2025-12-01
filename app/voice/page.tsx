"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Activity, Zap, Clock, CheckCircle2 } from "lucide-react"

export default function VoiceCommandsPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState("")
  const [commandHistory, setCommandHistory] = useState<
    Array<{
      command: string
      response: string
      timestamp: Date
    }>
  >([])

  const handleVoiceCommand = async () => {
    if (isListening) {
      setIsListening(false)
      setIsProcessing(true)

      // Simulate processing
      setTimeout(() => {
        const responses = {
          "run my blog workflow": "Running Blog Generation Workflow...",
          "show me last week's results": "Displaying analytics for Nov 23-30...",
          "add a proofreading agent": "Added Editor Agent with grammar tools",
          "make it faster": "Switched to parallel execution. Expected time: 30s → 12s",
        }

        const command = transcript.toLowerCase()
        let responseText = "Command executed successfully"

        for (const [key, value] of Object.entries(responses)) {
          if (command.includes(key.split(" ")[0])) {
            responseText = value
            break
          }
        }

        setResponse(responseText)
        setCommandHistory((prev) => [{ command: transcript, response: responseText, timestamp: new Date() }, ...prev])
        setIsProcessing(false)
      }, 2000)
    } else {
      setIsListening(true)
      setTranscript("Hey CrewAI, run my blog workflow")

      // Simulate speech recognition
      setTimeout(() => {
        handleVoiceCommand()
      }, 2000)
    }
  }

  const exampleCommands = [
    { text: "Hey CrewAI, run my blog workflow", action: "Execute workflow" },
    { text: "Show me last week's results", action: "Display analytics" },
    { text: "Add a proofreading agent", action: "Create agent" },
    { text: "Make it faster", action: "Optimize performance" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Voice Commands" description="Control your workflows with natural speech" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Voice Input Card */}
            <Card className="glass-card border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-6">
                  <Button
                    onClick={handleVoiceCommand}
                    size="lg"
                    disabled={isProcessing}
                    className={`h-32 w-32 rounded-full transition-all ${
                      isListening
                        ? "bg-destructive hover:bg-destructive/90 scale-110 animate-pulse"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isListening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">
                      {isListening ? "Listening..." : isProcessing ? "Processing..." : "Click to speak"}
                    </p>
                    {isListening && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="h-1 w-1 animate-bounce rounded-full bg-destructive [animation-delay:-0.3s]" />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-destructive [animation-delay:-0.15s]" />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-destructive" />
                      </div>
                    )}
                  </div>

                  {transcript && (
                    <div className="w-full rounded-xl border bg-card/40 p-4">
                      <p className="text-sm text-muted-foreground mb-2">You said:</p>
                      <p className="text-lg font-medium">"{transcript}"</p>
                    </div>
                  )}

                  {response && (
                    <div className="w-full rounded-xl border bg-accent/10 p-4 animate-in fade-in">
                      <p className="text-sm text-muted-foreground mb-2">AI Response:</p>
                      <p className="font-medium text-accent">"{response}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tech Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Technology
                </CardTitle>
                <CardDescription>Powered by Whisper API + Command Parsing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Speech-to-Text</p>
                      <p className="text-xs text-muted-foreground">OpenAI Whisper</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-xs text-muted-foreground">~1-2 seconds</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Commands */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Example Commands</CardTitle>
                <CardDescription>Try these voice commands to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleCommands.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-card/40 p-4 hover:bg-card/60 transition-colors"
                  >
                    <div>
                      <p className="font-medium">"{cmd.text}"</p>
                      <p className="text-sm text-muted-foreground">{cmd.action}</p>
                    </div>
                    <Badge variant="secondary">{index + 1}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Command History */}
            {commandHistory.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Recent Commands</CardTitle>
                  <CardDescription>Your voice command history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {commandHistory.map((item, index) => (
                    <div key={index} className="rounded-lg border bg-card/40 p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">"{item.command}"</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.response}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
