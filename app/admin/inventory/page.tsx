"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ArrowLeft, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Chips", image: "/placeholder.svg?height=50&width=50", cost: 100.0, price: 1.0, stock: 0 },
  { id: 2, name: "Cola", image: "/placeholder.svg?height=50&width=50", cost: 0.8, price: 1.25, stock: 38 },
  { id: 3, name: "Sandwich", image: "/placeholder.svg?height=50&width=50", cost: 2.0, price: 3.0, stock: 20 },
  { id: 4, name: "Snickers", image: "/placeholder.svg?height=50&width=50", cost: 1.0, price: 1.5, stock: 43 },
  { id: 5, name: "Water", image: "/placeholder.svg?height=50&width=50", cost: 0.5, price: 0.75, stock: 0 },
  { id: 6, name: "Wonder", image: "/placeholder.svg?height=50&width=50", cost: 22.0, price: 22.0, stock: 21 },
  { id: 7, name: "Wonderla", image: "/placeholder.svg?height=50&width=50", cost: 0.04, price: 123.0, stock: 0 },
]

export default function InventoryManagement() {
  const [inventory, setInventory] = useState(mockInventory)
  const [searchQuery, setSearchQuery] = useState("")
  const [country, setCountry] = useState("")

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
  }, [])

  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm bg-muted px-3 py-1 rounded-full">
            <span className="text-muted-foreground">Country:</span>
            <span className="font-medium capitalize ml-1">{country}</span>
          </div>
          <Link href="/admin/inventory/add">
            <Button className="bg-cherry hover:bg-cherry/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>Manage your product inventory, costs, and prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-right py-3 px-4 font-medium">Cost</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-center py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    className="border-b last:border-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">${item.cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      {item.stock === 0 ? (
                        <Badge variant="destructive" className="mx-auto">
                          Out of stock
                        </Badge>
                      ) : item.stock < 10 ? (
                        <Badge variant="outline" className="mx-auto bg-amber-50 text-amber-600 border-amber-200">
                          Low: {item.stock}
                        </Badge>
                      ) : (
                        <span className="text-green-600 font-medium">{item.stock}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="text-teal hover:text-teal hover:border-teal">
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Restock
                      </Button>
                    </td>
                  </motion.tr>
                ))}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
