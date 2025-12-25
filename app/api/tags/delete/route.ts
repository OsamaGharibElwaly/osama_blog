import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';  // Ensure the correct Prisma client import

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the tagId
    const { tagId } = await req.json();

    // Validate the tagId
    if (!tagId || isNaN(Number(tagId))) {
      return NextResponse.json({ message: 'Invalid tag ID' }, { status: 400 });
    }

    // Check if the tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: Number(tagId) },
    });

    if (!tag) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: Number(tagId) },
    });

    // Respond with success
    return NextResponse.json({ message: 'Tag deleted successfully' });

  } catch (error) {
    console.error('Error deleting tag:', error);  // Log the error for debugging
    return NextResponse.json({ message: 'Failed to delete tag', error: error}, { status: 500 });
  }
}
