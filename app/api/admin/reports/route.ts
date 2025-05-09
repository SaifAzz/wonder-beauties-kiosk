import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    // Verify user is admin
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'all'
    
    // Set date range based on timeframe
    let startDate: Date | null = null
    const endDate = new Date()
    
    if (timeframe === 'today') {
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
    } else if (timeframe === 'week') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeframe === 'month') {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
    }
    
    // Build query conditions
    const dateFilter = startDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : {}
    
    // Get order stats
    // @ts-ignore - Prisma typing issue
    const orders = await prisma.order.findMany({
      where: dateFilter
    })
    
    const totalSales = orders.reduce((sum: number, order: any) => sum + order.total, 0)
    const orderCount = orders.length
    
    // Get product stats
    // @ts-ignore - Prisma typing issue
    const productCount = await prisma.product.count()
    // @ts-ignore - Prisma typing issue
    const lowStockProducts = await prisma.product.count({
      where: {
        quantity: { lt: 10 }
      }
    })
    
    // Get user stats
    // @ts-ignore - Prisma typing issue
    const userCount = await prisma.user.count({
      where: {
        // @ts-ignore - Prisma typing issue with 'role' field
        role: 'USER'
      }
    })
    
    // Get country breakdown
    // @ts-ignore - Prisma typing issue
    const iraqProductCount = await prisma.product.count({
      where: { country: 'Iraq' }
    })
    
    // @ts-ignore - Prisma typing issue
    const syriaProductCount = await prisma.product.count({
      where: { country: 'Syria' }
    })
    
    // Construct mock data for the charts - in a real app, this would be pulled from the database
    // This ensures our structure matches what the frontend expects
    const salesByCountry = [
      { country: "Iraq", sales: 15000, orders: 120 },
      { country: "Syria", sales: 12000, orders: 95 }
    ]
    
    const salesByProduct = [
      { productId: "1", productName: "Product A", quantity: 50, revenue: 2500, country: "Iraq" },
      { productId: "2", productName: "Product B", quantity: 35, revenue: 1750, country: "Iraq" },
      { productId: "3", productName: "Product C", quantity: 45, revenue: 2250, country: "Syria" },
      { productId: "4", productName: "Product D", quantity: 30, revenue: 1500, country: "Syria" },
      { productId: "5", productName: "Product E", quantity: 25, revenue: 1250, country: "Iraq" }
    ]
    
    const inventoryStatus = [
      { productId: "1", productName: "Product A", country: "Iraq", inStock: 20, sold: 50 },
      { productId: "2", productName: "Product B", country: "Iraq", inStock: 15, sold: 35 },
      { productId: "3", productName: "Product C", country: "Syria", inStock: 25, sold: 45 },
      { productId: "4", productName: "Product D", country: "Syria", inStock: 5, sold: 30 },
      { productId: "5", productName: "Product E", country: "Iraq", inStock: 10, sold: 25 }
    ]
    
    const pettyCashSummary = {
      income: 27000,
      expense: 15000,
      balance: 12000
    }
    
    return NextResponse.json({
      success: true,
      data: {
        sales: {
          total: totalSales,
          count: orderCount
        },
        products: {
          total: productCount,
          lowStock: lowStockProducts,
          byCountry: {
            Iraq: iraqProductCount,
            Syria: syriaProductCount
          }
        },
        users: {
          total: userCount
        },
        salesByCountry,
        salesByProduct,
        inventoryStatus,
        pettyCashSummary
      }
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate reports' },
      { status: 500 }
    )
  }
} 