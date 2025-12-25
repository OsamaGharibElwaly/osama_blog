import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";


type DashboardPost = {
  id: number;
  title: string;
  status: string;
  createdAt: Date;
  author: {
    name: string;
  };
};


type DashboardMessage = {
  id: number;
  name: string;
  messageBody: string;
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const totalPosts = await prisma.post.count();
  const totalAuthors = await prisma.author.count();
  const totalViews = await prisma.postView.count();
  const pendingComments = await prisma.comment.count({ where: { status: "PENDING" } });


  const latestPosts: DashboardPost[] = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });


  const recentMessages: DashboardMessage[] = await prisma.contactMessage.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/admin-panel" className="block py-3 px-4 bg-blue-600 rounded-lg font-medium">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Posts
          </Link>
          <Link href="/admin-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            + New Post
          </Link>
          <Link href="/admin-panel/authors" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Authors
          </Link>
          <Link href="/admin-panel/category" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Categories
          </Link>
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Tags
          </Link>
          <Link href="/admin-panel/comments" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Comments
          </Link>
          <Link href="/admin-panel/contact-messages" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition mt-8">
            Settings
          </Link>
        </nav>

        {/* User Info + Logout */}
        <div className="mt-auto pt-10 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={session.user.image || "https://placehold.co/40x40"}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{session.user.name || "Admin"}</p>
              <p className="text-sm text-gray-400">Administrator</p>
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
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Posts</h3>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">📄</div>
            </div>
            <p className="text-4xl font-bold">{totalPosts}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Authors</h3>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-2xl">👥</div>
            </div>
            <p className="text-4xl font-bold">{totalAuthors}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Views</h3>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">👁️</div>
            </div>
            <p className="text-4xl font-bold">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Pending Comments</h3>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-2xl">💬</div>
            </div>
            <p className="text-4xl font-bold">{pendingComments}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Posts */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Latest Posts</h2>
              <Link href="/admin-panel/posts" className="text-blue-400 hover:underline transition">
                View All →
              </Link>
            </div>
            {latestPosts.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No posts yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">POST TITLE</th>
                    <th className="pb-3">AUTHOR</th>
                    <th className="pb-3">DATE</th>
                    <th className="pb-3">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPosts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                      <td className="py-4">
                        <Link href={`/admin-panel/posts/${post.id}/edit`} className="hover:text-blue-400 transition">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-4">{post.author.name}</td>
                      <td className="py-4">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === "PUBLISHED"
                              ? "bg-green-600"
                              : post.status === "DRAFT"
                              ? "bg-orange-600"
                              : post.status === "PENDING"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Messages</h2>
              <Link href="/admin-panel/contact-messages" className="text-blue-400 hover:underline transition">
                View All →
              </Link>
            </div>
            {recentMessages.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-4 p-4 bg-gray-750 rounded-lg transition">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{msg.name}</p>
                      <p className="text-gray-400 text-sm line-clamp-2">{msg.messageBody}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}