import prisma from "@/lib/db/client";

export async function getTagBySlug(
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

  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
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
            },
          },
        },
      },
    },
  });

  if (!tag) {
    return null;
  }

  const totalPosts = tag._count.posts;
  const totalPages = Math.ceil(totalPosts / take);

  const formattedPosts = tag.posts.map((pt: any) => ({
    ...pt.post,
    categories: pt.post.categories.map((c: any) => c.category),
  }));

  return {
    tag: {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt,
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