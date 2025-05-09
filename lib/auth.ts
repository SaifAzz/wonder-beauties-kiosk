import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// User registration
export async function registerUser(name: string, phone: string, password: string, country: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone }
  })
  
  if (existingUser) {
    return { success: false, message: 'User with this phone number already exists' }
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create new user
  const user = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashedPassword,
      country,
      role: 'USER',
      isVerified: true
    }
  })
  
  return { 
    success: true, 
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      country: user.country,
      role: user.role
    } 
  }
}

// Admin registration
export async function registerAdmin(name: string, phone: string, password: string, country: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone }
  })
  
  if (existingUser) {
    return { success: false, message: 'User with this phone number already exists' }
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create new admin user
  const user = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashedPassword,
      country,
      role: 'ADMIN',
      isVerified: true
    }
  })
  
  return { 
    success: true, 
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      country: user.country,
      role: user.role
    } 
  }
}

// User login
export async function authenticateUser(phone: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { phone }
  })
  
  if (!user) {
    return { success: false, message: 'User not found' }
  }
  
  // Verify password
  const passwordValid = await bcrypt.compare(password, user.password)
  
  if (!passwordValid) {
    return { success: false, message: 'Invalid password' }
  }
  
  return { 
    success: true, 
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      country: user.country,
      role: user.role,
      balance: user.balance
    } 
  }
}

// Get user by ID
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id }
  })
  
  if (!user) {
    return null
  }
  
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    country: user.country,
    role: user.role,
    balance: user.balance
  }
}

// Direct user authentication without verification code
export async function authenticateUserWithoutVerification(phone: string): Promise<boolean> {
  console.log(`Authenticating user with phone ${phone}`)
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { phone }
  })
  
  // If user doesn't exist, create one
  if (!user) {
    console.log('User not found, creating a new user')
    user = await prisma.user.create({
      data: {
        phone,
        name: 'New User',
        password: 'defaultPassword123',
        country: 'Iraq',
        isVerified: true
      }
    })
  } else {
    // Update user to verified if not already
    if (!user.isVerified) {
      await prisma.user.update({
        where: { phone },
        data: { isVerified: true }
      })
    }
  }
  
  console.log('User authenticated successfully')
  return true
}

// Direct admin authentication without verification code
export async function authenticateAdmin(phone: string): Promise<{success: boolean, admin: any}> {
  console.log(`Authenticating admin with phone ${phone}`)
  
  const admin = await prisma.user.findUnique({
    where: { phone, role: 'ADMIN' },
    select: { id: true, name: true, role: true }
  })
  
  if (!admin) {
    console.log('Admin not found')
    return { success: false, admin: null }
  }
  
  console.log('Admin authenticated successfully')
  return { success: true, admin }
} 