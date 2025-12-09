"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"

export default function MagicLinkLoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error(error.message)
            } else {
                setEmailSent(true)
                toast.success("Magic link sent! Check your email.")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="glass-card border-white/10 w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-accent/20 shadow-lg">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
                        <CardDescription className="text-base">
                            We've sent a magic link to:
                            <br />
                            <span className="text-primary font-medium">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                            <p className="mb-2">📧 Check your inbox and spam folder</p>
                            <p className="mb-2">🔗 Click the link to login instantly</p>
                            <p>⏰ The link expires in 1 hour</p>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setEmailSent(false)}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Try another email
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="glass-card border-white/10 w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-foreground">Magic Link Login</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a magic link to login instantly - no password needed!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="agent@crewai.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-muted/50 border-white/10"
                                autoFocus
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending magic link...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Magic Link
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Back to regular login
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
