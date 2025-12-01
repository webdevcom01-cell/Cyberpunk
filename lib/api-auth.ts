import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 }),
    }
  }

  return { user, error: null }
}

export async function getUserWorkspaces(userId: string) {
  const supabase = await createClient()

  const { data: workspaces, error } = await supabase
    .from("workspace_members")
    .select(`
      workspace_id,
      role,
      workspace:workspaces(*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("[API Auth] Error fetching workspaces:", error)
    return []
  }

  return workspaces
}

export async function checkWorkspacePermission(
  userId: string,
  workspaceId: string,
  requiredRole: "viewer" | "member" | "admin" = "viewer",
) {
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single()

  if (error || !member) {
    return false
  }

  const roleHierarchy = { viewer: 0, member: 1, admin: 2 }
  return roleHierarchy[member.role] >= roleHierarchy[requiredRole]
}
