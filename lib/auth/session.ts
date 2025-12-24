// app/lib/auth/session.ts
import 'dotenv/config'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function createSession(user: { id: number; email: string; role: string }) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { id: number; email: string; role: string }
  } catch {
    return null
  }
}