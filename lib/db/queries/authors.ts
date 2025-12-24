import prisma from "@/lib/db/client";

export async function getAuthorById(
  id: number,
  limit: number = 10,
  page: number = 1
) {
  if (!id || isNaN(id)) {
    return null;
  }

  const currentPage = Math.max(1, page);
  const take = Math.max(1, limit);
  const skip = (currentPage - 1) * take;

  const author = await prisma.author.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      profileImageUrl: true,
      createdAt: true,
      // Social links
      socialLinks: {
        select: {
          platformName: true,
          profileUrl: true,
        },
      },
      // عدد البوستات المنشورة الكلي للـ pagination
      _count: {
        select: {
          posts: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
      // البوستات المنشورة فقط
      posts: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: {
          createdAt: "desc",
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
          // Categories و Tags للبوست
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
  });

  if (!author) {
    return null;
  }

  const totalPosts = author._count.posts;
  const totalPages = Math.ceil(totalPosts / take);

  // تنسيق البوستات (تحويل categories و tags لمصفوفات نظيفة)
  const formattedPosts = author.posts.map((post) => ({
    ...post,
    categories: post.categories.map((c) => c.category),
    tags: post.tags.map((t) => t.tag),
  }));

  return {
    author: {
      id: author.id,
      name: author.name,
      email: author.email,
      bio: author.bio,
      profileImageUrl: author.profileImageUrl,
      createdAt: author.createdAt,
      socialLinks: author.socialLinks,
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

/**
 * فنكشن إضافية: جلب كل المؤلفين (مفيدة للـ sidebar أو admin)
 */
export async function getAllAuthors() {
  return await prisma.author.findMany({
    select: {
      id: true,
      name: true,
      profileImageUrl: true,
      bio: true,
      _count: {
        select: {
          posts: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}