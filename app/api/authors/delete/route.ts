import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { authorId } = await req.json();

    
    await prisma.author.delete({
      where: { id: authorId },
    });

    return NextResponse.json({ message: 'Author deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete author' }, { status: 500 });
  }
}
