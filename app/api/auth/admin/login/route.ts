import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdmin } from '@/lib/auth'
import { setSession } from '@/lib/session'
import { z } from 'zod'

// Schema for validation
const loginSchema = z.object({
  phone: z.string().min(10).max(15),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Authenticate admin directly
    const { success, admin } = await authenticateAdmin(validatedData.phone)
    
    if (!success || !admin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin not found or authentication failed' 
      }, { status: 401 })
    }
    
    // Set session cookie
    await setSession(admin.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin login successful',
      role: admin.role,
      name: admin.name
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 })
    }
    
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login as admin' },
      { status: 500 }
    )
  }
} 