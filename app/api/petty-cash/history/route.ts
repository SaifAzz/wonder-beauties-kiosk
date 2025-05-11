import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - Fetch petty cash transactions with filtering
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
    
    // Get query parameters
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')
    
    // Build filter object
    const filter: any = {}
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {}
      
      if (startDate) {
        filter.createdAt.gte = new Date(startDate)
      }
      
      if (endDate) {
        // Add one day to include the end date fully
        const endDateObj = new Date(endDate)
        endDateObj.setDate(endDateObj.getDate() + 1)
        filter.createdAt.lte = endDateObj
      }
    }
    
    // Type filter
    if (type && type !== 'ALL') {
      filter.type = type
    }
    
    // Search filter
    if (search) {
      filter.description = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    // Fetch transactions with filters
    const transactions = await prisma.pettyCash.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const summary = {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length
    }
    
    return NextResponse.json({
      success: true,
      transactions,
      summary
    })
  } catch (error) {
    console.error('Error fetching petty cash history:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch petty cash transactions' },
      { status: 500 }
    )
  }
} 