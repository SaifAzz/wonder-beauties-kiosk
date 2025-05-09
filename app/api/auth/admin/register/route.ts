import { registerAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, password, country } = body
    
    if (!name || !phone || !password || !country) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, password, and country are required' },
        { status: 400 }
      )
    }
    
    // Validate country
    if (country !== 'Iraq' && country !== 'Syria') {
      return NextResponse.json(
        { success: false, message: 'Country must be either Iraq or Syria' },
        { status: 400 }
      )
    }
    
    const result = await registerAdmin(name, phone, password, country)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: result.user
    })
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during admin registration' },
      { status: 500 }
    )
  }
} 