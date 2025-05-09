import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// POST - Settle user debt (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
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
    
    // Check if the user has outstanding debt
    if (targetUser.outstandingDebt <= 0) {
      return NextResponse.json(
        { success: false, message: 'User has no outstanding debt to settle' },
        { status: 400 }
      )
    }
    
    // Calculate the amount to settle (can't settle more than the outstanding debt)
    const amountToSettle = Math.min(targetUser.outstandingDebt, parseFloat(amount.toString()))
    const newOutstandingDebt = targetUser.outstandingDebt - amountToSettle
    
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // 1. Reduce user's outstanding debt
      await prisma.user.update({
        where: { id: userId },
        data: { outstandingDebt: newOutstandingDebt }
      })
      
      // 2. Record a petty cash entry for the settled debt
      await prisma.pettyCash.create({
        data: {
          amount: amountToSettle,
          description: `Debt settlement from ${targetUser.name}`,
          type: 'INCOME'
        }
      })
      
      // 3. Update any PENDING_PAYMENT orders to COMPLETED if debt is fully settled
      if (newOutstandingDebt === 0) {
        await prisma.order.updateMany({
          where: { 
            userId: userId,
            status: 'PENDING_PAYMENT'
          },
          data: { status: 'COMPLETED' }
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      amountSettled: amountToSettle,
      remainingDebt: newOutstandingDebt,
      message: `Successfully settled $${amountToSettle.toFixed(2)} of ${targetUser.name}'s debt. Remaining debt: $${newOutstandingDebt.toFixed(2)}`
    })
  } catch (error) {
    console.error('Error settling debt:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to settle debt' },
      { status: 500 }
    )
  }
} 