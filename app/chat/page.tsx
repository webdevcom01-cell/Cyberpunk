"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Bot, User, Trash2, Sparkles, Terminal } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast.success("Chat cleared")
  }

  const quickPrompts = [
    "Explain blockchain technology",
    "How to start investing in crypto?",
    "What are AI agents?",
    "Create a marketing plan",
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Header
          title="Neural Chat Interface"
          description="Direct uplink to the central AI core"
          action={
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="gap-2 border-primary/20 bg-primary/10 text-primary animate-pulse hidden sm:flex">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Uplink Stable
              </Badge>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Purge Log
                </Button>
              )}
            </div>
          }
        />

        <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 relative z-10">
          {/* Messages Area */}
          <Card className="glass-card flex-1 overflow-hidden flex flex-col border-primary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)] animate-pulse">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Awaiting Input
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Establish connection with the neural core. Query any topic from quantum mechanics to market dynamics.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {quickPrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => setInput(prompt)}
                        className="text-xs justify-start h-auto py-3 border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <Terminal className="h-3 w-3 mr-2 text-primary/50 group-hover:text-cyan-400 transition-colors" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted/40 border border-white/10 backdrop-blur-md rounded-tl-sm"
                          }`}
                      >
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-[10px] mt-2 font-mono ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                          <User className="h-4 w-4 text-purple-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/40 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce"></span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>
          </Card>

          {/* Input Area */}
          <div className="mt-4 flex gap-3 relative z-20">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Transmit data to core..."
                disabled={loading}
                className="w-full pl-4 pr-12 py-6 bg-background/50 border-primary/20 focus:border-primary/50 text-base shadow-lg backdrop-blur-sm rounded-xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary/50" />
                )}
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="lg"
              className="h-auto px-6 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
