"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"
import { requireAdmin } from "@/lib/session"

export default function AddProductPage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        country: "",
        image: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create a preview URL for the image
            const previewUrl = URL.createObjectURL(file)
            setImagePreview(previewUrl)

            // Store the file for upload
            setImageFile(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.price || !formData.quantity || !formData.country) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)

            // Create a FormData object for the file upload
            const submitData = new FormData()
            submitData.append("name", formData.name)
            submitData.append("description", formData.description)
            submitData.append("price", formData.price)
            submitData.append("quantity", formData.quantity)
            submitData.append("country", formData.country)

            // Add the image file if it exists
            if (imageFile) {
                submitData.append("image", imageFile)
            }

            const response = await fetch("/api/products", {
                method: "POST",
                // Don't set Content-Type header - browser will set it with boundary for FormData
                body: submitData,
            })

            const data = await response.json()

            if (!data.success) {
                toast({
                    title: "Error",
                    description: data.message || "Failed to add product",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Success",
                description: "Product added successfully",
            })

            // Redirect to products list
            router.push("/admin/products")
        } catch (error) {
            console.error("Error adding product:", error)
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-4xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => handleSelectChange("country", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Iraq">Iraq</SelectItem>
                                        <SelectItem value="Syria">Syria</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (USD) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/products")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Product"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 