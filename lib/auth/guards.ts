// app/lib/auth/guards.ts
import { verifySession } from './session'
import { NextRequest } from 'next/server'

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  if (!token) return null
  
  return await verifySession(token)
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}

export async function requireAuthor(request: NextRequest) {
  const user = await requireAuth(request)
  if (!['ADMIN', 'AUTHOR'].includes(user.role)) {
    throw new Error('Author access required')
  }
  return user
}