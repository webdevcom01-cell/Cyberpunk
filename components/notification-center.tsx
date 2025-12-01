"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Workflow Complete",
    message: "Research workflow completed successfully with 3 tasks.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Agent Idle",
    message: "Writer Agent has been idle for 30 minutes.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    type: "error",
    title: "Task Failed",
    message: "Data extraction task failed due to API timeout.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
  },
  {
    id: "4",
    type: "info",
    title: "System Update",
    message: "New version 2.0.2 is available for download.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
]

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const typeColors = {
  info: "text-accent",
  success: "text-primary",
  warning: "text-yellow-500",
  error: "text-destructive",
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border border-primary/30 hover:border-primary/50 hover:bg-primary/10 h-11 w-11 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Bell className="h-3 w-3 md:h-4 md:w-4 text-primary" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-[10px] border border-destructive flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 p-0 glass-card"
        align="end"
        sideOffset={8}
        role="dialog"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between border-b border-primary/20 p-3 md:p-4">
          <h3 className="text-xs md:text-sm font-bold text-primary tracking-wider">NOTIFICATIONS</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 md:h-8 px-2 text-xs hover:bg-primary/10"
                aria-label="Mark all as read"
              >
                <CheckCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Read all</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 md:h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Clear all notifications"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px] md:h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-muted-foreground">
              <Bell className="h-8 w-8 md:h-12 md:w-12 mb-3 opacity-50" aria-hidden="true" />
              <p className="text-xs md:text-sm">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-primary/10" role="list" aria-label="Notification list">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                return (
                  <li
                    key={notification.id}
                    className={cn(
                      "flex gap-2 md:gap-3 p-3 md:p-4 transition-colors hover:bg-primary/5",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <div className={cn("flex-shrink-0 mt-0.5", typeColors[notification.type])}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs md:text-sm font-medium truncate",
                            !notification.read && "text-primary",
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-[10px] md:text-xs text-muted-foreground flex-shrink-0">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2 text-[10px] md:text-xs hover:bg-primary/10"
                            aria-label={`Mark "${notification.title}" as read`}
                          >
                            <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 px-2 text-[10px] md:text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Delete "${notification.title}" notification`}
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="border-t border-primary/20 p-2 md:p-3">
          <Button
            variant="ghost"
            className="w-full h-8 text-xs text-primary hover:bg-primary/10"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
