"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AdminResetPage() {
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleDirectReset = async () => {
        setLoading(true)

        try {
            const supabase = createClient()

            // First, sign in as admin (you'll need to use your actual credentials)
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: "TempPassword123!" // Use your current password
            })

            if (signInError) {
                toast.error(`Login failed: ${signInError.message}`)
                setLoading(false)
                return
            }

            // Then update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                toast.error(`Password update failed: ${updateError.message}`)
            } else {
                toast.success("Password updated successfully! You can now login with your new password.")
            }

        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>🔧 Admin Password Reset</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Your Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="webdevcom01@gmail.com"
                        />
                    </div>

                    <div>
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <Button
                        onClick={handleDirectReset}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        <p>⚠️ This is a direct reset - no email required!</p>
                        <p>You need to know your CURRENT password to use this.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
