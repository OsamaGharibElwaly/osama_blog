import Header from "@/components/layout/Header";
import prisma from "@/lib/db/client";
import { PostStatus } from "@/generated/prisma/client";
import Link from "next/link";


type PublicCategory = {
  id: number;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
};

type PublicPost = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  author: {
    name: string;
    profileImageUrl: string | null;
  };
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  comments: Array<{ id: number }>;
};

type PublicTag = {
  id: number;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
};

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const { cat, page } = await searchParams;
  const selectedSlug = cat || null;
  const currentPage = Number(page) || 1;
  const postsPerPage = 6;

  const categories: PublicCategory[] = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: { post: { status: "PUBLISHED" } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const postWhere = selectedSlug
  ? {
      status: PostStatus.PUBLISHED, 
      categories: {
        some: {
          category: {
            slug: selectedSlug,
          },
        },
      },
    }
  : { status: PostStatus.PUBLISHED }; 

  const totalPosts = await prisma.post.count({ where: postWhere });
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  
  const posts = await prisma.post.findMany({
    where: postWhere,
    include: {
      author: { select: { name: true, profileImageUrl: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * postsPerPage,
    take: postsPerPage,
  }) as unknown as PublicPost[];

  const topTags: PublicTag[] = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: { post: { status: "PUBLISHED" } },
          },
        },
      },
    },
    orderBy: { posts: { _count: "desc" } },
    take: 10,
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          {/* Category Slicer */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/category"
                className={`px-6 py-3 rounded-full font-medium transition ${
                  !selectedSlug
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All Categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category?cat=${category.slug}`}
                  className={`px-6 py-3 rounded-full font-medium transition ${
                    selectedSlug === category.slug
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {category.name} ({category._count.posts})
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts List */}
            <div className="lg:col-span-2 space-y-8">
              {posts.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-20 text-2xl">
                  No posts in this category yet.
                </p>
              ) : (
                posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition"
                  >
                    <div className="md:w-1/3">
                      <img
                        src={post.thumbnailUrl || "https://placehold.co/600x400"}
                        alt={post.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition">
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
                          {post.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((t) => (
                            <Link
                              key={t.tag.id}
                              href={`/tag/${t.tag.slug}`}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition"
                            >
                              {t.tag.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
                        <div>
                          <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="mx-2">·</span>
                          <span>by {post.author.name}</span>
                          <span className="mx-2">·</span>
                          <span>{post.comments.length} Comments</span>
                        </div>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/category${selectedSlug ? `?cat=${selectedSlug}` : ""}${p > 1 ? `&page=${p}` : ""}`}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        p === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Top Tags Sidebar */}
            <aside className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Top Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.length === 0 ? (
                    <p className="text-gray-500">No tags yet</p>
                  ) : (
                    topTags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                      >
                        {tag.name} ({tag._count.posts})
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}