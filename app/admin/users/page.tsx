"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Pencil, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  phone: string
  country: string
  balance: number
  outstandingDebt: number
  role: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amountToAdd, setAmountToAdd] = useState("")
  const [amountToSettle, setAmountToSettle] = useState("")
  const [isAddBalanceDialogOpen, setIsAddBalanceDialogOpen] = useState(false)
  const [isSettleDebtDialogOpen, setIsSettleDebtDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUsers(data.users)
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const handleAddBalance = async () => {
    if (!selectedUser) return

    try {
      const amount = parseFloat(amountToAdd)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive amount",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })

        // Update user in the list
        setUsers(users.map(user =>
          user.id === selectedUser.id
            ? { ...user, balance: user.balance + amount }
            : user
        ))

        // Reset and close
        setAmountToAdd("")
        setIsAddBalanceDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add balance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding balance:", error)
      toast({
        title: "Error",
        description: "Failed to add balance",
        variant: "destructive",
      })
    }
  }

  const handleSettleDebt = async () => {
    if (!selectedUser) return

    try {
      const amount = parseFloat(amountToSettle)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive amount",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/users/settle-debt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })

        // Update user in the list
        setUsers(users.map(user =>
          user.id === selectedUser.id
            ? { ...user, outstandingDebt: data.remainingDebt }
            : user
        ))

        // Reset and close
        setAmountToSettle("")
        setIsSettleDebtDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to settle debt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error settling debt:", error)
      toast({
        title: "Error",
        description: "Failed to settle debt",
        variant: "destructive",
      })
    }
  }

  const openAddBalanceDialog = (user: User) => {
    setSelectedUser(user)
    setAmountToAdd("")
    setIsAddBalanceDialogOpen(true)
  }

  const openSettleDebtDialog = (user: User) => {
    setSelectedUser(user)
    setAmountToSettle(user.outstandingDebt > 0 ? user.outstandingDebt.toString() : "")
    setIsSettleDebtDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="iraq">Iraq</TabsTrigger>
          <TabsTrigger value="syria">Syria</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserTable
            users={users}
            onAddBalance={openAddBalanceDialog}
            onSettleDebt={openSettleDebtDialog}
          />
        </TabsContent>

        <TabsContent value="iraq">
          <UserTable
            users={users.filter(user => user.country === "Iraq")}
            onAddBalance={openAddBalanceDialog}
            onSettleDebt={openSettleDebtDialog}
          />
        </TabsContent>

        <TabsContent value="syria">
          <UserTable
            users={users.filter(user => user.country === "Syria")}
            onAddBalance={openAddBalanceDialog}
            onSettleDebt={openSettleDebtDialog}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddBalanceDialogOpen} onOpenChange={setIsAddBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Balance for {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-balance">Current Balance</Label>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium">${selectedUser?.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="pl-10"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddBalanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBalance}>
              Add Balance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettleDebtDialogOpen} onOpenChange={setIsSettleDebtDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Debt for {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-debt">Outstanding Debt</Label>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium text-red-500">${selectedUser?.outstandingDebt.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount-to-settle">Amount to Settle</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount-to-settle"
                  placeholder="0.00"
                  value={amountToSettle}
                  onChange={(e) => setAmountToSettle(e.target.value)}
                  className="pl-10"
                  type="number"
                  min="0"
                  max={selectedUser?.outstandingDebt}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSettleDebtDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSettleDebt}>
              Settle Debt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UserTableProps {
  users: User[]
  onAddBalance: (user: User) => void
  onSettleDebt: (user: User) => void
}

function UserTable({ users, onAddBalance, onSettleDebt }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Outstanding Debt</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                      {user.country}
                    </div>
                  </TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    {user.outstandingDebt > 0 ? (
                      <span className="text-red-500 font-medium">${user.outstandingDebt.toFixed(2)}</span>
                    ) : (
                      <span className="text-green-500">$0.00</span>
                    )}
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddBalance(user)}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Add Balance
                      </Button>
                      {user.outstandingDebt > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSettleDebt(user)}
                          className="border-red-200 hover:bg-red-100 hover:text-red-600"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Settle Debt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
