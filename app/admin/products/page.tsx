"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Package, Edit, Trash2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    quantity: number
    country: string
    image: string | null
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [quantity, setQuantity] = useState("")
    const [country, setCountry] = useState("")
    const [image, setImage] = useState<string | File>("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/products")

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setProducts(data.products)
                }
            } else {
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "خطأ",
                description: "فشل في تحميل المنتجات. يرجى المحاولة مرة أخرى.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setName("")
        setDescription("")
        setPrice("")
        setQuantity("")
        setCountry("")
        setImage("")
        setImagePreview(null)
        setEditingProduct(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Store the file for upload
            setImage(file)
        }
    }

    const handleAddProduct = async () => {
        try {
            if (!name || !price || !quantity || !country) {
                toast({
                    title: "حقول مفقودة",
                    description: "يرجى ملء جميع الحقول المطلوبة",
                    variant: "destructive",
                })
                return
            }

            // Create a FormData object for the file upload
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("quantity", quantity)
            formData.append("country", country)

            // Add the image file if it exists
            if (image instanceof File) {
                formData.append("image", image)
            }

            const response = await fetch("/api/products", {
                method: "POST",
                // Don't set Content-Type header - browser will set it with boundary for FormData
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "نجاح",
                    description: "تمت إضافة المنتج بنجاح",
                })

                // Add to the list and reset form
                setProducts([data.product, ...products])
                resetForm()
                setIsAddDialogOpen(false)
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "فشل في إضافة المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error adding product:", error)
            toast({
                title: "خطأ",
                description: "فشل في إضافة المنتج",
                variant: "destructive",
            })
        }
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setName(product.name)
        setDescription(product.description || "")
        setPrice(product.price.toString())
        setQuantity(product.quantity.toString())
        setCountry(product.country)
        setImage(product.image || "")
        setImagePreview(product.image)
        setIsEditDialogOpen(true)
    }

    const handleUpdateProduct = async () => {
        try {
            if (!editingProduct) return

            if (!name || !price || !quantity || !country) {
                toast({
                    title: "حقول مفقودة",
                    description: "يرجى ملء جميع الحقول المطلوبة",
                    variant: "destructive",
                })
                return
            }

            // Create a FormData object for the file upload
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("quantity", quantity)
            formData.append("country", country)

            // Add the image file if it exists
            if (image instanceof File) {
                formData.append("image", image)
            }

            const response = await fetch(`/api/products/${editingProduct.id}`, {
                method: "PATCH",
                // Don't set Content-Type header - browser will set it with boundary for FormData
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "نجاح",
                    description: "تم تحديث المنتج بنجاح",
                })

                // Update in the list
                setProducts(products.map(p =>
                    p.id === editingProduct.id ? data.product : p
                ))

                resetForm()
                setIsEditDialogOpen(false)
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "فشل في تحديث المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating product:", error)
            toast({
                title: "خطأ",
                description: "فشل في تحديث المنتج",
                variant: "destructive",
            })
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "نجاح",
                    description: "تم حذف المنتج بنجاح",
                })

                // Remove from the list
                setProducts(products.filter(p => p.id !== productId))
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "فشل في حذف المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: "خطأ",
                description: "فشل في حذف المنتج",
                variant: "destructive",
            })
        }
    }

    const restock = async (productId: string, amount: number) => {
        try {
            const response = await fetch(`/api/products/${productId}/restock`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "نجاح",
                    description: `تم إعادة تخزين المنتج بـ ${amount} وحدة`,
                })

                // Update in the list
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, quantity: p.quantity + amount } : p
                ))
            } else {
                toast({
                    title: "خطأ",
                    description: data.message || "فشل في إعادة تخزين المنتج",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error restocking product:", error)
            toast({
                title: "خطأ",
                description: "فشل في إعادة تخزين المنتج",
                variant: "destructive",
            })
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
                <Link href="/admin/products/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        إضافة منتج جديد
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
                    <TabsTrigger value="iraq">العراق</TabsTrigger>
                    <TabsTrigger value="syria">سوريا</TabsTrigger>
                    <TabsTrigger value="low-stock">مخزون منخفض</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>جاري التحميل...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col justify-center items-center h-64">
                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">لا توجد منتجات</p>
                                    <p className="text-muted-foreground">أضف منتجًا جديدًا للبدء</p>
                                </div>
                            ) : (
                                <ProductTable
                                    products={products}
                                    onEdit={openEditDialog}
                                    onDelete={handleDeleteProduct}
                                    onRestock={restock}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="iraq" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>جاري التحميل...</p>
                                </div>
                            ) : (
                                <ProductTable
                                    products={products.filter(p => p.country === "Iraq")}
                                    onEdit={openEditDialog}
                                    onDelete={handleDeleteProduct}
                                    onRestock={restock}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="syria" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>جاري التحميل...</p>
                                </div>
                            ) : (
                                <ProductTable
                                    products={products.filter(p => p.country === "Syria")}
                                    onEdit={openEditDialog}
                                    onDelete={handleDeleteProduct}
                                    onRestock={restock}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>جاري التحميل...</p>
                                </div>
                            ) : (
                                <ProductTable
                                    products={products.filter(p => p.quantity < 10)}
                                    onEdit={openEditDialog}
                                    onDelete={handleDeleteProduct}
                                    onRestock={restock}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تعديل المنتج</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">اسم المنتج</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">الوصف</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">السعر</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">الكمية</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-country">البلد</Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر البلد" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Iraq">العراق</SelectItem>
                                    <SelectItem value="Syria">سوريا</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">صورة المنتج</Label>
                            <div className="flex items-center gap-4">
                                <Label
                                    htmlFor="edit-image"
                                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">انقر للتحميل</p>
                                    </div>
                                    <Input
                                        id="edit-image"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Label>

                                {imagePreview && (
                                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                                        <img
                                            src={imagePreview}
                                            alt="معاينة"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleUpdateProduct}>
                            حفظ التغييرات
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Restock Dialog */}
            <Dialog>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>إعادة تخزين المنتج</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="restock-amount">كمية إعادة التخزين</Label>
                            <Input
                                id="restock-amount"
                                type="number"
                                min="1"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline">
                            إلغاء
                        </Button>
                        <Button>
                            إعادة تخزين
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface ProductTableProps {
    products: Product[]
    onEdit: (product: Product) => void
    onDelete: (productId: string) => void
    onRestock: (productId: string, amount: number) => void
}

function ProductTable({ products, onEdit, onDelete, onRestock }: ProductTableProps) {
    const [restockAmount, setRestockAmount] = useState<Record<string, number>>({})
    const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
    const [restockingProductId, setRestockingProductId] = useState<string | null>(null)

    const openRestockDialog = (productId: string) => {
        setRestockingProductId(productId)
        setIsRestockDialogOpen(true)
    }

    const handleRestock = () => {
        if (restockingProductId && restockAmount[restockingProductId]) {
            onRestock(restockingProductId, restockAmount[restockingProductId])
            setIsRestockDialogOpen(false)
            setRestockingProductId(null)
            // Reset the amount for this product
            setRestockAmount(prev => ({
                ...prev,
                [restockingProductId]: 0
            }))
        }
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>البلد</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المخزون</TableHead>
                        <TableHead>الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                                لا توجد منتجات لعرضها
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="flex items-center gap-3">
                                    {product.image ? (
                                        <div className="h-10 w-10 rounded-md overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                            <Package className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        {product.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {product.country === "Iraq" ? "العراق" : "سوريا"}
                                </TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={product.quantity < 10 ? "text-red-500 font-medium" : ""}>
                                            {product.quantity}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="number"
                                                min="1"
                                                className="w-16 h-8"
                                                value={restockAmount[product.id] || ""}
                                                onChange={(e) => setRestockAmount({
                                                    ...restockAmount,
                                                    [product.id]: parseInt(e.target.value) || 0
                                                })}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => {
                                                    if (restockAmount[product.id]) {
                                                        onRestock(product.id, restockAmount[product.id])
                                                    }
                                                }}
                                                disabled={!restockAmount[product.id]}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(product)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        هل أنت متأكد من أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(product.id)}>
                                                        حذف
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Restock Dialog */}
            <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>إعادة تخزين المنتج</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="restock-amount">كمية إعادة التخزين</Label>
                            <Input
                                id="restock-amount"
                                type="number"
                                min="1"
                                value={restockingProductId ? (restockAmount[restockingProductId] || "") : ""}
                                onChange={(e) => {
                                    if (restockingProductId) {
                                        setRestockAmount({
                                            ...restockAmount,
                                            [restockingProductId]: parseInt(e.target.value) || 0
                                        })
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleRestock}>
                            إعادة تخزين
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 