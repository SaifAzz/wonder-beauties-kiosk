"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MinusCircle, DollarSign, History } from "lucide-react"
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
                        title: "خطأ",
                        description: "فشل في تحميل المعاملات. يرجى المحاولة مرة أخرى.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error("خطأ في جلب المعاملات:", error)
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل المعاملات. يرجى المحاولة مرة أخرى.",
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
                    title: "قيمة غير صالحة",
                    description: "يرجى إدخال قيمة موجبة صالحة",
                    variant: "destructive",
                })
                return
            }

            if (!description.trim()) {
                toast({
                    title: "الوصف مفقود",
                    description: "يرجى إدخال وصف",
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
                    title: "نجاح",
                    description: "تمت إضافة المعاملة بنجاح",
                })

                // إضافة إلى القائمة وتحديث المجموع
                setTransactions([data.transaction, ...transactions])
                setTotal(type === "INCOME" ? total + amountValue : total - amountValue)

                // إعادة تعيين وإغلاق
                setAmount("")
                setDescription("")
                setType("INCOME")
                setIsAddDialogOpen(false)
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "فشل في إضافة المعاملة",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("خطأ في إضافة المعاملة:", error)
            toast({
                title: "خطأ",
                description: "فشل في إضافة المعاملة",
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
                <h1 className="text-3xl font-bold mb-8">إدارة النقد</h1>
                <p>جاري تحميل المعاملات...</p>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">إدارة النقد</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = "/admin/petty-cash/history"}>
                        <History className="mr-2 h-4 w-4" />
                        سجل المعاملات
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        إضافة معاملة
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>الرصيد الإجمالي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <span className={`text-2xl font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {total >= 0 ? '+' : '-'}{Math.abs(total).toFixed(2)}
                            </span>
                            {total >= 0 ? (
                                <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-1 mr-2">
                                    إيجابي
                                </span>
                            ) : (
                                <span className="bg-red-100 text-red-800 text-xs rounded-full px-2 py-1 mr-2">
                                    سلبي
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>سجل المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">لم يتم العثور على معاملات</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead className="text-right">المبلغ</TableHead>
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
                                                    <PlusCircle className="h-4 w-4 text-green-600 ml-2" />
                                                    <span className="text-green-600">دخل</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MinusCircle className="h-4 w-4 text-red-600 ml-2" />
                                                    <span className="text-red-600">مصروف</span>
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
                        <DialogTitle>إضافة معاملة جديدة</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">نوع المعاملة</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">دخل</SelectItem>
                                    <SelectItem value="EXPENSE">مصروف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">المبلغ</Label>
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
                            <Label htmlFor="description">الوصف</Label>
                            <Input
                                id="description"
                                placeholder="أدخل وصف المعاملة"
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
                            إلغاء
                        </Button>
                        <Button onClick={handleAddTransaction}>
                            إضافة معاملة
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}