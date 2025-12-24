import prisma from "@/lib/db/client";

export async function getCategoryBySlug(
  slug: string,
  limit: number = 10,
  page: number = 1
) {
  if (!slug) {
    throw new Error("Slug is required");
  }

  const currentPage = Math.max(1, page);
  const take = Math.max(1, limit);
  const skip = (currentPage - 1) * take;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          posts: {
            where: {
              post: { status: "PUBLISHED" },
            },
          },
        },
      },
      posts: {
        where: {
          post: { status: "PUBLISHED" },
        },
        orderBy: { post: { createdAt: "desc" } },
        take,
        skip,
        select: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              shortDescription: true,
              thumbnailUrl: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImageUrl: true,
                },
              },
              tags: {
                select: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  // حساب الـ pagination هنا داخل الـ function
  const totalPosts = category._count.posts;
  const totalPages = Math.ceil(totalPosts / take);

  // تنسيق البوستات عشان تكون نظيفة
  const formattedPosts = category.posts.map((pc: any) => ({
    ...pc.post,
    tags: pc.post.tags.map((t: any) => t.tag),
  }));

  // الـ return النهائي بدون _count ولا posts الأصلية
  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
    },
    posts: formattedPosts,
    pagination: {
      total: totalPosts,
      totalPages,
      currentPage,
      limit: take,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}