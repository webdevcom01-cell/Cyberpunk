"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function APIDocsPage() {
  const [apiDocs, setApiDocs] = useState<any>(null)

  useEffect(() => {
    fetch("/api-docs.json")
      .then((res) => res.json())
      .then(setApiDocs)
  }, [])

  if (!apiDocs) {
    return (
      <div className="container p-3 md:p-6">
        <div className="text-sm md:text-base">Loading API documentation...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-4 md:space-y-6 p-3 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{apiDocs.info.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">{apiDocs.info.description}</p>
        <Badge className="mt-2 text-xs">v{apiDocs.info.version}</Badge>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:w-auto">
            <TabsTrigger value="endpoints" className="text-xs md:text-sm whitespace-nowrap">
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="schemas" className="text-xs md:text-sm whitespace-nowrap">
              Schemas
            </TabsTrigger>
            <TabsTrigger value="examples" className="text-xs md:text-sm whitespace-nowrap">
              Examples
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="endpoints" className="space-y-4">
          {Object.entries(apiDocs.paths).map(([path, methods]: [string, any]) => (
            <Card key={path} className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4 font-mono text-xs md:text-sm break-all">{path}</h3>

              {Object.entries(methods).map(([method, details]: [string, any]) => (
                <div key={method} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={method === "get" ? "default" : "secondary"} className="uppercase text-xs">
                      {method}
                    </Badge>
                    <span className="text-xs md:text-sm text-muted-foreground">{details.summary}</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">{details.description}</p>

                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs md:text-sm font-semibold">Responses:</h4>
                    {Object.entries(details.responses || {}).map(([code, response]: [string, any]) => (
                      <div key={code} className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {code}
                        </Badge>
                        <span>{response.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schemas">
          <ScrollArea className="h-[400px] md:h-[600px]">
            <div className="space-y-4">
              {Object.entries(apiDocs.components.schemas).map(([name, schema]: [string, any]) => (
                <Card key={name} className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4">{name}</h3>
                  <pre className="bg-muted p-3 md:p-4 rounded-lg overflow-x-auto text-[10px] md:text-xs">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="examples">
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Example Requests</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs md:text-sm font-semibold mb-2">Create Agent</h4>
                <pre className="bg-muted p-3 md:p-4 rounded-lg overflow-x-auto text-[10px] md:text-xs">
                  {`POST /api/agents
Content-Type: application/json

{
  "name": "Research Agent",
  "role": "Senior Researcher",
  "goal": "Conduct comprehensive research",
  "backstory": "Expert researcher with 10+ years experience",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000,
  "tools": ["web_search", "data_analysis"],
  "status": "active"
}`}
                </pre>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-semibold mb-2">Create Task</h4>
                <pre className="bg-muted p-3 md:p-4 rounded-lg overflow-x-auto text-[10px] md:text-xs">
                  {`POST /api/tasks
Content-Type: application/json

{
  "name": "Market Analysis",
  "description": "Analyze current market trends and competitor landscape",
  "agent": "agent-id-here",
  "expectedOutput": "Comprehensive market analysis report",
  "priority": "high",
  "status": "pending"
}`}
                </pre>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4 md:p-6 bg-muted/50">
        <h3 className="text-base md:text-lg font-semibold mb-2">Rate Limiting</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-4">
          API requests are limited to 100 requests per 15 minutes per IP address.
        </p>
        <div className="space-y-2 text-xs md:text-sm font-mono">
          <div>X-RateLimit-Limit: Maximum requests allowed</div>
          <div>X-RateLimit-Remaining: Requests remaining</div>
          <div>X-RateLimit-Reset: Time when limit resets (Unix timestamp)</div>
        </div>
      </Card>
    </div>
  )
}
