"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Users, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)

    // Skip auth check for the login page
    if (pathname === "/admin/login") return

    // Verify admin authentication using session
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me")
        const data = await response.json()

        if (!data.success || !data.user || data.user.role !== "ADMIN") {
          toast({
            title: "Authentication Required",
            description: "Please login as an admin to access this page",
            variant: "destructive",
          })
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, pathname, toast])

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      })
      // Still redirect even if there's an error
      router.push("/login")
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="p-4 space-y-2 border-b">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href ? "bg-cherry text-white" : "text-muted-foreground hover:bg-muted",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="flex h-screen lg:overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r">
          <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-6 border-b">
              <Logo />
            </div>

            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                    pathname === item.href ? "bg-cherry text-white" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:bg-muted"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
