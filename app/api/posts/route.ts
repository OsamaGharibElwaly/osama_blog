// app/api/posts/route.ts
import { NextRequest } from 'next/server'
import { getPublishedPosts } from '@/lib/db/queries/posts'
import prisma from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // استخدم الـ query function
    const posts = await getPublishedPosts(limit, page)
    
    // عدد البوستات الكلي
    const total = await prisma.post.count({ 
      where: { status: 'PUBLISHED' } 
    })

    return Response.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      }
    })
  } catch (error) {
    console.error('Posts API error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}