// src/app/author-panel/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/db/client";
import Link from "next/link";

export default async function AuthorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "AUTHOR") {
    redirect("/login");
  }

  const authorId = Number(session.user.id);

  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: { comments: true },
  });

  const stats = {
    totalPosts: posts.length,
    published: posts.filter(p => p.status === "PUBLISHED").length,
    drafts: posts.filter(p => p.status === "DRAFT").length,
    pending: posts.filter(p => p.status === "PENDING").length,
  };

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
          <Link href="/author-panel" className="block py-3 px-4 bg-green-600 rounded-lg font-medium">
            Dashboard
          </Link>
          <Link href="/author-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            My Posts
          </Link>
          <Link href="/author-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            + New Post
          </Link>
        </nav>

        {/* User Info + Logout */}
        <div className="mt-auto pt-10 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={session.user.image || "https://placehold.co/40x40"}
              alt="Author"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-gray-400">Author</p>
            </div>
          </div>

          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full text-left py-3 px-4 hover:bg-red-900/30 rounded-lg text-red-400 font-medium transition"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {session.user.name}!</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400">Total Posts</h3>
            <p className="text-4xl font-bold mt-2">{stats.totalPosts}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400">Published</h3>
            <p className="text-4xl font-bold mt-2 text-green-500">{stats.published}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400">Drafts</h3>
            <p className="text-4xl font-bold mt-2 text-orange-500">{stats.drafts}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400">Pending Review</h3>
            <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Recent Posts</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Comments</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.slice(0, 5).map((post) => (
                  <tr key={post.id} className="border-b border-gray-700">
                    <td className="p-4">{post.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        post.status === "PUBLISHED" ? "bg-green-600" :
                        post.status === "DRAFT" ? "bg-orange-600" :
                        "bg-yellow-600"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4">{post.comments.length}</td>
                    <td className="p-4">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Link href={`/author-panel/posts/${post.id}/edit`} className="text-blue-400 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}