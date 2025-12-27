import Header from "@/components/layout/Header";
import prisma from "@/lib/db/client";
import { PostStatus } from "@/generated/prisma/client";
import Link from "next/link";
import { format } from "date-fns";

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
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Category Selector */}
          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/category"
                className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  !selectedSlug
                    ? "bg-blue-600 text-white scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
                }`}
              >
                All Categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category?cat=${category.slug}`}
                  className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                    selectedSlug === category.slug
                      ? "bg-blue-600 text-white scale-105"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  {category.name} ({category._count.posts})
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts List */}
            <div className="lg:col-span-2 space-y-12">
              {posts.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-32 text-3xl font-light">
                  No posts in this category yet.
                </p>
              ) : (
                posts.map((post, index) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="md:w-1/3 relative overflow-hidden group">
                      <img
                        src={post.thumbnailUrl || "https://placehold.co/600x400"}
                        alt={post.title}
                        className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="md:w-2/3 p-8 flex flex-col justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                          <Link
                            href={`/posts/${post.slug}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed line-clamp-3 mb-6">
                          {post.shortDescription}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                          {post.tags.map((t) => (
                            <Link
                              key={t.tag.id}
                              href={`/tag/${t.tag.slug}`}
                              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/60 hover:shadow-md transition-all duration-300"
                            >
                              {t.tag.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>{format(new Date(post.createdAt), "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span>by {post.author.name}</span>
                          <span>•</span>
                          <span>{post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}</span>
                        </div>

                        <Link
                          href={`/posts/${post.slug}`}
                          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
                <div className="flex justify-center gap-3 mt-16 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/category${selectedSlug ? `?cat=${selectedSlug}` : ""}${p > 1 ? `${selectedSlug ? "&" : "?"}page=${p}` : ""}`}
                      className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                        p === currentPage
                          ? "bg-blue-600 text-white shadow-lg scale-110"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md hover:scale-105"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Top Tags */}
            <aside className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Top Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {topTags.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No tags yet</p>
                  ) : (
                    topTags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-5 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-800 dark:text-blue-300 font-medium rounded-full hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/60 dark:hover:to-purple-800/60 hover:shadow-md transition-all duration-300"
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