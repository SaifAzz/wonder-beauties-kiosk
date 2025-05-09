"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Receipt, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    items: [
      { name: "Sandwich", quantity: 1 },
      { name: "Cola", quantity: 1 },
    ],
    date: "5/8/2025",
    total: 4.25,
    status: "unsettled",
  },
  {
    id: 2,
    items: [
      { name: "Cola", quantity: 1 },
      { name: "Sandwich", quantity: 1 },
      { name: "Snickers", quantity: 1 },
    ],
    date: "5/8/2025",
    total: 5.75,
    status: "unsettled",
  },
  {
    id: 3,
    items: [
      { name: "Cola", quantity: 1 },
      { name: "Chips", quantity: 1 },
    ],
    date: "5/8/2025",
    total: 2.25,
    status: "paid",
  },
  {
    id: 4,
    items: [
      { name: "Cola", quantity: 1 },
      { name: "Chips", quantity: 1 },
      { name: "Water", quantity: 1 },
      { name: "Snickers", quantity: 1 },
    ],
    date: "5/8/2025",
    total: 4.5,
    status: "paid",
  },
  {
    id: 5,
    items: [
      { name: "Chips", quantity: 1 },
      { name: "Cola", quantity: 1 },
    ],
    date: "5/8/2025",
    total: 2.25,
    status: "paid",
  },
]

export default function Balance() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [country, setCountry] = useState("")

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
  }, [])

  const unsettledTransactions = transactions.filter((t) => t.status === "unsettled")
  const paidTransactions = transactions.filter((t) => t.status === "paid")

  const totalBalance = unsettledTransactions.reduce((total, t) => total + t.total, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />

          <div className="text-sm bg-muted px-3 py-1 rounded-full">
            <span className="text-muted-foreground">Country:</span>
            <span className="font-medium capitalize ml-1">{country}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/catalog">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Total Balance Due</CardTitle>
              <CardDescription>Your current outstanding balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cherry">${totalBalance.toFixed(2)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="unsettled">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="unsettled" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unsettled
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unsettled" className="space-y-4">
            {unsettledTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">You have no unsettled transactions.</div>
            ) : (
              unsettledTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">{transaction.date}</div>
                        <div className="font-bold text-cherry">${transaction.total.toFixed(2)}</div>
                      </div>

                      <div className="space-y-1">
                        {transaction.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>{item.name}</div>
                            <div className="text-sm">x{item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {paidTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">You have no transaction history.</div>
            ) : (
              paidTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">{transaction.date}</div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">PAID</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Total</div>
                        <div className="font-bold">${transaction.total.toFixed(2)}</div>
                      </div>

                      <div className="space-y-1">
                        {transaction.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>{item.name}</div>
                            <div>x{item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
