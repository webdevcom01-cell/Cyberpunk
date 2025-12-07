"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Flame, Star, DollarSign, Verified, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MarketplaceAgent {
  id: string
  name: string
  rating: number
  uses: number
  price: number
  creator: string
  verified: boolean
  premium: boolean
}

export default function MarketplacePage() {
  const router = useRouter()
  const [agents] = useState<MarketplaceAgent[]>([
    {
      id: "1",
      name: "SEO Content Optimizer",
      rating: 4.9,
      uses: 2300,
      price: 0,
      creator: "@marketingpro",
      verified: true,
      premium: false,
    },
    {
      id: "2",
      name: "LinkedIn Post Generator",
      rating: 4.8,
      uses: 1800,
      price: 5,
      creator: "@socialmedia_guru",
      verified: false,
      premium: true,
    },
    {
      id: "3",
      name: "Bug Report Analyzer",
      rating: 4.7,
      uses: 1200,
      price: 0,
      creator: "@devtools",
      verified: true,
      premium: false,
    },
  ])

  const handlePreview = (agent: MarketplaceAgent) => {
    toast.info(`Opening preview for ${agent.name}...`)
    // In a real app, this would open a modal or navigate to preview page
  }

  const handleAddAgent = (agent: MarketplaceAgent) => {
    if (agent.premium) {
      toast.success(`Redirecting to checkout for ${agent.name}...`)
      // In a real app, this would navigate to payment page
    } else {
      toast.success(`${agent.name} added to your workspace!`)
      // In a real app, this would add the agent to user's workspace
      setTimeout(() => {
        router.push('/agents')
      }, 1500)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Agent Marketplace"
          description="Community-driven agent sharing"
          action={
            <Button onClick={() => toast.info("Publishing feature coming soon!")}>
              <DollarSign className="h-4 w-4 mr-2" />
              Publish Your Agent
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Card className="glass-card mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search agents..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold">Trending Agents This Week</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, idx) => (
                <Card key={agent.id} className="glass-card hover:border-cyan-400/50 transition-all group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">{idx + 1}.</span>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-bold">{agent.rating}</span>
                        </div>
                        {agent.verified && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Verified className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-cyan-400 transition-colors">{agent.name}</CardTitle>
                    <CardDescription className="text-xs">
                      by {agent.creator} | {agent.uses.toLocaleString()} uses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {agent.premium ? (
                          <Badge variant="default" className="gap-1">
                            <DollarSign className="h-3 w-3" />${agent.price}/month
                          </Badge>
                        ) : (
                          <Badge variant="outline">$0 (Free)</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(agent)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddAgent(agent)}
                        >
                          {agent.premium ? "Buy" : "Add to Workspace"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
