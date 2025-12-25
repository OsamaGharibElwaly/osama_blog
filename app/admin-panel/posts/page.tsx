import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client";
import Link from "next/link";
import PostActions from "@/components/PostActions";  // استيراد Client Component

type AdminPost = {
  id: number;
  title: string;
  status: string;
  createdAt: Date;
  author: {
    name: string;
  };
  comments: Array<{ id: number }>;
};

export default async function PostsListPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // جلب البوستات من قاعدة البيانات
  const posts: AdminPost[] = await prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        {/* Sidebar content */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Posts ({posts.length})</h1>
          <Link
            href="/admin-panel/posts/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            + New Post
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          {posts.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-xl">
              No posts yet.{" "}
              <Link href="/admin-panel/posts/new" className="text-blue-400 hover:underline">
                Create your first post!
              </Link>
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Author</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Comments</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-4 font-medium">
                      <Link href={`/admin-panel/posts/${post.id}/edit`} className="hover:text-blue-400">
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-4">{post.author.name}</td>
                    <td className="p-4">{post.status}</td>
                    <td className="p-4">{post.comments.length}</td>
                    <td className="p-4">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <Link
                          href={`/admin-panel/posts/${post.id}/edit`}
                          className="text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <PostActions postId={post.id} /> {/* استخدام PostActions Client Component هنا */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
