"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { UserNavigation } from "@/components/user-navigation"

interface UserData {
    name: string;
    role: string;
}

export function SiteHeader() {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/user/me")
                const data = await response.json()

                if (data.success && data.user) {
                    setUser({
                        name: data.user.name,
                        role: data.user.role
                    })
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>
                </div>

                {!loading && user && (
                    <UserNavigation
                        userName={user.name}
                        userRole={user.role}
                    />
                )}
            </div>
        </header>
    )
} 