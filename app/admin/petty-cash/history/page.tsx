"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MinusCircle, DollarSign, Download, Filter, CalendarIcon, ArrowUpDown } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface PettyCashTransaction {
    id: string
    amount: number
    description: string
    type: string
    createdAt: string
}

interface TransactionSummary {
    totalIncome: number
    totalExpense: number
    netBalance: number
    transactionCount: number
}

export default function PettyCashHistoryPage() {
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<PettyCashTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<string>("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [summary, setSummary] = useState<TransactionSummary>({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        transactionCount: 0
    })

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    })

    const { toast } = useToast()

    useEffect(() => {
        fetchTransactions()
    }, [filterType, searchQuery, date])

    useEffect(() => {
        // تطبيق الترتيب على جانب العميل بعد جلب البيانات
        if (transactions.length > 0) {
            const sorted = [...transactions].sort((a, b) => {
                if (sortField === "date") {
                    return sortDirection === "asc"
                        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                } else if (sortField === "amount") {
                    return sortDirection === "asc"
                        ? a.amount - b.amount
                        : b.amount - a.amount
                }
                return 0
            })

            setFilteredTransactions(sorted)
        }
    }, [transactions, sortField, sortDirection])

    const fetchTransactions = async () => {
        try {
            setLoading(true)

            // بناء معلمات الاستعلام
            const params = new URLSearchParams()

            if (date?.from) {
                params.append('startDate', date.from.toISOString())
            }

            if (date?.to) {
                params.append('endDate', date.to.toISOString())
            }

            if (filterType !== "ALL") {
                params.append('type', filterType)
            }

            if (searchQuery) {
                params.append('search', searchQuery)
            }

            const response = await fetch(`/api/petty-cash/history?${params.toString()}`)

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setTransactions(data.transactions)
                    setSummary(data.summary)
                } else {
                    toast({
                        title: "خطأ",
                        description: data.message || "فشل في تحميل المعاملات",
                        variant: "destructive",
                    })
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

    const handleSortToggle = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const exportToCSV = () => {
        if (filteredTransactions.length === 0) return

        const headers = ["التاريخ", "الوصف", "النوع", "المبلغ"]

        const csvContent = [
            headers.join(","),
            ...filteredTransactions.map(t => [
                format(new Date(t.createdAt), "yyyy-MM-dd"),
                `"${t.description.replace(/"/g, '""')}"`,
                t.type,
                t.amount.toFixed(2)
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `petty-cash-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">سجل المعاملات</h1>
                <p>جاري تحميل المعاملات...</p>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">سجل المعاملات</h1>
                <Button onClick={() => window.location.href = "/admin/petty-cash"} variant="outline">
                    العودة إلى النقد
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <PlusCircle className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">
                                ${summary.totalIncome.toFixed(2)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <MinusCircle className="h-4 w-4 mr-2 text-red-600" />
                            <span className="text-2xl font-bold text-red-600">
                                ${summary.totalExpense.toFixed(2)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">صافي الرصيد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className={`text-2xl font-bold ${summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {Math.abs(summary.netBalance).toFixed(2)}
                            </span>
                            {summary.netBalance >= 0 ? (
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

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">المعاملات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold">
                                {summary.transactionCount}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>الفلاتر</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">نطاق التاريخ</label>
                            <div className={cn("grid gap-2")}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-right font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="ml-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (
                                                    <>
                                                        {format(date.from, "LLL dd, y")} -{" "}
                                                        {format(date.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(date.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>اختر تاريخًا</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">نوع المعاملة</label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="جميع الأنواع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">جميع الأنواع</SelectItem>
                                    <SelectItem value="INCOME">دخل</SelectItem>
                                    <SelectItem value="EXPENSE">مصروف</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">بحث</label>
                            <Input
                                placeholder="بحث حسب الوصف"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button className="w-full" onClick={exportToCSV} variant="outline">
                                <Download className="ml-2 h-4 w-4" />
                                تصدير إلى CSV
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المعاملات</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">لم يتم العثور على معاملات</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer" onClick={() => handleSortToggle("date")}>
                                        <div className="flex items-center">
                                            التاريخ
                                            {sortField === "date" && (
                                                <ArrowUpDown className={`mr-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead className="text-left cursor-pointer" onClick={() => handleSortToggle("amount")}>
                                        <div className="flex items-center justify-end">
                                            المبلغ
                                            {sortField === "amount" && (
                                                <ArrowUpDown className={`mr-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((transaction) => (
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
                                        <TableCell className="text-left font-medium">
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
        </div>
    )
} 