"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Users, LogOut, Menu, X, DollarSign } from "lucide-react"
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
            title: "مطلوب المصادقة",
            description: "يرجى تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة",
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
        title: "تم تسجيل الخروج",
        description: "لقد تم تسجيل خروجك بنجاح",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "خطأ",
        description: "فشل تسجيل الخروج بشكل صحيح",
        variant: "destructive",
      })
      // Still redirect even if there's an error
      router.push("/login")
    }
  }

  const navigation = [
    { name: "لوحة التحكم", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "إدارة النقد", href: "/admin/petty-cash", icon: DollarSign },
    { name: "التقارير", href: "/admin/reports", icon: FileText },
    { name: "المستخدمين", href: "/admin/users", icon: Users },
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
                  pathname === item.href
                    ? "bg-pink text-white"
                    : "text-gray-500 hover:bg-muted hover:text-gray-700",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  pathname === item.href ? "" : "text-gray-400"
                )} />
                {item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:bg-muted hover:text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-400" />
              تسجيل الخروج
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
                    pathname === item.href
                      ? "bg-pink text-white"
                      : "text-gray-500 hover:bg-muted hover:text-gray-700",
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    pathname === item.href ? "" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500 hover:bg-muted hover:text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-400" />
                تسجيل الخروج
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
