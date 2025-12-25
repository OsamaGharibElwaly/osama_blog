// src/app/author-panel/posts/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client";
import Link from "next/link";
import { format } from "date-fns";

// نوع يدوي للبوست
type AuthorPost = {
  id: number;
  title: string;
  slug: string | null;
  shortDescription: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{ tag: { id: number; name: string } }>;
  comments: Array<{ id: number; status: string }>;
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
      tags: { include: { tag: { select: { id: true, name: true } } } },
      comments: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // حساب عدد التعليقات الموافق عليها لكل بوست
  const postsWithApprovedComments = posts.map(post => ({
    ...post,
    approvedCommentsCount: post.comments.filter(c => c.status === "APPROVED").length,
  }));

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
          <>
            {/* الجدول */}
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-12">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Comments</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                      <td className="p-4">
                        <Link href={`/author-panel/posts/${post.id}/edit`} className="hover:text-green-400">
                          {post.title}
                        </Link>
                      </td>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4">{post.comments.length}</td>
                      <td className="p-4">
                        {format(new Date(post.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-4">
                          <Link href={`/author-panel/posts/${post.id}/edit`} className="text-green-400 hover:underline">
                            Edit
                          </Link>
                          <Link
                            href={`/posts/${post.slug || post.id}`}
                            target="_blank"
                            className="text-blue-400 hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* قسم إضافي تحت الجدول: تفاصيل أكثر */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">More Details About Your Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-750 rounded-lg p-5 hover:bg-gray-700 transition">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {post.shortDescription?.substring(0, 80) || "No description"}...
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.length > 0 ? (
                        post.tags.map((t) => (
                          <span
                            key={t.tag.id}
                            className="px-2 py-1 bg-gray-600 text-xs rounded"
                          >
                            {t.tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No tags</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Created: {format(new Date(post.createdAt), "MMM dd, yyyy")}</div>
                      <div>Last updated: {format(new Date(post.updatedAt || post.createdAt), "MMM dd, yyyy")}</div>
                      <div>Approved comments: {post.comments.filter(c => c.status === "APPROVED").length}</div>
                      <div>Total comments: {post.comments.length}</div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <Link
                        href={`/author-panel/posts/${post.id}/edit`}
                        className="text-green-400 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/posts/${post.slug || post.id}`}
                        target="_blank"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        View live
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}