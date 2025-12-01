import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const supabase = await createClient()

    let query = supabase.from("workflow_templates").select("*").order("uses", { ascending: false }).limit(50)

    if (category) {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error("[v0] Error fetching templates:", error)
      return NextResponse.json({ templates: [] }, { status: 200 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error("[v0] Error in templates API:", error)
    return NextResponse.json({ templates: [] }, { status: 200 })
  }
}
