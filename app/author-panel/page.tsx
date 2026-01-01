import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";


type AuthorPost = {
  id: number;
  title: string;
  slug: string | null; 
  status: string;
  createdAt: Date;
  comments: Array<{ id: number }>;
};

export default async function AuthorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const authorId = Number(session.user.id);

  if (isNaN(authorId)) {
    redirect("/login");
  }

  const posts: AuthorPost[] = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: { comments: { select: { id: true } } },
  });

  const stats = {
    totalPosts: posts.length,
    published: posts.filter((p: AuthorPost) => p.status === "PUBLISHED").length,
    drafts: posts.filter((p: AuthorPost) => p.status === "DRAFT").length,
    pending: posts.filter((p: AuthorPost) => p.status === "PENDING").length,
  };

  const userName = session.user.name || "Author";
  const userImage = session.user.image || "https://placehold.co/40x40";

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
          <Link href="/author-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            My Posts
          </Link>
          <Link href="/author-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            + New Post
          </Link>
        </nav>

        {/* User Info + Logout */}
        <div className="mt-auto pt-10 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={userImage}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-gray-400">Author</p>
            </div>
          </div>

          <form action="/api/auth/signout" method="post">
            <input type="hidden" name="callbackUrl" value="/" />
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
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {userName}!</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm">Total Posts</h3>
            <p className="text-4xl font-bold mt-2">{stats.totalPosts}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm">Published</h3>
            <p className="text-4xl font-bold mt-2 text-green-500">{stats.published}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm">Drafts</h3>
            <p className="text-4xl font-bold mt-2 text-orange-500">{stats.drafts}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm">Pending Review</h3>
            <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
          </div>
        </div>

        {/* Recent Posts Table */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Recent Posts</h2>
            <Link href="/author-panel/posts" className="text-blue-400 hover:underline">
              View all →
            </Link>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {posts.length === 0 ? (
              <p className="p-8 text-center text-gray-400">
                There are no posts yet.{" "}
                <Link href="/author-panel/posts/new" className="text-blue-400 hover:underline">
                  Create your first post!
                </Link>
              </p>
            ) : (
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
                  {posts.slice(0, 5).map((post: AuthorPost) => (
                    <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                      <td className="p-4">{post.title}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === "PUBLISHED"
                              ? "bg-green-600"
                              : post.status === "DRAFT"
                              ? "bg-orange-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4">{post.comments.length}</td>
                      <td className="p-4">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/author-panel/posts/${post.id}/edit`}
                          className="text-blue-400 hover:underline mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/posts/${post.slug || post.id}`}
                          className="text-green-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}