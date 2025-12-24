// app/api/authors/route.ts
import { NextRequest } from 'next/server'
import prisma from '../../../lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.author.findMany({
      where: { 
        // Only authors with published posts
        posts: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' }
            }
          }
        },
        posts: {
          where: { status: 'PUBLISHED' },
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return Response.json({
      success: true,
      data: authors
    })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}