"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Plus, Minus, CreditCard, LogOut, User, X } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

// Mock product data
const mockProducts = [
  { id: 1, name: "Chips", image: "/placeholder.svg?height=200&width=200", price: 1.0, stock: 0, category: "snack" },
  { id: 2, name: "Cola", image: "/placeholder.svg?height=200&width=200", price: 1.25, stock: 38, category: "beverage" },
  { id: 3, name: "Sandwich", image: "/placeholder.svg?height=200&width=200", price: 3.0, stock: 20, category: "food" },
  { id: 4, name: "Snickers", image: "/placeholder.svg?height=200&width=200", price: 1.5, stock: 43, category: "snack" },
  { id: 5, name: "Water", image: "/placeholder.svg?height=200&width=200", price: 0.75, stock: 0, category: "beverage" },
  { id: 6, name: "Wonder", image: "/placeholder.svg?height=200&width=200", price: 22.0, stock: 21, category: "food" },
]

// Mock categories
const categories = [
  { id: "all", name: "All" },
  { id: "food", name: "Food" },
  { id: "beverage", name: "Beverages" },
  { id: "snack", name: "Snacks" },
]

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

export default function Catalog() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [country, setCountry] = useState("")
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addToCart = (product: (typeof mockProducts)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)

      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        return prevCart.filter((item) => item.id !== productId)
      }
    })
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleCheckout = () => {
    // In a real app, this would submit the order
    alert("Order placed successfully!")
    setCart([])
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2">
            <div className="text-sm bg-muted px-3 py-1 rounded-full hidden md:block">
              <span className="text-muted-foreground">Country:</span>
              <span className="font-medium capitalize ml-1">{country}</span>
            </div>

            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowCart(!showCart)}>
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cherry text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product catalog */}
          <div className="flex-1">
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={selectedCategory === category.id ? "bg-cherry hover:bg-cherry/90" : ""}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-square">
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                          <Badge className="text-lg py-2 px-4 bg-destructive">Out of Stock</Badge>
                        </div>
                      )}
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 flex flex-col p-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-2xl font-bold text-cherry mt-1">${product.price.toFixed(2)}</p>
                      </div>

                      <div className="mt-4">
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Button
                                className="w-full bg-cherry hover:bg-cherry/90"
                                onClick={() => addToCart(product)}
                              >
                                Add to Basket
                              </Button>
                            </div>

                            {cart.some((item) => item.id === product.id) && (
                              <div className="flex items-center border rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">
                                  {cart.find((item) => item.id === product.id)?.quantity || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => addToCart(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button className="w-full" disabled>
                            Out of Stock
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No products found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Shopping cart (mobile slide-in, desktop sidebar) */}
          <div
            className={`
            fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-20 transform transition-transform duration-300 ease-in-out
            ${showCart ? "translate-x-0" : "translate-x-full"}
            md:relative md:shadow-none md:transform-none md:w-80 md:border-l md:flex md:flex-col
          `}
          >
            <div className="p-4 border-b flex items-center justify-between md:justify-center">
              <h2 className="font-bold text-xl">Your Basket</h2>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowCart(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your basket is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addToCart(mockProducts.find((p) => p.id === item.id)!)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
              </div>

              <Button
                className="w-full bg-cherry hover:bg-cherry/90"
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Confirm Purchase
              </Button>

              <Link href="/balance">
                <Button variant="outline" className="w-full mt-2">
                  <User className="h-4 w-4 mr-2" />
                  View My Balance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
