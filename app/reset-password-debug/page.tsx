"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordDebugPage() {
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
    }

    useEffect(() => {
        const diagnose = async () => {
            addLog("🔍 Starting diagnostic...")

            // 1. Check URL parameters
            const url = window.location.href
            addLog(`📍 Full URL: ${url}`)

            const searchParams = new URLSearchParams(window.location.search)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))

            addLog(`🔗 Query params: ${searchParams.toString() || 'NONE'}`)
            addLog(`#️⃣ Hash params: ${hashParams.toString() || 'NONE'}`)

            const code = searchParams.get("code")
            const error = searchParams.get("error")
            const errorDescription = searchParams.get("error_description")
            const accessToken = hashParams.get("access_token")
            const refreshToken = hashParams.get("refresh_token")

            addLog(`🎫 Code: ${code || 'MISSING'}`)
            addLog(`❌ Error: ${error || 'NONE'}`)
            addLog(`📝 Error Description: ${errorDescription || 'NONE'}`)
            addLog(`🔑 Access Token (hash): ${accessToken ? 'PRESENT' : 'MISSING'}`)
            addLog(`🔄 Refresh Token (hash): ${refreshToken ? 'PRESENT' : 'MISSING'}`)

            // 2. Check current session
            const supabase = createClient()
            addLog("🔐 Checking current session...")

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                addLog(`❌ Session error: ${sessionError.message}`)
            } else {
                addLog(`✅ Session check complete`)
                addLog(`👤 User: ${sessionData.session?.user?.email || 'NO USER'}`)
                addLog(`⏰ Session expires: ${sessionData.session?.expires_at || 'N/A'}`)
            }

            // 3. Try code exchange if code exists
            if (code) {
                addLog("🔄 Attempting code exchange...")
                const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                if (exchangeError) {
                    addLog(`❌ Code exchange FAILED: ${exchangeError.message}`)
                    addLog(`📊 Error details: ${JSON.stringify(exchangeError)}`)
                } else {
                    addLog(`✅ Code exchange SUCCESS!`)
                    addLog(`👤 User email: ${exchangeData.user?.email}`)
                    addLog(`🎫 Session created: ${exchangeData.session ? 'YES' : 'NO'}`)
                }
            }

            // 4. Check Supabase config
            addLog("⚙️ Checking Supabase configuration...")
            addLog(`🌐 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}`)
            addLog(`🔑 Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'}`)

            addLog("✅ Diagnostic complete!")
        }

        diagnose()
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>🔍 Password Reset Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-[600px]">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
