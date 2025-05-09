import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserById } from './auth'

const SESSION_COOKIE_NAME = 'wonder_beauties_session'

// Set session cookie
export async function setSession(userId: string) {
  await cookies().set({
    name: SESSION_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

// Clear session cookie
export async function clearSession() {
  await cookies().delete(SESSION_COOKIE_NAME)
}

// Get current user from session
export async function getCurrentUser() {
  const sessionCookie = await cookies().get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const user = await getUserById(sessionCookie.value)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Middleware to protect routes
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

// Middleware to protect admin routes
export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }
  
  return user
}

// Helper to redirect based on user role
export async function redirectBasedOnRole() {
  const user = await getCurrentUser()
  
  if (!user) {
    return
  }
  
  if (user.role === 'ADMIN') {
    redirect('/admin')
  } else {
    redirect('/catalog')
  }
} 