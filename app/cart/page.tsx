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
                toast({
                    title: "Order placed!",
                    description: "Your order has been placed successfully",
                })

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
                title: "Error",
                description: "Failed to complete checkout",
                variant: "destructive",
            })
        } finally {
            setIsCheckingOut(false)
        }
    }

    // Calculate cart total
    const cartTotal = cart?.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    ) || 0

    // Check if we have enough balance
    const hasEnoughBalance = userBalance >= cartTotal

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
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

                <Card className="text-center py-12">
                    <CardContent>
                        <div className="flex flex-col items-center justify-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-6">
                                Add some products to your cart to get started
                            </p>
                            <Button asChild>
                                <Link href="/catalog">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Browse Products
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/catalog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={cart.items.length === 0 || isUpdating}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Cart
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear cart?</AlertDialogTitle>
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
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cart Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={isUpdating}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span>{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={isUpdating || item.quantity >= item.product.quantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>${item.product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${(item.quantity * item.product.price).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
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
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-4">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Your Balance</span>
                                <span>${userBalance.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            {!hasEnoughBalance && (
                                <Alert variant="destructive" className="mb-2">
                                    <AlertTitle>Insufficient balance</AlertTitle>
                                    <AlertDescription>
                                        You need ${(cartTotal - userBalance).toFixed(2)} more to complete this purchase.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                className="w-full"
                                disabled={cart.items.length === 0 || isCheckingOut || !hasEnoughBalance}
                                onClick={checkout}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                {isCheckingOut ? "Processing..." : "Checkout"}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By completing this purchase, the amount will be deducted from your account balance.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}