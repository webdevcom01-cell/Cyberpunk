"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Webhook, Cloud, Settings, CheckCircle2, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { IntegrationDialog } from "@/components/integration-dialog"
import type { Integration } from "@/lib/types"
import { Switch } from "@/components/ui/switch"

const integrationTypes = [
  { id: "api", name: "API", icon: Cloud, color: "from-primary/20 to-accent/20" },
  { id: "database", name: "Database", icon: Database, color: "from-chart-4/20 to-primary/20" },
  { id: "webhook", name: "Webhook", icon: Webhook, color: "from-accent/20 to-chart-4/20" },
  { id: "storage", name: "Storage", icon: Settings, color: "from-primary/20 to-chart-4/20" },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations")
      const data = await res.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error("[v0] Failed to fetch integrations:", error)
    }
  }

  const handleAddIntegration = () => {
    setEditingIntegration(null)
    setDialogOpen(true)
  }

  const handleEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration)
    setDialogOpen(true)
  }

  const handleToggleIntegration = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })
      await fetchIntegrations()
    } catch (error) {
      console.error("[v0] Failed to toggle integration:", error)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    try {
      await fetch(`/api/integrations/${id}`, { method: "DELETE" })
      await fetchIntegrations()
    } catch (error) {
      console.error("[v0] Failed to delete integration:", error)
    }
  }

  const handleSaveIntegration = async (integration: Partial<Integration>) => {
    try {
      if (editingIntegration) {
        await fetch(`/api/integrations/${editingIntegration.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(integration),
        })
      } else {
        await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(integration),
        })
      }
      await fetchIntegrations()
      setDialogOpen(false)
    } catch (error) {
      console.error("[v0] Failed to save integration:", error)
    }
  }

  const getTypeInfo = (type: string) => {
    return integrationTypes.find((t) => t.id === type) || integrationTypes[0]
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Integrations"
          description="Manage external service connections"
          action={
            <Button
              onClick={handleAddIntegration}
              className="gap-1.5 md:gap-2 shadow-lg text-xs md:text-sm h-8 md:h-10 px-2 md:px-4 whitespace-nowrap"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Integration</span>
              <span className="sm:hidden">Add</span>
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="mb-4 md:mb-6 grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
            {integrationTypes.map((type) => {
              const count = integrations.filter((i) => i.type === type.id).length
              const enabled = integrations.filter((i) => i.type === type.id && i.enabled).length

              return (
                <Card
                  key={type.id}
                  className="glass-card border-white/10 transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                    <CardTitle className="text-xs md:text-sm font-medium text-foreground/90">{type.name}</CardTitle>
                    <div
                      className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-to-br ${type.color}`}
                    >
                      <type.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6 pt-0">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{count}</div>
                    <p className="text-xs text-muted-foreground mt-1">{enabled} enabled</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-3 md:gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const typeInfo = getTypeInfo(integration.type)
              const Icon = typeInfo.icon

              return (
                <Card
                  key={integration.id}
                  className="glass-card border-white/10 group transition-all hover:scale-[1.02] hover:shadow-2xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${typeInfo.color} shadow-lg`}
                        >
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-foreground">{integration.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">{integration.type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.enabled ? (
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Configuration</p>
                      <div className="space-y-1">
                        {Object.entries(integration.config)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                              <span className="text-foreground font-mono truncate ml-2 max-w-[150px]">
                                {String(value).substring(0, 20)}
                                {String(value).length > 20 ? "..." : ""}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {integration.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs md:text-sm"
                          onClick={() => handleEditIntegration(integration)}
                        >
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs md:text-sm text-destructive hover:text-destructive"
                          onClick={() => handleDeleteIntegration(integration.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/30 border border-white/5 p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${integration.enabled ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {integration.enabled ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {integrations.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cloud className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">No integrations yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Connect external services to enhance your workflows
                </p>
                <Button onClick={handleAddIntegration} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Integration</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <IntegrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        integration={editingIntegration}
        onSave={handleSaveIntegration}
      />
    </div>
  )
}
