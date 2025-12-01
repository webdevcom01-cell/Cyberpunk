"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { Integration } from "@/lib/types"

interface IntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration: Integration | null
  onSave: (integration: Partial<Integration>) => void
}

export function IntegrationDialog({ open, onOpenChange, integration, onSave }: IntegrationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "api" as Integration["type"],
    config: {} as Record<string, unknown>,
    credentials: {} as Record<string, unknown>,
  })

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        type: integration.type,
        config: integration.config,
        credentials: integration.credentials || {},
      })
    } else {
      setFormData({
        name: "",
        type: "api",
        config: {},
        credentials: {},
      })
    }
  }, [integration, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleConfigChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        [key]: value,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{integration ? "Edit Integration" : "Add Integration"}</DialogTitle>
          <DialogDescription>Configure external service connection</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., OpenAI API"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as Integration["type"] })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "api" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="api_url">API URL</Label>
                <Input
                  id="api_url"
                  value={(formData.config.api_url as string) || ""}
                  onChange={(e) => handleConfigChange("api_url", e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={(formData.credentials?.api_key as string) || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credentials: {
                        ...formData.credentials,
                        api_key: e.target.value,
                      },
                    })
                  }
                  placeholder="sk-..."
                />
              </div>
            </>
          )}

          {formData.type === "database" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="connection_string">Connection String</Label>
                <Input
                  id="connection_string"
                  value={(formData.config.connection_string as string) || ""}
                  onChange={(e) => handleConfigChange("connection_string", e.target.value)}
                  placeholder="postgresql://..."
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database_name">Database Name</Label>
                <Input
                  id="database_name"
                  value={(formData.config.database_name as string) || ""}
                  onChange={(e) => handleConfigChange("database_name", e.target.value)}
                  placeholder="my_database"
                />
              </div>
            </>
          )}

          {formData.type === "webhook" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={(formData.config.webhook_url as string) || ""}
                  onChange={(e) => handleConfigChange("webhook_url", e.target.value)}
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Webhook Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={(formData.credentials?.secret as string) || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credentials: {
                        ...formData.credentials,
                        secret: e.target.value,
                      },
                    })
                  }
                  placeholder="whsec_..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{integration ? "Update" : "Create"} Integration</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
