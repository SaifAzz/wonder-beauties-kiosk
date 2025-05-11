"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CartItem {
    id: string
    quantity: number
    product: {
        id: string
        name: string
        price: number
        quantity: number
        country: string
        image: string | null
    }
}

interface Cart {
    id: string
    userId: string
    items: CartItem[]
}

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [userBalance, setUserBalance] = useState(0)
    const [userOutstandingDebt, setUserOutstandingDebt] = useState(0)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchCart = async () => {
            try {
                // Fetch cart data
                const cartResponse = await fetch("/api/cart")

                if (cartResponse.ok) {
                    const cartData = await cartResponse.json()
                    if (cartData.success) {
                        setCart(cartData.cart)
                    }
                }

                // Fetch user balance
                const balanceResponse = await fetch("/api/balance")

                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json()
                    if (balanceData.success) {
                        setUserBalance(balanceData.balance)
                        setUserOutstandingDebt(balanceData.outstandingDebt || 0)
                    }
                }
            } catch (error) {
                console.error("Error fetching cart:", error)
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل سلة التسوق. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchCart()
    }, [toast])

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        try {
            setIsUpdating(true)

            if (newQuantity < 1) {
                await removeItem(itemId)
                return
            }

            const response = await fetch(`/api/cart/${itemId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity: newQuantity }),
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setCart(prev => {
                    if (!prev) return prev

                    return {
                        ...prev,
                        items: prev.items.map(item =>
                            item.id === itemId
                                ? { ...item, quantity: newQuantity }
                                : item
                        )
                    }
                })
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "تعذر تحديث كمية المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating quantity:", error)
            toast({
                title: "خطأ",
                description: "فشل في تحديث الكمية",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const removeItem = async (itemId: string) => {
        try {
            setIsUpdating(true)

            const response = await fetch(`/api/cart/${itemId}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setCart(prev => {
                    if (!prev) return prev

                    return {
                        ...prev,
                        items: prev.items.filter(item => item.id !== itemId)
                    }
                })

                toast({
                    title: "تمت إزالة المنتج",
                    description: "تمت إزالة المنتج من سلة التسوق الخاصة بك",
                })
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "تعذر إزالة المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error removing item:", error)
            toast({
                title: "خطأ",
                description: "فشل في إزالة المنتج",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const clearCart = async () => {
        try {
            setIsUpdating(true)

            const response = await fetch("/api/cart", {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setCart(prev => prev ? { ...prev, items: [] } : prev)

                toast({
                    title: "تم مسح السلة",
                    description: "تمت إزالة جميع المنتجات من سلة التسوق الخاصة بك",
                })
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "تعذر مسح السلة",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error clearing cart:", error)
            toast({
                title: "خطأ",
                description: "فشل في مسح السلة",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const checkout = async () => {
        try {
            setIsCheckingOut(true)

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()

            if (data.success) {
                if (data.hasPendingDebt) {
                    toast({
                        title: "تم تقديم الطلب مع دفعة معلقة",
                        description: data.message,
                    })
                } else {
                    toast({
                        title: "تم تقديم الطلب!",
                        description: "تم تقديم طلبك بنجاح",
                    })
                }

                // Clear cart and redirect
                setCart(prev => prev ? { ...prev, items: [] } : prev)
                router.push("/balance")
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "تعذر إكمال عملية الشراء",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error checking out:", error)
            toast({
                title: "خطأ",
                description: "فشل في إكمال عملية الشراء",
                variant: "destructive",
            })
        } finally {
            setIsCheckingOut(false)
        }
    }

    const calculateTotal = () => {
        if (!cart || !cart.items || cart.items.length === 0) {
            return 0
        }

        return cart.items.reduce((total, item) => {
            return total + (item.quantity * item.product.price)
        }, 0)
    }

    const renderUserAccount = () => {
        if (userOutstandingDebt > 0) {
            return (
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        رصيد مستحق
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                        لديك رصيد مستحق بقيمة ${userOutstandingDebt.toFixed(2)}. سيتم إضافة مشترياتك الجديدة إلى رصيدك الحالي.
                    </AlertDescription>
                </Alert>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="container py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/catalog">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">سلة التسوق</h1>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center py-8">جاري التحميل...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/catalog">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">سلة التسوق</h1>
                </div>
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="py-8 flex flex-col items-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h2 className="text-xl font-semibold mb-2">سلة التسوق فارغة</h2>
                            <p className="text-muted-foreground mb-6">
                                لم تقم بإضافة أي منتجات إلى سلة التسوق الخاصة بك بعد.
                            </p>
                            <Button asChild>
                                <Link href="/catalog">تصفح المنتجات</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const total = calculateTotal()

    return (
        <div className="container py-10">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/catalog">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">سلة التسوق</h1>
            </div>

            {renderUserAccount()}

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>منتجاتك</CardTitle>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isUpdating}>
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    مسح السلة
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>مسح سلة التسوق؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        هل أنت متأكد من أنك تريد إزالة جميع المنتجات من سلة التسوق الخاصة بك؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearCart}>مسح السلة</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>المنتج</TableHead>
                                <TableHead className="text-right">السعر</TableHead>
                                <TableHead>الكمية</TableHead>
                                <TableHead className="text-right">الإجمالي</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {item.product.image && (
                                                <div className="h-12 w-12 rounded overflow-hidden">
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div>{item.product.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.product.country === "Iraq" ? "العراق" : "سوريا"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={isUpdating}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={isUpdating || item.quantity >= item.product.quantity}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${(item.quantity * item.product.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => removeItem(item.id)}
                                            disabled={isUpdating}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between pt-6">
                    <div className="text-lg font-bold">الإجمالي: ${total.toFixed(2)}</div>
                </CardFooter>
            </Card>

            <div className="flex justify-between">
                <Button variant="outline" asChild>
                    <Link href="/catalog">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        مواصلة التسوق
                    </Link>
                </Button>
                <Button onClick={checkout} disabled={isCheckingOut}>
                    {isCheckingOut ? "جاري إتمام الطلب..." : "إتمام الطلب"}
                </Button>
            </div>
        </div>
    )
}