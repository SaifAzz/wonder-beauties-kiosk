import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - List all petty cash transactions
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
    
    const transactions = await prisma.pettyCash.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Calculate total
    const total = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        return acc + transaction.amount
      } else {
        return acc - transaction.amount
      }
    }, 0)
    
    return NextResponse.json({
      success: true,
      transactions,
      total
    })
  } catch (error) {
    console.error('Error fetching petty cash:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch petty cash transactions' },
      { status: 500 }
    )
  }
}

// POST - Create a new petty cash transaction (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { amount, description, type } = body
    
    if (!amount || !description || !type) {
      return NextResponse.json(
        { success: false, message: 'Amount, description, and type are required' },
        { status: 400 }
      )
    }
    
    // Validate type
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { success: false, message: 'Type must be either INCOME or EXPENSE' },
        { status: 400 }
      )
    }
    
    const transaction = await prisma.pettyCash.create({
      data: {
        amount: parseFloat(amount),
        description,
        type
      }
    })
    
    return NextResponse.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('Error creating petty cash transaction:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create petty cash transaction' },
      { status: 500 }
    )
  }
} 