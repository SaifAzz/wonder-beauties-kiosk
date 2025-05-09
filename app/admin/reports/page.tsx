"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, BarChart3, Clock } from "lucide-react"
import { motion } from "framer-motion"

export default function Reports() {
  const [country, setCountry] = useState("")

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
  }, [])

  const handleExportUserBalances = () => {
    // In a real app, this would trigger a CSV download
    alert("Exporting user balances...")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        <div className="text-sm bg-muted px-3 py-1 rounded-full">
          <span className="text-muted-foreground">Country:</span>
          <span className="font-medium capitalize ml-1">{country}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-cherry" />
                </div>
                <CardTitle>User Balances</CardTitle>
              </div>
              <CardDescription>
                Export a CSV file containing user balances, unsettled transactions, and last purchase dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleExportUserBalances}>
                <Download className="h-4 w-4 mr-2" />
                Export User Balances
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-teal" />
                </div>
                <CardTitle>Inventory Status</CardTitle>
              </div>
              <CardDescription>
                A report summarizing current inventory levels, cost, and sale price (coming soon).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
