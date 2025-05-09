import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// PATCH - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const cartItemId = params.id
    const body = await request.json()
    const { quantity } = body
    
    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Valid quantity is required' },
        { status: 400 }
      )
    }
    
    // First get the cart item to verify ownership and product
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true
      }
    })
    
    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      )
    }
    
    // Verify this cart belongs to the user
    if (cartItem.cart.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if we have enough stock
    if (cartItem.product.quantity < quantity) {
      return NextResponse.json(
        { success: false, message: 'Not enough stock available' },
        { status: 400 }
      )
    }
    
    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: true
      }
    })
    
    return NextResponse.json({
      success: true,
      cartItem: updatedCartItem
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const cartItemId = params.id
    
    // First get the cart item to verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true
      }
    })
    
    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      )
    }
    
    // Verify this cart belongs to the user
    if (cartItem.cart.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
} 