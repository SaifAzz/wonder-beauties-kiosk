import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - List orders
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
    
    // Admin can see all orders, regular users only see their own
    const query: any = {}
    
    if (user.role !== 'ADMIN') {
      query.userId = user.id
    }
    
    const orders = await prisma.order.findMany({
      where: query,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            country: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Create a new order from cart
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
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      )
    }
    
    // Check stock for each product and calculate total
    let total = 0
    const itemsToCreate = []
    const productsToUpdate = []
    
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Not enough stock for ${item.product.name}. Only ${item.product.quantity} available.` 
          },
          { status: 400 }
        )
      }
      
      // Calculate subtotal
      const itemTotal = item.quantity * item.product.price
      total += itemTotal
      
      // Prepare order item
      itemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      })
      
      // Prepare product update (reduce stock)
      productsToUpdate.push({
        id: item.productId,
        newQuantity: item.product.quantity - item.quantity
      })
    }
    
    // Check if user has enough balance
    if (user.balance < total) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Insufficient balance. Order total is $${total.toFixed(2)} but your balance is $${user.balance.toFixed(2)}.` 
        },
        { status: 400 }
      )
    }
    
    // Start a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // 1. Create the order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          total,
          items: {
            create: itemsToCreate
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
      
      // 2. Reduce product quantities
      for (const product of productsToUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity: product.newQuantity }
        })
      }
      
      // 3. Deduct from user balance
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: user.balance - total }
      })
      
      // 4. Record a petty cash entry
      await prisma.pettyCash.create({
        data: {
          amount: total,
          description: `Order ${order.id} by ${user.name}`,
          type: 'INCOME'
        }
      })
      
      // 5. Clear the cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
      
      return order
    })
    
    return NextResponse.json({
      success: true,
      order,
      message: 'Order placed successfully'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    )
  }
}