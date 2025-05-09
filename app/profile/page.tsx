"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { clearSession } from "@/lib/session"

interface UserData {
    id: string
    name: string
    phone: string
    country: string
    role: string
    balance: number
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user/me')
                const data = await response.json()

                if (data.success && data.user) {
                    setUser(data.user)
                } else {
                    // If not authenticated, redirect to login
                    router.push('/login')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
                toast({
                    title: "Error",
                    description: "Failed to load profile information",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [router, toast])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            })

            if (response.ok) {
                toast({
                    title: "Logged out",
                    description: "You have been successfully logged out",
                })
                router.push('/login')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast({
                title: "Error",
                description: "Failed to log out",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <p>Loading profile...</p>
            </div>
        )
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">{user?.name}</CardTitle>
                    <CardDescription className="text-center">{user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p>{user?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Country</p>
                                <p>{user?.country}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Balance</p>
                            <p className="text-xl font-semibold">${user?.balance.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/balance')}
                    >
                        Manage Balance
                    </Button>
                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => router.push('/catalog')}
                    >
                        Go Shopping
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 