import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { catId } = await req.json(); // assuming you're sending catId in the request body

    if (!catId || isNaN(Number(catId))) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id: Number(catId) },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Step 1: Delete the category-post relationships in the PostCategory table
    await prisma.postCategory.deleteMany({
      where: { categoryId: Number(catId) },
    });

    // Step 2: Now delete the category
    await prisma.category.delete({
      where: { id: Number(catId) },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Failed to delete category', error: error}, { status: 500 });
  }
}
