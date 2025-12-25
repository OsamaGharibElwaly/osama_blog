import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client";
import Link from "next/link";
import { format } from "date-fns";

type AuthorPost = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: Date;
  tags: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
  comments: Array<{ id: number }>;
};

export default async function AuthorPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "AUTHOR") {
    redirect("/login");
  }

  const authorId = Number(session.user.id);

  const posts: AuthorPost[] = await prisma.post.findMany({
    where: { authorId },
    include: {
      tags: { include: { tag: true } },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Author Panel</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/author-panel" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Dashboard
          </Link>
          <Link href="/author-panel/posts" className="block py-3 px-4 bg-green-600 rounded-lg font-medium">
            My Posts
          </Link>
          <Link href="/author-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            + New Post
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">My Posts ({posts.length})</h1>
          <Link
            href="/author-panel/posts/new"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
          >
            + Write New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-8">You haven't written any posts yet.</p>
            <Link
              href="/author-panel/posts/new"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg transition inline-block"
            >
              Start Writing Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.thumbnailUrl || "https://placehold.co/600x400"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-600"
                          : post.status === "PENDING"
                          ? "bg-yellow-600"
                          : "bg-orange-600"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {post.shortDescription || "No description available."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((t) => (
                      <span
                        key={t.tag.id}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{format(new Date(post.createdAt), "MMM dd, yyyy")}</span>
                    <span>{post.comments.length} Comments</span>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Link
                      href={`/author-panel/posts/${post.id}/edit`}
                      className="flex-1 text-center py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}