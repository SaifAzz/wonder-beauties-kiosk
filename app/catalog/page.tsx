"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, DollarSign, SmilePlus } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  country: string
  image: string | null
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Fetch user info and products
  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        // Get current user info for country
        const userResponse = await fetch("/api/user/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.success) {
            setUserCountry(userData.user.country)
          }
        }

        // Get products
        const productsResponse = await fetch("/api/products")
        if (productsResponse.ok) {
          const data = await productsResponse.json()
          if (data.success) {
            setProducts(data.products)
            setFilteredProducts(data.products)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProducts()
  }, [toast])

  // Filter products by country and search term
  useEffect(() => {
    let filtered = products

    // Filter by user's country
    if (userCountry) {
      filtered = filtered.filter((product) => product.country === userCountry)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term))
      )
    }

    setFilteredProducts(filtered)
  }, [products, userCountry, searchTerm])

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      const data = await response.json()

      if (data.success) {
        // Show success with yummy choice smile
        toast({
          title: "Yummy Choice! 😋",
          description: "Product added to your cart",
          action: (
            <Button size="sm" onClick={() => router.push("/cart")}>
              View Cart
            </Button>
          ),
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Could not add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[180px] w-full mb-4" />
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/cart">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="search" className="sr-only">Search</Label>
        <Input
          id="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or check back later for new products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {product.country}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                {product.image && (
                  <div className="aspect-square mb-4 overflow-hidden rounded-md">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
                <p className="text-sm mt-2">
                  {product.quantity > 0 ? (
                    `${product.quantity} in stock`
                  ) : (
                    <span className="text-destructive">Out of stock</span>
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                  disabled={product.quantity <= 0}
                >
                  <SmilePlus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
