"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MinusCircle, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"

interface PettyCashTransaction {
    id: string
    amount: number
    description: string
    type: string
    createdAt: string
}

export default function PettyCashPage() {
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("INCOME")
    const { toast } = useToast()

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch("/api/petty-cash")

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setTransactions(data.transactions)
                        setTotal(data.total)
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load transactions. Please try again.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error("Error fetching transactions:", error)
                toast({
                    title: "Error",
                    description: "Failed to load transactions. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [toast])

    const handleAddTransaction = async () => {
        try {
            const amountValue = parseFloat(amount)

            if (isNaN(amountValue) || amountValue <= 0) {
                toast({
                    title: "Invalid amount",
                    description: "Please enter a valid positive amount",
                    variant: "destructive",
                })
                return
            }

            if (!description.trim()) {
                toast({
                    title: "Missing description",
                    description: "Please enter a description",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch("/api/petty-cash", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: amountValue,
                    description,
                    type,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Transaction added successfully",
                })

                // Add to the list and update total
                setTransactions([data.transaction, ...transactions])
                setTotal(type === "INCOME" ? total + amountValue : total - amountValue)

                // Reset and close
                setAmount("")
                setDescription("")
                setType("INCOME")
                setIsAddDialogOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to add transaction",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error adding transaction:", error)
            toast({
                title: "Error",
                description: "Failed to add transaction",
                variant: "destructive",
            })
        }
    }

    const resetForm = () => {
        setAmount("")
        setDescription("")
        setType("INCOME")
    }

    if (loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Petty Cash Management</h1>
                <p>Loading transactions...</p>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Petty Cash Management</h1>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span className={`text-2xl font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {Math.abs(total).toFixed(2)}
                            </span>
                            {total >= 0 ? (
                                <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-1 ml-2">
                                    Positive
                                </span>
                            ) : (
                                <span className="bg-red-100 text-red-800 text-xs rounded-full px-2 py-1 ml-2">
                                    Negative
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">No transactions found</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            {transaction.type === "INCOME" ? (
                                                <div className="flex items-center">
                                                    <PlusCircle className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="text-green-600">Income</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MinusCircle className="h-4 w-4 text-red-600 mr-2" />
                                                    <span className="text-red-600">Expense</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            <span className={transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                                                {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toFixed(2)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Transaction Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-10"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Enter transaction description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            resetForm()
                            setIsAddDialogOpen(false)
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTransaction}>
                            Add Transaction
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 