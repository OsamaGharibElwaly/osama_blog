import  prisma  from "../client"; 



export async function getPublishedPosts(
  limit: number = 10,
  page: number = 1
) {
  const currentPage = Math.max(1, page);
  const take = Math.max(1, limit);
  const skip = (currentPage - 1) * take;

  const [posts, total] = await prisma.$transaction([
    // جلب البوستات المنشورة
    prisma.post.findMany({
      where: {
        status: "PUBLISHED", // بناءً على enum PostStatus
      },
      orderBy: {
        createdAt: "desc", // الأحدث أولاً
      },
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        // Author info
        author: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        // Categories
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        // Tags
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
    }),

    // عدد البوستات المنشورة الكلي
    prisma.post.count({
      where: {
        status: "PUBLISHED",
      },
    }),
  ]);

  const totalPages = Math.ceil(total / take);

  // تنسيق البيانات للـ frontend (اختياري، بس بيخليها أنظف)
  const formattedPosts = posts.map((post) => ({
    ...post,
    categories: post.categories.map((c) => c.category),
    tags: post.tags.map((t) => t.tag),
  }));

  return {
    posts: formattedPosts,
    pagination: {
      total,
      totalPages,
      currentPage,
      limit: take,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}