import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { writeFile } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

// GET - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    const product = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH - Update a product (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is admin
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const id = params.id
    
    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    let name, description, price, quantity, country, image;
    
    // Ensure the products directory exists
    const productsDir = path.join(process.cwd(), 'public/images/products');
    if (!existsSync(productsDir)) {
      mkdirSync(productsDir, { recursive: true });
    }
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      price = formData.get('price') as string;
      quantity = formData.get('quantity') as string;
      country = formData.get('country') as string;
      
      // Handle image file if present
      const imageFile = formData.get('image') as File | null;
      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(productsDir, fileName);
        
        // Convert file to Buffer and save it
        const fileArrayBuffer = await imageFile.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        await writeFile(filePath, fileBuffer);
        
        // Save the public URL path
        image = `/images/products/${fileName}`;
      }
    } else {
      // Parse JSON body
      const body = await request.json();
      ({ name, description, price, quantity, country, image } = body);
    }
    
    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Build update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (quantity !== undefined) updateData.quantity = parseInt(quantity)
    if (country !== undefined) {
      // Validate country
      if (country !== 'Iraq' && country !== 'Syria') {
        return NextResponse.json(
          { success: false, message: 'Country must be either Iraq or Syria' },
          { status: 400 }
        )
      }
      updateData.country = country
    }
    if (image !== undefined) updateData.image = image
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is admin
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const id = params.id
    
    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }
    
    await prisma.product.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 