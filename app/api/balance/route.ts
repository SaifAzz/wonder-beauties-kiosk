import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - Get current user balance
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get fresh balance from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true }
    })
    
    return NextResponse.json({
      success: true,
      balance: userData?.balance || 0
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

// POST - Add balance to user (admin only)
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
    const { userId, amount } = body
    
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'User ID and positive amount are required' },
        { status: 400 }
      )
    }
    
    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // 1. Add to user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: targetUser.balance + parseFloat(amount.toString()) }
      })
      
      // 2. Record a petty cash entry
      await prisma.pettyCash.create({
        data: {
          amount: parseFloat(amount.toString()),
          description: `Added balance for ${targetUser.name}`,
          type: 'EXPENSE'
        }
      })
    })
    
    return NextResponse.json({
      success: true,
      message: `Successfully added $${parseFloat(amount.toString()).toFixed(2)} to ${targetUser.name}'s balance`
    })
  } catch (error) {
    console.error('Error adding balance:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add balance' },
      { status: 500 }
    )
  }
} 