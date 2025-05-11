"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { ShoppingBag, User, Calendar, Package, Check, X } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface OrderItem {
    id: string
    orderId: string
    productId: string
    quantity: number
    price: number
    product: {
        id: string
        name: string
        country: string
    }
}

interface Order {
    id: string
    userId: string
    total: number
    status: string
    createdAt: string
    items: OrderItem[]
    user: {
        id: string
        name: string
        phone: string
        country: string
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/orders")

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setOrders(data.orders)
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load orders. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast({
                title: "Error",
                description: "Failed to load orders. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order)
        setIsViewDialogOpen(true)
    }

    // Calculate total revenue, count by country, etc.
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0)
    const totalOrders = orders.length
    const iraqOrders = orders.filter(order => order.user.country === "Iraq").length
    const syriaOrders = orders.filter(order => order.user.country === "Syria").length

    const pendingOrders = orders.filter(order => order.status === "PENDING")
    const completedOrders = orders.filter(order => order.status === "COMPLETED")

    if (loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Order Management</h1>
                <p>Loading orders...</p>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Order Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Iraq: {iraqOrders} | Syria: {syriaOrders}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedOrders.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">All Orders</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="iraq">Iraq</TabsTrigger>
                    <TabsTrigger value="syria">Syria</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <OrderTable orders={orders} onViewOrder={viewOrderDetails} />
                </TabsContent>

                <TabsContent value="pending">
                    <OrderTable
                        orders={pendingOrders}
                        onViewOrder={viewOrderDetails}
                    />
                </TabsContent>

                <TabsContent value="completed">
                    <OrderTable
                        orders={completedOrders}
                        onViewOrder={viewOrderDetails}
                    />
                </TabsContent>

                <TabsContent value="iraq">
                    <OrderTable
                        orders={orders.filter(order => order.user.country === "Iraq")}
                        onViewOrder={viewOrderDetails}
                    />
                </TabsContent>

                <TabsContent value="syria">
                    <OrderTable
                        orders={orders.filter(order => order.user.country === "Syria")}
                        onViewOrder={viewOrderDetails}
                    />
                </TabsContent>
            </Tabs>

            {/* Order Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Information</h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className="font-medium">ID:</span>
                                            <span className="ml-2 text-sm">{selectedOrder.id}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className="font-medium">Date:</span>
                                            <span className="ml-2 text-sm">
                                                {format(new Date(selectedOrder.createdAt), "MMM d, yyyy h:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium">Status:</span>
                                            <span className={`ml-2 text-sm px-2 py-1 rounded-full ${selectedOrder.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {selectedOrder.status === "COMPLETED" ? (
                                                    <div className="flex items-center">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Completed
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Package className="h-3 w-3 mr-1" />
                                                        Pending
                                                    </div>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Information</h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className="font-medium">Name:</span>
                                            <span className="ml-2 text-sm">{selectedOrder.user.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium">Phone:</span>
                                            <span className="ml-2 text-sm">{selectedOrder.user.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium">Country:</span>
                                            <span className="ml-2 text-sm">{selectedOrder.user.country}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOrder.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                                <TableCell>{item.product.country}</TableCell>
                                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    {(item.price * item.quantity).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-right font-bold">
                                                Total
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {selectedOrder.total.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface OrderTableProps {
    orders: Order[]
    onViewOrder: (order: Order) => void
}

function OrderTable({ orders, onViewOrder }: OrderTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No orders found</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {order.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>{order.user.name}</TableCell>
                                    <TableCell>{order.user.country}</TableCell>
                                    <TableCell>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewOrder(order)}
                                        >
                                            View
                                        </Button>
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