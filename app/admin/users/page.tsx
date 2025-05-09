"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, User, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

// Mock users data
const mockUsers = [
  { id: 1, phone: "+9897969714", name: "Customer", balance: 0, transactions: 0 },
  { id: 2, phone: "+963123456789", name: "Customer", balance: 10, transactions: 2 },
  { id: 3, phone: "+963124456789", name: "Customer", balance: 0, transactions: 0 },
  { id: 4, phone: "09111222", name: "Customer", balance: 0, transactions: 0 },
  { id: 5, phone: "09876543", name: "Customer", balance: 0, transactions: 0 },
  { id: 6, phone: "0987654333", name: "Customer", balance: 0, transactions: 0 },
]

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [country, setCountry] = useState("")

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
  }, [])

  const filteredUsers = users.filter(
    (user) => user.phone.includes(searchQuery) || user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSettleBalance = (userId: number) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, balance: 0 } : user)))
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
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        </div>
        <div className="text-sm bg-muted px-3 py-1 rounded-full">
          <span className="text-muted-foreground">Country:</span>
          <span className="font-medium capitalize ml-1">{country}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by phone number or name..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-cherry" />
                    </div>
                    <CardTitle className="text-base">{user.phone}</CardTitle>
                  </div>
                  {user.balance > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Has Balance</Badge>
                  )}
                </div>
                <CardDescription>{user.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Balance:</span>
                  <span className={`font-medium ${user.balance > 0 ? "text-cherry" : "text-green-600"}`}>
                    ${user.balance.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{user.transactions}</span>
                </div>

                {user.balance > 0 && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleSettleBalance(user.id)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Settle Balance
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
