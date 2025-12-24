// app/api/authors/[id]/route.ts
import { NextRequest } from 'next/server'
import { getAuthorById } from '@/lib/db/queries/authors'

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const authorId = parseInt(id)

    if (isNaN(authorId)) {
      return Response.json(
        { success: false, error: 'Invalid author ID' },
        { status: 400 }
      )
    }

    const author = await getAuthorById(authorId)

    if (!author) {
      return Response.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: author })
  } catch (error) {
    console.error('Author detail error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}