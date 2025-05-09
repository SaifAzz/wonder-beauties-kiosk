"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, DollarSign, ShoppingBag, UsersIcon, TrendingUp, Package, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const [country, setCountry] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated and is an admin
        const response = await fetch("/api/user/me")
        const data = await response.json()

        if (!data.success || !data.user || data.user.role !== "ADMIN") {
          toast({
            title: "Access Denied",
            description: "You need to be logged in as an admin to view this page",
            variant: "destructive"
          })
          router.push("/login")
          return
        }

        // Set country from user data
        if (data.user.country) {
          setCountry(data.user.country)
        }

        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        toast({
          title: "Error",
          description: "Failed to verify your credentials",
          variant: "destructive"
        })
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading dashboard...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Wonder Beauties Kiosk Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
          <span className="text-muted-foreground">Country:</span>
          <span className="font-medium capitalize">{country}</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Financial Overview</CardTitle>
            <CardDescription>Current petty cash balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-destructive" />
              <span className="text-3xl font-bold text-destructive">-$113.02</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Products Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-teal" />
                  </div>
                  <div>
                    <div className="font-medium">View Products</div>
                    <div className="text-sm text-muted-foreground">Manage product stock and prices</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/products/add"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-teal" />
                  </div>
                  <div>
                    <div className="font-medium">Add New Product</div>
                    <div className="text-sm text-muted-foreground">Create a new product in the catalog</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-cherry" />
                  </div>
                  <div>
                    <div className="font-medium">View Users</div>
                    <div className="text-sm text-muted-foreground">Manage users and settle balances</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/reports"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-cherry" />
                  </div>
                  <div>
                    <div className="font-medium">Export Reports</div>
                    <div className="text-sm text-muted-foreground">Generate and download reports</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-2 lg:col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-navy" />
                  </div>
                  <div>
                    <div className="font-medium">Total Sales Today</div>
                  </div>
                </div>
                <div className="font-bold">$22.25</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                    <UsersIcon className="h-4 w-4 text-navy" />
                  </div>
                  <div>
                    <div className="font-medium">Active Users</div>
                  </div>
                </div>
                <div className="font-bold">6</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-navy" />
                  </div>
                  <div>
                    <div className="font-medium">Low Stock Items</div>
                  </div>
                </div>
                <div className="font-bold">3</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
