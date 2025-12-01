import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NaturalLanguageWorkflowBuilder } from "@/components/nl-workflow-builder"

export const metadata = {
  title: "Natural Language Workflow Builder | CrewAI Orchestrator",
  description: "Create AI workflows using natural language",
}

export default async function WorkflowBuilderPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Natural Language Workflow Builder</h1>
        <p className="text-muted-foreground">Describe your workflow in plain English and watch AI create it for you</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NaturalLanguageWorkflowBuilder userId={user.id} />
      </Suspense>
    </div>
  )
}
