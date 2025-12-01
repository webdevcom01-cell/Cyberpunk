"use client"

import { Header } from "@/components/header"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Save, FileCode, FileJson, Copy, Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    projectName: "CrewAI Orchestrator",
    apiEndpoint: "https://api.example.com",
    defaultModel: "gpt-4",
    maxRetries: "3",
    timeout: "30",
    enableLogging: true,
    enableCache: true,
    autoSave: true,
    notificationsEnabled: true,
  })

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your configuration has been updated successfully.",
    })
  }

  const handleExportJSON = () => {
    const config = {
      version: "1.0.0",
      project: settings.projectName,
      settings: settings,
      agents: [
        {
          name: "Research Agent",
          role: "Senior Research Analyst",
          goal: "Conduct comprehensive research",
          model: "gpt-4",
        },
      ],
      tasks: [
        {
          name: "Research Market Trends",
          description: "Conduct comprehensive research",
          agent: "Research Agent",
        },
      ],
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orchestrator-config-${Date.now()}.json`
    a.click()

    toast({
      title: "Configuration exported",
      description: "Your workflow has been exported as JSON.",
    })
  }

  const handleExportPython = () => {
    const pythonCode = `from crewai import Agent, Task, Crew

# Define Agents
research_agent = Agent(
    role='Senior Research Analyst',
    goal='Conduct comprehensive research on given topics',
    backstory='An experienced researcher with a keen eye for detail',
    model='gpt-4',
    temperature=0.7,
    tools=['web_search', 'calculator']
)

writer_agent = Agent(
    role='Content Writer',
    goal='Create engaging and informative content',
    backstory='A creative writer who excels at storytelling',
    model='gpt-4',
    temperature=0.8,
    tools=['text_formatter', 'grammar_check']
)

# Define Tasks
research_task = Task(
    description='Conduct comprehensive research on market trends',
    expected_output='A detailed report with key findings',
    agent=research_agent
)

writing_task = Task(
    description='Create engaging content based on research',
    expected_output='Well-structured article ready for publication',
    agent=writer_agent,
    context=[research_task]
)

# Create Crew
crew = Crew(
    agents=[research_agent, writer_agent],
    tasks=[research_task, writing_task],
    verbose=True
)

# Execute
result = crew.kickoff()
print(result)
`

    const blob = new Blob([pythonCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orchestrator-crew-${Date.now()}.py`
    a.click()

    toast({
      title: "Code exported",
      description: "Your workflow has been exported as Python code.",
    })
  }

  const handleCopyCode = () => {
    const code = `from crewai import Agent, Task, Crew

# Your generated crew configuration
research_agent = Agent(
    role='Senior Research Analyst',
    goal='Conduct comprehensive research',
    model='gpt-4'
)
`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Code copied",
      description: "Code has been copied to clipboard.",
    })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string)
            toast({
              title: "Configuration imported",
              description: "Your workflow has been imported successfully.",
            })
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Invalid configuration file.",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Settings"
          description="Configure your orchestrator and export workflows"
          action={
            <Button
              onClick={handleSaveSettings}
              className="gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4 whitespace-nowrap"
            >
              <Save className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Save Changes</span>
              <span className="sm:hidden">Save</span>
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-auto min-w-full md:w-auto">
                <TabsTrigger value="general" className="text-xs md:text-sm whitespace-nowrap">
                  General
                </TabsTrigger>
                <TabsTrigger value="api" className="text-xs md:text-sm whitespace-nowrap">
                  API Config
                </TabsTrigger>
                <TabsTrigger value="export" className="text-xs md:text-sm whitespace-nowrap">
                  Export
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs md:text-sm whitespace-nowrap">
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4 md:space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Project Settings</CardTitle>
                  <CardDescription>Configure your project details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={settings.projectName}
                      onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultModel">Default AI Model</Label>
                    <Select
                      value={settings.defaultModel}
                      onValueChange={(value) => setSettings({ ...settings, defaultModel: value })}
                    >
                      <SelectTrigger id="defaultModel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Preferences</CardTitle>
                  <CardDescription>Customize your workflow behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableLogging">Enable Logging</Label>
                      <p className="text-sm text-muted-foreground">Record execution logs for debugging</p>
                    </div>
                    <Switch
                      id="enableLogging"
                      checked={settings.enableLogging}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableLogging: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableCache">Enable Caching</Label>
                      <p className="text-sm text-muted-foreground">Cache responses to improve performance</p>
                    </div>
                    <Switch
                      id="enableCache"
                      checked={settings.enableCache}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableCache: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSave">Auto-Save</Label>
                      <p className="text-sm text-muted-foreground">Automatically save changes</p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive workflow completion alerts</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notificationsEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Configuration */}
            <TabsContent value="api" className="space-y-4 md:space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">API Configuration</CardTitle>
                  <CardDescription>Configure API endpoints and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">API Endpoint</Label>
                    <Input
                      id="apiEndpoint"
                      value={settings.apiEndpoint}
                      onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxRetries">Max Retries</Label>
                      <Input
                        id="maxRetries"
                        type="number"
                        value={settings.maxRetries}
                        onChange={(e) => setSettings({ ...settings, maxRetries: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={settings.timeout}
                        onChange={(e) => setSettings({ ...settings, timeout: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="password" placeholder="Enter your API key" />
                    <p className="text-xs text-muted-foreground">Your API key is encrypted and stored securely</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export & Import */}
            <TabsContent value="export" className="space-y-4 md:space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Export Workflow</CardTitle>
                  <CardDescription>Export your configuration in different formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" onClick={handleExportJSON} className="h-24 flex-col gap-2 bg-transparent">
                      <FileJson className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-medium">Export as JSON</p>
                        <p className="text-xs text-muted-foreground">Configuration file</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportPython}
                      className="h-24 flex-col gap-2 bg-transparent"
                    >
                      <FileCode className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-medium">Export as Python</p>
                        <p className="text-xs text-muted-foreground">CrewAI code</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Import Configuration</CardTitle>
                  <CardDescription>Import an existing workflow configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleImport} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import JSON Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Code Preview</CardTitle>
                  <CardDescription>Preview your workflow as executable code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={`from crewai import Agent, Task, Crew

# Research Agent
research_agent = Agent(
    role='Senior Research Analyst',
    goal='Conduct comprehensive research',
    model='gpt-4',
    temperature=0.7
)

# Define Tasks
research_task = Task(
    description='Research market trends',
    agent=research_agent
)

# Create and run crew
crew = Crew(
    agents=[research_agent],
    tasks=[research_task]
)

result = crew.kickoff()`}
                      className="font-mono text-xs h-64"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyCode}
                      className="absolute right-2 top-2 gap-2 bg-transparent"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4 md:space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Advanced Options</CardTitle>
                  <CardDescription>Configure advanced orchestrator behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memory">Memory Configuration</Label>
                    <Textarea id="memory" placeholder="Configure agent memory settings" rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment Variables</Label>
                    <Textarea id="environment" placeholder="KEY=value (one per line)" rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom">Custom Configuration</Label>
                    <Textarea id="custom" placeholder="Add custom YAML or JSON configuration" rows={6} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions that affect your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div>
                      <p className="font-medium text-card-foreground">Reset Configuration</p>
                      <p className="text-sm text-muted-foreground">Reset all settings to default values</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Reset
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div>
                      <p className="font-medium text-card-foreground">Delete All Data</p>
                      <p className="text-sm text-muted-foreground">Permanently delete all agents, tasks, and logs</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
