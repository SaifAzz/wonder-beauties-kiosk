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
                    title: "Error",
                    description: "Failed to load products. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "Error",
                description: "Failed to load products. Please try again.",
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
                    title: "Missing fields",
                    description: "Please fill out all required fields",
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
                    title: "Success",
                    description: "Product added successfully",
                })

                // Add to the list and reset form
                setProducts([data.product, ...products])
                resetForm()
                setIsAddDialogOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to add product",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error adding product:", error)
            toast({
                title: "Error",
                description: "Failed to add product",
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
                    title: "Missing fields",
                    description: "Please fill out all required fields",
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
                    title: "Success",
                    description: "Product updated successfully",
                })

                // Update in the list
                setProducts(products.map(p =>
                    p.id === editingProduct.id ? data.product : p
                ))

                resetForm()
                setIsEditDialogOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update product",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating product:", error)
            toast({
                title: "Error",
                description: "Failed to update product",
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
                    title: "Success",
                    description: "Product deleted successfully",
                })

                // Remove from the list
                setProducts(products.filter(p => p.id !== productId))
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete product",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive",
            })
        }
    }

    const restock = async (productId: string, amount: number) => {
        try {
            const product = products.find(p => p.id === productId)
            if (!product) return

            const newQuantity = product.quantity + amount

            const response = await fetch(`/api/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quantity: newQuantity
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: `Added ${amount} units to products`,
                })

                // Update in the list
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, quantity: newQuantity } : p
                ))
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to restock product",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error restocking product:", error)
            toast({
                title: "Error",
                description: "Failed to restock product",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-8">Product Management</h1>
                <p>Loading products...</p>
            </div>
        )
    }

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Products Management</h1>
                <Link href="/admin/products/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Product
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="iraq">Iraq</TabsTrigger>
                    <TabsTrigger value="syria">Syria</TabsTrigger>
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <ProductTable
                        products={products}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteProduct}
                        onRestock={restock}
                    />
                </TabsContent>

                <TabsContent value="iraq">
                    <ProductTable
                        products={products.filter(p => p.country === "Iraq")}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteProduct}
                        onRestock={restock}
                    />
                </TabsContent>

                <TabsContent value="syria">
                    <ProductTable
                        products={products.filter(p => p.country === "Syria")}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteProduct}
                        onRestock={restock}
                    />
                </TabsContent>

                <TabsContent value="low-stock">
                    <ProductTable
                        products={products.filter(p => p.quantity < 10)}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteProduct}
                        onRestock={restock}
                    />
                </TabsContent>
            </Tabs>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter product name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter product description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    type="number"
                                    min="0"
                                    step="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Iraq">Iraq</SelectItem>
                                    <SelectItem value="Syria">Syria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="image">Product Image</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label
                                        htmlFor="image"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                        </div>
                                        <Input
                                            id="image"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </Label>
                                </div>

                                {imagePreview && (
                                    <div className="relative h-32 w-32 overflow-hidden rounded-md border">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                                resetForm()
                                setIsAddDialogOpen(false)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddProduct}>
                                Add Product
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-price">Price</Label>
                            <Input
                                id="edit-price"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                type="number"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-quantity">Quantity</Label>
                            <Input
                                id="edit-quantity"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                type="number"
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            resetForm()
                            setIsEditDialogOpen(false)
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateProduct}>
                            Update Product
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
    return (
        <Card>
            <CardHeader>
                <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No products found</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.country}</TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`${product.quantity < 10 ? "text-red-500 font-medium" : ""}`}>
                                            {product.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onRestock(product.id, 10)}
                                            >
                                                <Package className="h-4 w-4 mr-1" />
                                                +10
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEdit(product)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete "{product.name}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(product.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
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