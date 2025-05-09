import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { writeFile } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

// GET - List all products with optional country filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const country = searchParams.get('country')
    
    const whereClause: any = {}
    if (country) {
      whereClause.country = country
    }
    
    // @ts-ignore - Prisma typing issue
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
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
    
    // Validate required fields
    if (!name || !price || !quantity || !country) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate price is a positive number
    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a positive number' },
        { status: 400 }
      )
    }
    
    // Validate quantity is a positive integer
    const quantityValue = parseInt(quantity)
    if (isNaN(quantityValue) || quantityValue < 0) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be a non-negative integer' },
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
    
    // Create the product
    // @ts-ignore - Prisma typing issue
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: priceValue,
        quantity: quantityValue,
        country,
        image: image || '/images/default-product.jpg' // Default image if none provided
      }
    })
    
    return NextResponse.json({
      success: true,
      product
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    )
  }
} 