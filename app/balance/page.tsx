"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Receipt, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Transaction interface
interface Transaction {
  id: string
  total: number
  status: string
  createdAt: string
  items: {
    productId: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

export default function Balance() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }

    // Fetch user transactions
    fetchUserTransactions()
  }, [])

  const fetchUserTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        // If 401 unauthorized, redirect to login
        if (response.status === 401) {
          toast({
            title: "مطلوب المصادقة",
            description: "يرجى تسجيل الدخول لعرض معاملاتك",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()

      if (data.success) {
        // Format the transactions from orders
        const formattedTransactions = data.orders.map((order: any) => ({
          id: order.id,
          total: order.total,
          status: order.status === "COMPLETED" ? "paid" : "unsettled",
          createdAt: new Date(order.createdAt).toLocaleDateString(),
          items: order.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: {
              name: item.product.name
            }
          }))
        }))

        setTransactions(formattedTransactions)
      } else {
        toast({
          title: "خطأ",
          description: data.message || "فشل في تحميل المعاملات",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل المعاملات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
            <span className="text-muted-foreground">البلد:</span>
            <span className="font-medium capitalize mr-1">
              {country === "Iraq" ? "العراق" : country === "Syria" ? "سوريا" : country}
            </span>
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
          <h1 className="text-2xl font-bold tracking-tight">سجل المعاملات</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <p>جاري تحميل المعاملات...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>إجمالي الرصيد المستحق</CardTitle>
                  <CardDescription>رصيدك المستحق الحالي</CardDescription>
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
                  غير مسددة
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  السجل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unsettled" className="space-y-4">
                {unsettledTransactions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">ليس لديك معاملات غير مسددة.</div>
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
                            <div className="text-sm text-muted-foreground">{transaction.createdAt}</div>
                            <div className="font-bold text-cherry">${transaction.total.toFixed(2)}</div>
                          </div>

                          <div className="space-y-1">
                            {transaction.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div>{item.product.name}</div>
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
                  <div className="text-center py-10 text-muted-foreground">ليس لديك سجل معاملات.</div>
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
                            <div className="text-sm text-muted-foreground">{transaction.createdAt}</div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">تم الدفع</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">الإجمالي</div>
                            <div className="font-bold">${transaction.total.toFixed(2)}</div>
                          </div>

                          <div className="space-y-1">
                            {transaction.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                                <div>{item.product.name}</div>
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
          </>
        )}
      </div>
    </div>
  )
}
