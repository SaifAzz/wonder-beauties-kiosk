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
                    title: "Error",
                    description: "Failed to load cart. Please try again.",
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
                    title: "Error",
                    description: data.message || "Could not update item quantity",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating quantity:", error)
            toast({
                title: "Error",
                description: "Failed to update quantity",
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
                    title: "Item removed",
                    description: "Item has been removed from your cart",
                })
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Could not remove item",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error removing item:", error)
            toast({
                title: "Error",
                description: "Failed to remove item",
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
                    title: "Cart cleared",
                    description: "All items have been removed from your cart",
                })
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Could not clear cart",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error clearing cart:", error)
            toast({
                title: "Error",
                description: "Failed to clear cart",
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
                        title: "Order placed with pending payment",
                        description: data.message,
                    })
                } else {
                    toast({
                        title: "Order placed!",
                        description: "Your order has been placed successfully",
                    })
                }

                // Clear cart and redirect
                setCart(prev => prev ? { ...prev, items: [] } : prev)
                router.push("/catalog")
            } else {
                toast({
                    title: "Checkout failed",
                    description: data.message || "Could not complete your order",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error during checkout:", error)
            toast({
                title: "Checkout failed",
                description: "An error occurred during checkout. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsCheckingOut(false)
        }
    }

    // Calculate total cost of items in cart
    const calculateTotal = () => {
        if (!cart || cart.items.length === 0) return 0

        return cart.items.reduce((total, item) => {
            return total + (item.quantity * item.product.price)
        }, 0)
    }

    // Calculate cart total
    const cartTotal = cart?.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    ) || 0

    // Check if we have enough balance
    const hasEnoughBalance = userBalance >= cartTotal

    // Update the UI to show balance/debt information
    const renderUserAccount = () => {
        const cartTotal = calculateTotal()
        const willCreateDebt = cartTotal > userBalance
        const newDebtAmount = willCreateDebt ? cartTotal - userBalance : 0
        const totalDebtAfterOrder = userOutstandingDebt + newDebtAmount

        return (
            <div className="mb-6 p-4 border rounded-md bg-background">
                <h3 className="text-lg font-semibold mb-2">Your Account</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="font-medium">${userBalance.toFixed(2)}</span>
                    </div>

                    {userOutstandingDebt > 0 && (
                        <div className="flex justify-between">
                            <span>Outstanding Debt:</span>
                            <span className="font-medium text-red-500">${userOutstandingDebt.toFixed(2)}</span>
                        </div>
                    )}

                    {willCreateDebt && (
                        <>
                            <div className="flex justify-between text-amber-600">
                                <span>New Debt from Order:</span>
                                <span className="font-medium">${newDebtAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-500 font-semibold border-t pt-2">
                                <span>Total Debt After Order:</span>
                                <span>${totalDebtAfterOrder.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <p>Loading cart...</p>
            </div>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Cart</h1>
                    <Button asChild variant="outline">
                        <Link href="/catalog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Catalog
                        </Link>
                    </Button>
                </div>

                <Alert className="mb-8">
                    <AlertTitle>Your cart is empty</AlertTitle>
                    <AlertDescription>
                        You haven't added any products to your cart yet. Visit the catalog to find delicious treats!
                    </AlertDescription>
                </Alert>

                <Button asChild>
                    <Link href="/catalog">Browse Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                <Button asChild variant="outline">
                    <Link href="/catalog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Catalog
                    </Link>
                </Button>
            </div>

            {renderUserAccount()}

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Subtotal</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart?.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell>${item.product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={isUpdating || item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="mx-3">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={isUpdating || item.quantity >= item.product.quantity}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
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
                <CardFooter className="flex justify-between">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={isUpdating}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Cart
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove all items from your cart. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearCart}>Clear Cart</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="text-xl font-bold">
                        Total: ${calculateTotal().toFixed(2)}
                    </div>
                </CardFooter>
            </Card>

            <div className="flex justify-between">
                <Button asChild variant="outline">
                    <Link href="/catalog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
                <Button
                    onClick={checkout}
                    disabled={isCheckingOut || !cart?.items.length}
                >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {calculateTotal() > userBalance ? "Checkout (On Credit)" : "Checkout"}
                </Button>
            </div>
        </div>
    )
}