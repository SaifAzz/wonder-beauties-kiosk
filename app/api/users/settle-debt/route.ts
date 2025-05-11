import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

// POST - تسوية ديون المستخدم (للمسؤول فقط)
export async function POST(request: NextRequest) {
  try {
    // التحقق من أن المستخدم مسؤول
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح به' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { userId, amount } = body
    
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم والمبلغ الموجب مطلوبان' },
        { status: 400 }
      )
    }
    
    // التحقق من وجود المستخدم المستهدف
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    // التحقق مما إذا كان المستخدم لديه ديون مستحقة
    if (targetUser.outstandingDebt <= 0) {
      return NextResponse.json(
        { success: false, message: 'المستخدم ليس لديه ديون مستحقة للتسوية' },
        { status: 400 }
      )
    }
    
    // حساب المبلغ المراد تسويته (لا يمكن تسوية أكثر من الدين المستحق)
    const amountToSettle = Math.min(targetUser.outstandingDebt, parseFloat(amount.toString()))
    const newOutstandingDebt = targetUser.outstandingDebt - amountToSettle
    
    // بدء معاملة
    await prisma.$transaction(async (prisma) => {
      // 1. تقليل الدين المستحق للمستخدم
      await prisma.user.update({
        where: { id: userId },
        data: { outstandingDebt: newOutstandingDebt }
      })
      
      // 2. تسجيل إدخال نقدي للدين المسدد
      await prisma.pettyCash.create({
        data: {
          amount: amountToSettle,
          description: `تسوية دين من ${targetUser.name}`,
          type: 'INCOME'
        }
      })
      
      // 3. تحديث أي طلبات في حالة PENDING_PAYMENT إلى COMPLETED إذا تمت تسوية الدين بالكامل
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
      message: `تمت تسوية ${amountToSettle.toFixed(2)} ريال من ديون ${targetUser.name} بنجاح. الدين المتبقي: ${newOutstandingDebt.toFixed(2)} ريال`
    })
  } catch (error) {
    console.error('خطأ في تسوية الدين:', error)
    return NextResponse.json(
      { success: false, message: 'فشل في تسوية الدين' },
      { status: 500 }
    )
  }
} 