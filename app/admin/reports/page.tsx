"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, BarChart3, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { DollarSign, Package, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface ReportData {
  sales?: {
    total: number;
    count: number;
  };
  products?: {
    total: number;
    lowStock: number;
    byCountry: {
      Iraq: number;
      Syria: number;
    };
  };
  users?: {
    total: number;
  };
  salesByCountry?: {
    country: string;
    sales: number;
    orders: number;
  }[];
  salesByProduct?: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    country: string;
  }[];
  inventoryStatus?: {
    productId: string;
    productName: string;
    country: string;
    inStock: number;
    sold: number;
  }[];
  pettyCashSummary?: {
    income: number;
    expense: number;
    balance: number;
  };
}

export default function Reports() {
  const [country, setCountry] = useState("")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const selectedCountry = localStorage.getItem("country")
    if (selectedCountry) {
      setCountry(selectedCountry)
    }
    fetchReports()
  }, [timeframe])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?timeframe=${timeframe}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReportData(data.data)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportUserBalances = () => {
    window.open('/api/admin/reports/csv?type=users', '_blank')
  }

  const downloadReport = (reportType: string) => {
    window.open(`/api/admin/reports/csv?type=${reportType}`, '_blank')

    toast({
      title: "Report Downloaded",
      description: `${reportType} report has been generated.`,
    })
  }

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Reports</h1>
        <p>Loading reports...</p>
      </div>
    )
  }

  // Modify mock data to have the same structure as expected from API
  const mockData = {
    sales: {
      total: 27000,
      count: 215
    },
    products: {
      total: 50,
      lowStock: 5,
      byCountry: {
        Iraq: 30,
        Syria: 20
      }
    },
    users: {
      total: 120
    },
    // Add these properties for the charts
    salesByCountry: [
      { country: "Iraq", sales: 15000, orders: 120 },
      { country: "Syria", sales: 12000, orders: 95 }
    ],
    salesByProduct: [
      { productId: "1", productName: "Product A", quantity: 50, revenue: 2500, country: "Iraq" },
      { productId: "2", productName: "Product B", quantity: 35, revenue: 1750, country: "Iraq" },
      { productId: "3", productName: "Product C", quantity: 45, revenue: 2250, country: "Syria" },
      { productId: "4", productName: "Product D", quantity: 30, revenue: 1500, country: "Syria" },
      { productId: "5", productName: "Product E", quantity: 25, revenue: 1250, country: "Iraq" }
    ],
    inventoryStatus: [
      { productId: "1", productName: "Product A", country: "Iraq", inStock: 20, sold: 50 },
      { productId: "2", productName: "Product B", country: "Iraq", inStock: 15, sold: 35 },
      { productId: "3", productName: "Product C", country: "Syria", inStock: 25, sold: 45 },
      { productId: "4", productName: "Product D", country: "Syria", inStock: 5, sold: 30 },
      { productId: "5", productName: "Product E", country: "Iraq", inStock: 10, sold: 25 }
    ],
    pettyCashSummary: {
      income: 27000,
      expense: 15000,
      balance: 12000
    }
  }

  // Use either real data or mock data with safety checks
  const data = reportData || mockData

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>
        <div className="text-sm bg-muted px-3 py-1 rounded-full">
          <span className="text-muted-foreground">Country:</span>
          <span className="font-medium capitalize ml-1">{country}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cherry/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-cherry" />
                </div>
                <CardTitle>User Balances</CardTitle>
              </div>
              <CardDescription>
                Export a CSV file containing user balances, unsettled transactions, and last purchase dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleExportUserBalances}>
                <Download className="h-4 w-4 mr-2" />
                Export User Balances
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-teal" />
                </div>
                <CardTitle>Products Status</CardTitle>
              </div>
              <CardDescription>
                A report summarizing current products levels, cost, and sale price (coming soon).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards with null safety */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                ${data.sales?.total.toFixed(2) || (data.salesByCountry?.reduce((sum, country) => sum + country.sales, 0) || 0).toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Petty Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">${(data.pettyCashSummary?.balance || 0).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {data.sales?.count || (data.salesByCountry?.reduce((sum, country) => sum + country.orders, 0) || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="products">Products Reports</TabsTrigger>
          <TabsTrigger value="petty-cash">Petty Cash</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Sales by Country</CardTitle>
                    <CardDescription>Revenue breakdown by country</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("sales-by-country")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.salesByCountry || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="country"
                      >
                        {(data.salesByCountry || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Based on revenue</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("top-products")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(data.salesByProduct || []).sort((a, b) => b.revenue - a.revenue).slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="productName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Detailed Sales Report</CardTitle>
                    <CardDescription>All products sorted by revenue</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("detailed-sales")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Quantity Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.salesByProduct || [])
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>{product.country}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Current Products Status</CardTitle>
                    <CardDescription>Stock levels for all products</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("products-status")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.inventoryStatus || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="productName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inStock" name="In Stock" fill="#82ca9d" />
                      <Bar dataKey="sold" name="Sold" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Inventory by Country</CardTitle>
                    <CardDescription>Current stock levels by country</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("products-by-country")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Total Products</TableHead>
                      <TableHead className="text-right">Total Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {["Iraq", "Syria"].map((country) => {
                      const countryProducts = (data.inventoryStatus || []).filter(p => p.country === country)
                      const totalProducts = countryProducts.length
                      const totalUnits = countryProducts.reduce((sum, p) => sum + p.inStock, 0)

                      return (
                        <TableRow key={country}>
                          <TableCell className="font-medium">{country}</TableCell>
                          <TableCell>{totalProducts}</TableCell>
                          <TableCell className="text-right">{totalUnits}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Low Stock Products</CardTitle>
                    <CardDescription>Products with stock levels under 10 units</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("low-stock")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.inventoryStatus || [])
                      .filter(product => product.inStock < 10)
                      .sort((a, b) => a.inStock - b.inStock)
                      .map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>{product.country}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${product.inStock < 5 ? "text-red-500" : "text-orange-500"}`}>
                              {product.inStock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{product.sold}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="petty-cash">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Petty Cash Summary</CardTitle>
                    <CardDescription>Income vs Expenses</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("petty-cash-summary")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Income", value: data.pettyCashSummary?.income || 0 },
                          { name: "Expenses", value: data.pettyCashSummary?.expense || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff7675" />
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Income</h3>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-1 text-green-500" />
                        <span className="text-xl font-bold text-green-600">${(data.pettyCashSummary?.income || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</h3>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-1 text-red-500" />
                        <span className="text-xl font-bold text-red-600">${(data.pettyCashSummary?.expense || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Balance</h3>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-1 text-blue-500" />
                      <span className="text-2xl font-bold">${(data.pettyCashSummary?.balance || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
