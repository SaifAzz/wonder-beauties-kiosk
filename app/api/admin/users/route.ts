import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - List all users (admin only)
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
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        balance: true,
        outstandingDebt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 