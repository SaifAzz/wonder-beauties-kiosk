import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - Get current user's cart
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
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      cart
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { productId, quantity = 1 } = body
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Validate product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (product.quantity < quantity) {
      return NextResponse.json(
        { success: false, message: 'Not enough stock available' },
        { status: 400 }
      )
    }
    
    // Ensure user has a cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id
        }
      })
    }
    
    // Check if product already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    })
    
    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + quantity
        },
        include: {
          product: true
        }
      })
      
      return NextResponse.json({
        success: true,
        cartItem: updatedCartItem,
        message: 'Product quantity updated in cart'
      })
    } else {
      // Add new cart item
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        },
        include: {
          product: true
        }
      })
      
      return NextResponse.json({
        success: true,
        cartItem: newCartItem,
        message: 'Product added to cart'
      })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add product to cart' },
      { status: 500 }
    )
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })
    
    if (!cart) {
      return NextResponse.json({
        success: true,
        message: 'Cart is already empty'
      })
    }
    
    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to clear cart' },
      { status: 500 }
    )
  }
} 