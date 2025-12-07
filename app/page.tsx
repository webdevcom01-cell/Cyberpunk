"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Bot, Workflow, Sparkles, ArrowRight, Zap, Activity, Terminal } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export default function HomePage() {
  const features = [
    {
      title: "AI Research",
      description: "Deep dive analysis on any topic with autonomous agents",
      icon: Search,
      href: "/research",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      badge: "Most Popular",
      delay: 0.1,
    },
    {
      title: "AI Chat",
      description: "Real-time conversational intelligence interface",
      icon: MessageSquare,
      href: "/chat",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      badge: "Interactive",
      delay: 0.2,
    },
    {
      title: "Agent Forge",
      description: "Design and deploy specialized autonomous agents",
      icon: Bot,
      href: "/agents",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      badge: "Advanced",
      delay: 0.3,
    },
    {
      title: "Workflow Matrix",
      description: "Orchestrate complex multi-agent task pipelines",
      icon: Workflow,
      href: "/workflow-builder",
      color: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/30",
      badge: "Pro",
      delay: 0.4,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/hero-banner.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Header
          title="CrewAI Orchestrator"
          description="Advanced Autonomous Agent Interface"
        />

        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center relative"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              System Online v2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              Orchestrate Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy autonomous agents, build complex workflows, and analyze data with the power of next-generation AI.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.href} variants={item}>
                  <Link href={feature.href}>
                    <Card className={`glass-card ${feature.borderColor} hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full relative overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-shadow`}>
                            <Icon className="h-6 w-6 text-foreground" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-sm">
                            {feature.badge}
                          </span>
                        </div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                          Initialize <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="md:col-span-2"
            >
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    System Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Active Agents</div>
                      <div className="text-2xl font-mono font-bold text-primary">12</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Tasks Pending</div>
                      <div className="text-2xl font-mono font-bold text-yellow-500">5</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                      <div className="text-2xl font-mono font-bold text-green-500">99.9%</div>
                    </div>
                  </div>
                  <div className="mt-6 h-[200px] w-full bg-muted/10 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
                    </div>
                    <div className="text-muted-foreground text-sm flex items-center gap-2 z-10">
                      <Terminal className="h-4 w-4" />
                      Waiting for data stream...
                    </div>
                    {/* Fake data stream animation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 shadow-[0_0_10px_var(--primary)] animate-[pulse_2s_infinite]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/research">
                    <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:text-cyan-400 hover:border-primary/50 transition-all group">
                      <Search className="mr-2 h-4 w-4" />
                      New Research Task
                      <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/agents">
                    <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:text-cyan-400 hover:border-primary/50 transition-all group">
                      <Bot className="mr-2 h-4 w-4" />
                      Deploy Agent
                      <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/workflow-builder">
                    <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:text-cyan-400 hover:border-primary/50 transition-all group">
                      <Workflow className="mr-2 h-4 w-4" />
                      Create Workflow
                      <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
