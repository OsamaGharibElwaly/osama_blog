// app/api/tags/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getTagBySlug } from "@/lib/db/queries/tags";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }  // Next.js 16
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const data = await getTagBySlug(slug, limit, page);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tag: data.tag,
        posts: data.posts,
        pagination: data.pagination,
      },
    });
  } catch (error) {
    console.error("Tag detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}