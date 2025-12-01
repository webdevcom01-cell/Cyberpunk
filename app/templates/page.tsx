"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Sparkles, TrendingUp, Clock, Users, Briefcase, Code, FileText, Star, Play } from "lucide-react"
import { motion } from "framer-motion"

// Template categories with counts
const categories = [
  { id: "all", name: "All Templates", count: 45, icon: Sparkles },
  { id: "content", name: "Content Creation", count: 12, icon: FileText },
  { id: "data", name: "Data & Research", count: 8, icon: TrendingUp },
  { id: "business", name: "Business Automation", count: 15, icon: Briefcase },
  { id: "developer", name: "Developer Tools", count: 10, icon: Code },
]

// Mock template data
const templates = [
  {
    id: 1,
    category: "content",
    name: "Blog Post Writer",
    description: "Generate SEO-optimized blog posts with research",
    previewGif: "/blog-writing-animation.jpg",
    usedBy: 2340,
    rating: 4.9,
    setupTime: "2 min",
    agents: ["Research Agent", "Writer Agent", "SEO Agent"],
    featured: true,
  },
  {
    id: 2,
    category: "content",
    name: "Social Media Manager",
    description: "Create engaging posts for all platforms",
    previewGif: "/social-media-content.png",
    usedBy: 1870,
    rating: 4.8,
    setupTime: "3 min",
    agents: ["Content Creator", "Image Generator"],
    featured: true,
  },
  {
    id: 3,
    category: "data",
    name: "Market Research Agent",
    description: "Analyze competitors and market trends",
    previewGif: "/market-analysis-board.png",
    usedBy: 1520,
    rating: 4.7,
    setupTime: "4 min",
    agents: ["Web Scraper", "Data Analyzer"],
    featured: false,
  },
  {
    id: 4,
    category: "data",
    name: "Competitor Analysis Crew",
    description: "Track and analyze competitor strategies",
    previewGif: "/competitor-tracking.jpg",
    usedBy: 980,
    rating: 4.6,
    setupTime: "5 min",
    agents: ["Scraper Agent", "Analyst Agent"],
    featured: false,
  },
  {
    id: 5,
    category: "business",
    name: "Customer Support Bot",
    description: "Automated customer service responses",
    previewGif: "/chatbot-support.jpg",
    usedBy: 3200,
    rating: 4.9,
    setupTime: "2 min",
    agents: ["Support Agent", "KB Agent"],
    featured: true,
  },
  {
    id: 6,
    category: "business",
    name: "Sales Outreach Sequence",
    description: "Personalized cold email campaigns",
    previewGif: "/email-campaign.jpg",
    usedBy: 1650,
    rating: 4.7,
    setupTime: "3 min",
    agents: ["Email Writer", "Personalizer"],
    featured: false,
  },
  {
    id: 7,
    category: "developer",
    name: "Code Generator Crew",
    description: "Generate and review production code",
    previewGif: "/code-generation-concept.png",
    usedBy: 2890,
    rating: 4.8,
    setupTime: "4 min",
    agents: ["Code Generator", "Code Reviewer"],
    featured: true,
  },
  {
    id: 8,
    category: "developer",
    name: "Bug Analyzer Agent",
    description: "Analyze and fix code issues automatically",
    previewGif: "/bug-fixing.png",
    usedBy: 1270,
    rating: 4.7,
    setupTime: "3 min",
    agents: ["Bug Detector", "Fix Generator"],
    featured: false,
  },
]

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null)

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Template Gallery"
          description="Instagram-style template browser"
          action={
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-white/10"
              />
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="glass-card border-white/10 grid w-full grid-cols-5 gap-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Featured Templates */}
          {selectedCategory === "all" && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Featured Templates
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates
                  .filter((t) => t.featured)
                  .map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="glass-card border-accent/30 overflow-hidden group cursor-pointer transition-all hover:scale-105 hover:border-accent"
                        onMouseEnter={() => setHoveredTemplate(template.id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                      >
                        {/* Animated Preview */}
                        <div className="relative aspect-video overflow-hidden bg-muted/20">
                          <img
                            src={template.previewGif || "/placeholder.svg"}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          {hoveredTemplate === template.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Button size="lg" className="gap-2">
                                <Play className="h-4 w-4" />
                                Use Template
                              </Button>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-accent">
                              <Star className="h-4 w-4 fill-accent" />
                              {template.rating}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                          {/* Social Proof */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {template.usedBy.toLocaleString()} uses
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.setupTime} setup
                            </div>
                          </div>

                          {/* Agents */}
                          <div className="flex flex-wrap gap-2">
                            {template.agents.map((agent) => (
                              <Badge key={agent} variant="secondary" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* All Templates Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedCategory === "all" ? "All Templates" : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="glass-card border-white/10 overflow-hidden group cursor-pointer transition-all hover:scale-105 hover:border-accent/50"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted/20">
                      <img
                        src={template.previewGif || "/placeholder.svg"}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      {hoveredTemplate === template.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Button size="sm" className="gap-2">
                            <Play className="h-3 w-3" />
                            Use
                          </Button>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-accent flex-shrink-0 ml-2">
                          <Star className="h-3 w-3 fill-accent" />
                          {template.rating}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {template.usedBy > 1000 ? `${(template.usedBy / 1000).toFixed(1)}K` : template.usedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.setupTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
