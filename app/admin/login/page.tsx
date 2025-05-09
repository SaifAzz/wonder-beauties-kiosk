"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Phone } from "lucide-react"

export default function AdminLoginPage() {
    const [phone, setPhone] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phone) {
            toast({
                title: "Error",
                description: "Please enter your phone number",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)

            const response = await fetch("/api/auth/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone }),
            })

            const data = await response.json()

            if (!data.success) {
                toast({
                    title: "Login Failed",
                    description: data.error || "Authentication failed. Please try again.",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Login Successful",
                description: "Welcome back, admin!",
            })

            // Redirect to admin dashboard
            router.push("/admin/dashboard")
        } catch (error) {
            console.error("Admin login error:", error)
            toast({
                title: "Error",
                description: "An error occurred during login. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">Login to access the admin dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Admin Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="Enter admin phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}