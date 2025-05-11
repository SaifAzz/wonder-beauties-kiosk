import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// GET - قائمة الطلبات
export async function GET(request: NextRequest) {
  try {
    // التحقق من أن المستخدم مسجل الدخول
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح به' },
        { status: 401 }
      )
    }
    
    // المسؤول يمكنه رؤية جميع الطلبات، المستخدمون العاديون يرون طلباتهم فقط
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
    console.error('خطأ في جلب الطلبات:', error)
    return NextResponse.json(
      { success: false, message: 'فشل في جلب الطلبات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء طلب جديد من سلة التسوق
export async function POST(request: NextRequest) {
  try {
    // التحقق من أن المستخدم مسجل الدخول
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح به' },
        { status: 401 }
      )
    }
    
    // الحصول على سلة المستخدم
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
        { success: false, message: 'سلة التسوق فارغة' },
        { status: 400 }
      )
    }
    
    // التحقق من المخزون لكل منتج وحساب المجموع
    let total = 0
    const itemsToCreate: { productId: any; quantity: any; price: any }[] = []
    const productsToUpdate: { id: any; newQuantity: number }[] = []
    
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: `لا يوجد مخزون كافٍ لـ ${item.product.name}. متوفر فقط ${item.product.quantity}.` 
          },
          { status: 400 }
        )
      }
      
      // حساب المجموع الفرعي
      const itemTotal = item.quantity * item.product.price
      total += itemTotal
      
      // تجهيز عنصر الطلب
      itemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      })
      
      // تجهيز تحديث المنتج (تقليل المخزون)
      productsToUpdate.push({
        id: item.productId,
        newQuantity: item.product.quantity - item.quantity
      })
    }
    
    // حساب المبلغ المخصوم من الرصيد
    const balanceDeduction = user.balance >= total ? total : user.balance
    const remainingDebt = total - balanceDeduction
    const newBalance = user.balance - balanceDeduction
    const hasPendingDebt = remainingDebt > 0
    
    // بدء المعاملة
    const order = await prisma.$transaction(async (prisma) => {
      // 1. إنشاء الطلب مع حالة انتظار الدفع إذا كان هناك دين
      const newOrder = await prisma.order.create({
        data: {
          userId: user.id,
          total,
          status: hasPendingDebt ? 'PENDING_PAYMENT' : 'COMPLETED',
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
      
      // 2. تقليل كميات المنتجات
      for (const product of productsToUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity: product.newQuantity }
        })
      }
      
      // 3. تحديث رصيد المستخدم والدين
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          balance: newBalance,
          outstandingDebt: (user.outstandingDebt || 0) + remainingDebt
        }
      })
      
      // 4. تسجيل إدخالات النقد
      // تسجيل الدفع الفعلي إذا تم استخدام أي رصيد
      if (balanceDeduction > 0) {
        await prisma.pettyCash.create({
          data: {
            amount: balanceDeduction,
            description: `دفعة جزئية للطلب ${newOrder.id} من قبل ${user.name}`,
            type: 'INCOME'
          }
        })
      }
      
      // تسجيل الدفع المعلق كمعاملة منفصلة إذا كان هناك دين
      if (remainingDebt > 0) {
        await prisma.pettyCash.create({
          data: {
            amount: remainingDebt,
            description: `دفعة معلقة للطلب ${newOrder.id} من قبل ${user.name}`,
            type: 'PENDING_INCOME',
            relatedOrderId: newOrder.id
          }
        })
      }
      
      // 5. تفريغ سلة التسوق
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: {
            deleteMany: {}
          }
        }
      })
      
      return newOrder
    })
    
    return NextResponse.json({
      success: true,
      order,
      hasPendingDebt,
      remainingDebt,
      message: hasPendingDebt 
        ? `تم تقديم الطلب بنجاح. لديك دفعة معلقة بقيمة $${remainingDebt.toFixed(2)}.`
        : 'تم تقديم الطلب بنجاح'
    })
  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error)
    return NextResponse.json(
      { success: false, message: 'فشل في إنشاء الطلب' },
      { status: 500 }
    )
  }
}