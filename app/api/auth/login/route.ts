import { authenticateUser } from '@/lib/auth'
import { setSession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body
    
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone and password are required' },
        { status: 400 }
      )
    }
    
    const result = await authenticateUser(phone, password)
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message || 'Authentication failed' },
        { status: 401 }
      )
    }
    
    // Set session cookie
    await setSession(result.user.id)
    
    return NextResponse.json({
      success: true,
      user: result.user
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
} 