"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Users, MessageSquare, Eye, Edit3, Clock, AtSign, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Mock collaborative users
const users = [
  {
    id: 1,
    name: "Marko",
    avatar: "/diverse-user-avatars.png",
    status: "editing",
    color: "#00ff9f",
    cursor: { x: 45, y: 30 },
  },
  {
    id: 2,
    name: "Ana",
    avatar: "/diverse-user-avatars.png",
    status: "viewing",
    color: "#00d4ff",
    cursor: { x: 60, y: 50 },
  },
  {
    id: 3,
    name: "Petar",
    avatar: "/diverse-user-avatars.png",
    status: "comment",
    color: "#bd00ff",
    cursor: { x: 30, y: 70 },
  },
]

// Mock comments
const mockComments = [
  {
    id: 1,
    user: "Petar",
    avatar: "/diverse-user-avatars.png",
    text: "Should we add human approval?",
    time: "2 min ago",
    mentions: [],
  },
  {
    id: 2,
    user: "Marko",
    avatar: "/diverse-user-avatars.png",
    text: "@Ana what do you think about the Research Agent config?",
    time: "5 min ago",
    mentions: ["Ana"],
  },
]

// Mock version history
const versions = [
  { id: 1, user: "Ana", action: "Added Research Agent", time: "10 min ago" },
  { id: 2, user: "Marko", action: "Updated task parameters", time: "15 min ago" },
  { id: 3, user: "Petar", action: "Changed workflow name", time: "20 min ago" },
]

export default function CollaborationPage() {
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState("")
  const [activeCursors, setActiveCursors] = useState(users)

  // Simulate live cursor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCursors((prev) =>
        prev.map((user) => ({
          ...user,
          cursor: {
            x: Math.max(10, Math.min(90, user.cursor.x + (Math.random() - 0.5) * 10)),
            y: Math.max(10, Math.min(90, user.cursor.y + (Math.random() - 0.5) * 10)),
          },
        })),
      )
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const addComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "/diverse-user-avatars.png",
      text: newComment,
      time: "Just now",
      mentions: [],
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Collaboration"
          description="Google Docs-style real-time editing"
          action={
            <div className="flex items-center gap-2">
              {/* Active Users */}
              <div className="flex items-center -space-x-2">
                {users.map((user) => (
                  <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Share
              </Button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Canvas Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Preview with Cursors */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Agent Builder Canvas</CardTitle>
                    <div className="flex items-center gap-2">
                      {users.map((user) => (
                        <Badge key={user.id} variant="secondary" className="gap-1">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: user.color }} />
                          {user.name}
                          {user.status === "editing" && <Edit3 className="h-3 w-3" />}
                          {user.status === "viewing" && <Eye className="h-3 w-3" />}
                          {user.status === "comment" && <MessageSquare className="h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Canvas with Live Cursors */}
                  <div className="relative h-96 bg-muted/20 rounded-lg border border-white/10 overflow-hidden">
                    {/* Workflow visualization */}
                    <div className="absolute inset-0 flex items-center justify-center gap-8 p-8">
                      <div className="text-center space-y-2">
                        <div className="w-32 h-32 rounded-lg bg-accent/20 border-2 border-accent flex items-center justify-center">
                          <span className="text-sm font-semibold">Agent 1</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Research Agent</p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div className="text-center space-y-2">
                        <div className="w-32 h-32 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <span className="text-sm font-semibold">Task 1</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Analyze data</p>
                      </div>
                    </div>

                    {/* Live Cursors */}
                    <AnimatePresence>
                      {activeCursors.map((user) => (
                        <motion.div
                          key={user.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${user.cursor.x}%`,
                            top: `${user.cursor.y}%`,
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <div className="relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={user.color}>
                              <path d="M5.65376 12.3673L12.384 19.1076L15.3538 12.3673L22.0941 9.39747L15.3538 6.42768L12.384 -0.312988L9.41421 6.42768L2.67393 9.39747L9.41421 12.3673L5.65376 12.3673Z" />
                            </svg>
                            <div
                              className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                              style={{ backgroundColor: user.color, color: "#000" }}
                            >
                              {user.name}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Version History */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle>Version History</CardTitle>
                    <Badge variant="secondary">who changed what</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{version.action}</p>
                          <p className="text-xs text-muted-foreground">
                            by {version.user} • {version.time}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comments Sidebar */}
            <div className="space-y-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    <CardTitle>Comments & Mentions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold">{comment.user}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{comment.time}</span>
                        </div>
                        <p className="text-sm text-foreground/90">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* New Comment */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment... (use @mentions)"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-20 bg-muted/50 border-white/10"
                    />
                    <Button onClick={addComment} className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>

                  {/* Mention Suggestions */}
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2 font-medium flex items-center gap-1">
                      <AtSign className="h-3 w-3" />
                      Mention teammates:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {users.map((user) => (
                        <Badge
                          key={user.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setNewComment(newComment + ` @${user.name}`)}
                        >
                          @{user.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm">Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <select className="text-xs bg-muted/50 border border-white/10 rounded px-2 py-1">
                        <option>Admin</option>
                        <option>Edit</option>
                        <option>View</option>
                      </select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
