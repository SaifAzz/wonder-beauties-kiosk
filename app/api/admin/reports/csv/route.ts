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
    const reportType = searchParams.get('type') || 'users'
    
    let csvData = ''
    let filename = ''
    
    if (reportType === 'users') {
      // @ts-ignore - Prisma typing issue
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          country: true,
          balance: true,
          role: true,
          createdAt: true,
          outstandingDebt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Create CSV header
      csvData = 'ID,Name,Phone,Country,Balance,Role,Created Date,Outstanding Debt\n'
      
      // Add user data rows
      users.forEach(user => {
        csvData += `${user.id},${user.name},${user.phone},${user.country},${user.balance.toFixed(2)},${user.role},${formatDate(user.createdAt) },${user.outstandingDebt.toFixed(2)}\n`
      })
      
      filename = 'user-balances.csv'
    } 
    else if (reportType === 'sales-by-country') {
      // @ts-ignore - Prisma typing issue
      const products = await prisma.product.findMany()
      
      // Group products by country
      const countryGroups: { [key: string]: { total: number, count: number } } = {}
      
      // @ts-ignore - Prisma typing issue
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      
      orders.forEach(order => {
        order.items.forEach(item => {
          const country = item.product.country
          if (!countryGroups[country]) {
            countryGroups[country] = { total: 0, count: 0 }
          }
          countryGroups[country].total += item.price * item.quantity
          countryGroups[country].count += item.quantity
        })
      })
      
      // Create CSV header
      csvData = 'Country,Total Sales,Orders Count,Average Order Value,Outstanding Debt\n'
      
      // Add country data rows
      Object.entries(countryGroups).forEach(([country, data]) => {
        const avgOrderValue = data.count > 0 ? (data.total / data.count).toFixed(2) : '0.00'
        csvData += `${country},${data.total.toFixed(2)},${data.count},${avgOrderValue}\n`
      })
      
      filename = 'sales-by-country.csv'
    } 
    else if (reportType === 'products') {
      // @ts-ignore - Prisma typing issue
      const products = await prisma.product.findMany({
        orderBy: {
          name: 'asc'
        }
      })
      
      // Create CSV header
      csvData = 'ID,Name,Description,Price,Quantity,Country,Created Date,Outstanding Debt\n'
      
      // Add product data rows
      products.forEach(product => {
        // Escape commas in description
        const description = product.description ? `"${product.description.replace(/"/g, '""')}"` : ''
        
        csvData += `${product.id},${product.name},${description},${product.price.toFixed(2)},${product.quantity},${product.country},${formatDate(product.createdAt)}\n`
      })
      
      filename = 'products-inventory.csv'
    }
    else if (reportType === 'low-stock') {
      // @ts-ignore - Prisma typing issue
      const lowStockProducts = await prisma.product.findMany({
        where: {
          quantity: { lt: 10 }
        },
        orderBy: {
          quantity: 'asc'
        }
      })
      

      // Create CSV header
      csvData = 'ID,Name,Current Stock,Country,Price,Created Date,Outstanding Debt\n'
      
      // Add product data rows
      lowStockProducts.forEach(product => {
        csvData += `${product.id},${product.name},${product.quantity},${product.country},${product.price.toFixed(2)},${formatDate(product.createdAt)},${product.outstandingDebt.toFixed(2)}\n`
      })
      
      filename = 'low-stock-products.csv'
    }
    
    // Return CSV as downloadable file
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${filename}`
      }
    })
  } catch (error) {
    console.error('Error generating CSV report:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSV report' },
      { status: 500 }
    )
  }
}

// Helper function to format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
} 