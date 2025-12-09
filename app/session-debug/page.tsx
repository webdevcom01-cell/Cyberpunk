"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SessionDebugPage() {
    const [logs, setLogs] = useState<string[]>([])
    const [user, setUser] = useState<any>(null)

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
    }

    useEffect(() => {
        const checkSession = async () => {
            addLog("🔍 Checking session...")

            const supabase = createClient()

            // Check current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                addLog(`❌ Session error: ${sessionError.message}`)
            } else if (session) {
                addLog(`✅ Session found!`)
                addLog(`👤 User: ${session.user?.email}`)
                addLog(`⏰ Expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`)
                setUser(session.user)
            } else {
                addLog(`⚠️ No active session`)
            }

            // Check user
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

            if (userError) {
                addLog(`❌ User error: ${userError.message}`)
            } else if (currentUser) {
                addLog(`✅ User confirmed: ${currentUser.email}`)
            } else {
                addLog(`⚠️ No user found`)
            }

            // Check cookies
            addLog(`🍪 Cookies: ${document.cookie ? 'Present' : 'NONE'}`)

            addLog("✅ Check complete!")
        }

        checkSession()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        addLog("👋 Logged out!")
        setUser(null)
        window.location.reload()
    }

    const goToNLBuilder = () => {
        window.location.href = "/nl-builder"
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>🔍 Session Diagnostic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-[400px]">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {user ? (
                            <>
                                <Button onClick={goToNLBuilder} className="flex-1">
                                    Go to NL Builder
                                </Button>
                                <Button onClick={handleLogout} variant="outline" className="flex-1">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => window.location.href = "/magic-link"} className="w-full">
                                Login with Magic Link
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
