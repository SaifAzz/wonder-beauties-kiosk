import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

// GET - Get current user information
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user information' },
      { status: 500 }
    )
  }
} 