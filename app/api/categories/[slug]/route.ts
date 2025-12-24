// app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/db/queries/categories";

// الـ params دلوقتي Promise في Next.js 16
type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // لازم نعمل await للـ params عشان هو Promise
    const params = await context.params;
    const slug = params.slug;

    const data = await getCategoryBySlug(slug, limit, page);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        category: data.category,
        posts: data.posts,
        pagination: data.pagination,
      },
    });
  } catch (error) {
    console.error("Category detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}