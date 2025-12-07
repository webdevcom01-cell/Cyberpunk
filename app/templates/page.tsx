"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Search, Sparkles, TrendingUp, Clock, Users, Briefcase, Code, FileText,
  Star, ArrowRight, Bot, MessageSquare, Zap, Target, BarChart, Mail,
  ShoppingCart, FileCode, TestTube, Palette, GitBranch, Database
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Template categories with counts
const categories = [
  { id: "all", name: "All Templates", count: 45, icon: Sparkles },
  { id: "content", name: "Content Creation", count: 12, icon: FileText },
  { id: "data", name: "Data & Research", count: 8, icon: TrendingUp },
  { id: "business", name: "Business Automation", count: 15, icon: Briefcase },
  { id: "developer", name: "Developer Tools", count: 10, icon: Code },
]

// Template data with colors and icons instead of images
const templates = [
  {
    id: 1,
    category: "content",
    name: "Blog Post Writer",
    description: "Generate SEO-optimized blog posts with comprehensive research and structured content",
    icon: FileText,
    color: "from-blue-500/20 via-cyan-500/20 to-blue-500/20",
    borderColor: "border-blue-500/30",
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
    description: "Create engaging posts for all platforms with AI-powered content optimization",
    icon: MessageSquare,
    color: "from-purple-500/20 via-pink-500/20 to-purple-500/20",
    borderColor: "border-purple-500/30",
    usedBy: 1870,
    rating: 4.8,
    setupTime: "3 min",
    agents: ["Content Creator", "Hashtag Generator"],
    featured: true,
  },
  {
    id: 3,
    category: "data",
    name: "Market Research Agent",
    description: "Analyze competitors and market trends with deep data insights",
    icon: BarChart,
    color: "from-green-500/20 via-emerald-500/20 to-green-500/20",
    borderColor: "border-green-500/30",
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
    description: "Track and analyze competitor strategies with real-time monitoring",
    icon: Target,
    color: "from-orange-500/20 via-amber-500/20 to-orange-500/20",
    borderColor: "border-orange-500/30",
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
    description: "Automated customer service with intelligent response generation",
    icon: Bot,
    color: "from-cyan-500/20 via-blue-500/20 to-cyan-500/20",
    borderColor: "border-cyan-500/30",
    usedBy: 3200,
    rating: 4.9,
    setupTime: "2 min",
    agents: ["Support Agent", "Knowledge Base"],
    featured: true,
  },
  {
    id: 6,
    category: "business",
    name: "Sales Outreach Sequence",
    description: "Personalized cold email campaigns with AI-powered personalization",
    icon: Mail,
    color: "from-red-500/20 via-rose-500/20 to-red-500/20",
    borderColor: "border-red-500/30",
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
    description: "Generate and review production-ready code with best practices",
    icon: FileCode,
    color: "from-violet-500/20 via-purple-500/20 to-violet-500/20",
    borderColor: "border-violet-500/30",
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
    description: "Analyze and fix code issues automatically with AI-powered debugging",
    icon: TestTube,
    color: "from-yellow-500/20 via-orange-500/20 to-yellow-500/20",
    borderColor: "border-yellow-500/30",
    usedBy: 1270,
    rating: 4.7,
    setupTime: "3 min",
    agents: ["Bug Detector", "Fix Generator"],
    featured: false,
  },
  {
    id: 9,
    category: "content",
    name: "Video Script Writer",
    description: "Create engaging video scripts for YouTube, TikTok, and social media",
    icon: Palette,
    color: "from-pink-500/20 via-rose-500/20 to-pink-500/20",
    borderColor: "border-pink-500/30",
    usedBy: 1890,
    rating: 4.8,
    setupTime: "3 min",
    agents: ["Script Writer", "Hook Generator"],
    featured: false,
  },
  {
    id: 10,
    category: "business",
    name: "E-commerce Optimizer",
    description: "Optimize product listings and descriptions for better conversion",
    icon: ShoppingCart,
    color: "from-emerald-500/20 via-teal-500/20 to-emerald-500/20",
    borderColor: "border-emerald-500/30",
    usedBy: 2100,
    rating: 4.8,
    setupTime: "3 min",
    agents: ["SEO Agent", "Copy Writer"],
    featured: true,
  },
  {
    id: 11,
    category: "developer",
    name: "Git Commit Helper",
    description: "Generate meaningful commit messages and PR descriptions automatically",
    icon: GitBranch,
    color: "from-slate-500/20 via-gray-500/20 to-slate-500/20",
    borderColor: "border-slate-500/30",
    usedBy: 1450,
    rating: 4.6,
    setupTime: "2 min",
    agents: ["Commit Generator"],
    featured: false,
  },
  {
    id: 12,
    category: "data",
    name: "Database Query Builder",
    description: "Convert natural language to SQL queries with optimization suggestions",
    icon: Database,
    color: "from-indigo-500/20 via-blue-500/20 to-indigo-500/20",
    borderColor: "border-indigo-500/30",
    usedBy: 1680,
    rating: 4.7,
    setupTime: "3 min",
    agents: ["SQL Generator", "Query Optimizer"],
    featured: false,
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null)

  const handleUseTemplate = (template: typeof templates[0]) => {
    // Navigate to workflow builder with template data
    router.push(`/workflow-builder?template=${template.id}`)
  }

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
          description="Ready-to-use AI workflow templates"
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
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="glass-card border-white/10 inline-flex gap-2 w-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Featured Templates */}
          {selectedCategory === "all" && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Featured Templates</h2>
                  <p className="text-sm text-muted-foreground">Most popular and recommended workflows</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates
                  .filter((t) => t.featured)
                  .map((template, index) => {
                    const Icon = template.icon
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`glass-card ${template.borderColor} overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg`}
                          onMouseEnter={() => setHoveredTemplate(template.id)}
                          onMouseLeave={() => setHoveredTemplate(null)}
                        >
                          {/* Icon Header with Gradient */}
                          <div className={`relative h-40 bg-gradient-to-br ${template.color} flex items-center justify-center overflow-hidden`}>
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                            <motion.div
                              animate={{
                                scale: hoveredTemplate === template.id ? 1.1 : 1,
                                rotate: hoveredTemplate === template.id ? 5 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                              className="relative z-10"
                            >
                              <div className="h-20 w-20 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-xl">
                                <Icon className="h-10 w-10 text-primary" />
                              </div>
                            </motion.div>
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                              <Badge variant="secondary" className="gap-1 text-xs backdrop-blur-sm bg-background/80">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {template.rating}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="p-5">
                            <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                              {template.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {template.description}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                <span className="font-medium">{template.usedBy.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{template.setupTime}</span>
                              </div>
                            </div>

                            {/* Agents */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {template.agents.map((agent) => (
                                <Badge key={agent} variant="outline" className="text-xs">
                                  {agent}
                                </Badge>
                              ))}
                            </div>

                            {/* CTA */}
                            <Button className="w-full group/btn" onClick={() => handleUseTemplate(template)}>
                              <span>Use Template</span>
                              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* All Templates Grid */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold">
                {selectedCategory === "all" ? "All Templates" : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template, index) => {
                const Icon = template.icon
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className={`glass-card ${template.borderColor} overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md h-full`}
                      onMouseEnter={() => setHoveredTemplate(template.id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                    >
                      {/* Icon Header */}
                      <div className={`relative h-32 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]" />
                        <motion.div
                          animate={{
                            scale: hoveredTemplate === template.id ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10"
                        >
                          <div className="h-14 w-14 rounded-xl bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Icon className="h-7 w-7 text-primary" />
                          </div>
                        </motion.div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/70">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                            {template.rating}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {template.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{template.usedBy > 1000 ? `${(template.usedBy / 1000).toFixed(1)}K` : template.usedBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.setupTime}</span>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="w-full group/btn" onClick={() => handleUseTemplate(template)}>
                          <span className="text-xs">Use Template</span>
                          <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted/20 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">No templates found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
