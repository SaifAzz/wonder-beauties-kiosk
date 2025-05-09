"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ShoppingCart,
    User,
    LogOut,
    LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface UserNavigationProps {
    userName?: string;
    userRole?: string;
}

export function UserNavigation({ userName, userRole }: UserNavigationProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)

            // Call the logout API endpoint
            await fetch("/api/auth/logout", {
                method: "POST",
            })

            toast({
                title: "Logged out",
                description: "You have been successfully logged out",
            })

            // Redirect to login page
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)

            toast({
                title: "Error",
                description: "There was a problem logging out. Please try again.",
                variant: "destructive",
            })

            setIsLoggingOut(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/cart">
                <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                </Button>
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                {userName?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                    {userRole === "ADMIN" && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/admin">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Admin Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
} 