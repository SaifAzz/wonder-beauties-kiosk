"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, DollarSign, ShoppingBag, UsersIcon, TrendingUp, Package, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  status: string
  // إضافة خصائص المستخدم الأخرى حسب الحاجة
}

interface PettyCashData {
  total: number
  transactions: any[]
}

export default function AdminDashboard() {
  const [country, setCountry] = useState("")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [financialData, setFinancialData] = useState<PettyCashData | null>(null)
  const [financialLoading, setFinancialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // التحقق مما إذا كان المستخدم مصادقًا وهو مسؤول
        const response = await fetch("/api/user/me")
        const data = await response.json()

        if (!data.success || !data.user || data.user.role !== "ADMIN") {
          toast({
            title: "تم رفض الوصول",
            description: "تحتاج إلى تسجيل الدخول كمسؤول لعرض هذه الصفحة",
            variant: "destructive"
          })
          router.push("/login")
          return
        }

        // تعيين البلد من بيانات المستخدم
        if (data.user.country) {
          setCountry(data.user.country)
        }

        setLoading(false)
      } catch (error) {
        console.error("خطأ في التحقق من المصادقة:", error)
        toast({
          title: "خطأ",
          description: "فشل في التحقق من بيانات اعتمادك",
          variant: "destructive"
        })
        router.push("/login")
      }
    }

    checkAuth()

    // جلب المستخدمين
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        const data = await response.json()
        if (data.success) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error("خطأ في جلب المستخدمين:", error)
      }
    }

    // جلب البيانات المالية
    const fetchFinancialData = async () => {
      try {
        setFinancialLoading(true)
        const response = await fetch("/api/petty-cash")

        if (!response.ok) {
          throw new Error("فشل في جلب البيانات المالية")
        }

        const data = await response.json()

        if (data.success) {
          setFinancialData({
            total: data.total,
            transactions: data.transactions
          })
        } else {
          throw new Error(data.message || "فشل في جلب البيانات المالية")
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات المالية:", error)
        toast({
          title: "خطأ",
          description: "فشل في تحميل البيانات المالية",
          variant: "destructive"
        })
      } finally {
        setFinancialLoading(false)
      }
    }

    fetchUsers()
    fetchFinancialData()
  }, [router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">جاري تحميل لوحة التحكم...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحبًا بك في لوحة تحكم كشك وندر بيوتيز</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
          <span className="text-muted-foreground">البلد:</span>
          <span className="font-medium capitalize">{country}</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">نظرة عامة مالية</CardTitle>
            <CardDescription>رصيد النقد الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">جاري التحميل...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className={`h-5 w-5 ${financialData && financialData.total >= 0 ? 'text-green-600' : 'text-destructive'}`} />
                <span className={`text-3xl font-bold ${financialData && financialData.total >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {financialData ? (financialData.total >= 0 ? '' : '-') + Math.abs(financialData.total).toFixed(2) : '0.00'}
                </span>
                {financialData && (
                  <span className={`text-xs px-2 py-1 rounded-full ${financialData.total >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {financialData.total >= 0 ? 'إيجابي' : 'سلبي'}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إدارة المنتجات</CardTitle>
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
                    <div className="font-medium">عرض المنتجات</div>
                    <div className="text-sm text-muted-foreground">إدارة مخزون المنتجات والأسعار</div>
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
                    <div className="font-medium">إضافة منتج جديد</div>
                    <div className="text-sm text-muted-foreground">إنشاء منتج</div>
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
              <CardTitle className="text-lg">إدارة المستخدمين</CardTitle>
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
                    <div className="font-medium">عرض المستخدمين</div>
                    <div className="text-sm text-muted-foreground">إدارة المستخدمين وتسوية الأرصدة</div>
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
                    <div className="font-medium">تصدير التقارير</div>
                    <div className="text-sm text-muted-foreground">إنشاء وتنزيل التقارير</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
