
import Header from "@/components/layout/Header";
import prisma from "../lib/db/client";
import Link from "next/link";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  
  const session = await getServerSession(authOptions);

  
  if (session) { 
  if (session.user?.role === "ADMIN") {
    redirect("/admin-panel");
  } else if (session.user?.role === "AUTHOR") {
    redirect("/author-panel");
  }
}

  
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 6;

  const totalPosts = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: true,
      tags: { include: { tag: true } },
      comments: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * postsPerPage,
    take: postsPerPage,
  });

  const topTags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    where: { posts: { some: {} } },
    orderBy: { posts: { _count: "desc" } },
    take: 10,
  });
  
  
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Posts */}
            <div className="lg:col-span-2 space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row"
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
                          <span
                            key={t.tag.id}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <span>{format(new Date(post.createdAt), "MMM dd, yyyy")}</span>
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
              ))}

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/?page=${p}`}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      p === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-8">
              {/* About Me */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">About Me</h3>
                <div className="text-center">
                  <img
                    src="https://placehold.co/200x200"
                    alt="About Me"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <p className="text-gray-600 dark:text-gray-300">
                    Full-stack developer passionate about clean code and modern web technologies.
                  </p>
                </div>
              </div>

              {/* Follow Me */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4">Follow Me</h3>
                <div className="flex justify-center gap-6 text-3xl">
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Twitter</a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">LinkedIn</a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">GitHub</a>
                </div>
              </div>

              {/* Top Tags */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Top Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug || tag.name.toLowerCase().replace(/ /g, "-")}`}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 transition"
                    >
                      {tag.name} ({tag._count.posts})
                    </Link>
                  ))}
                </div>
              </div>

              {/* Login Prompt */}
              <div className="bg-blue-600 text-white rounded-xl p-6 text-center">
                <p className="font-medium">Are you admin/author?</p>
                <Link href="/login" className="mt-2 inline-block underline hover:no-underline">
                  Click here
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}