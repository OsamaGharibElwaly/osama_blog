'use client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";


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

  
  const posts: AdminPost[] = await prisma.post.findMany({
    include: {
      author: { select: { name: true } }, 
      comments: { select: { id: true } }, 
    },
    orderBy: { createdAt: "desc" },
  });

  async function deletePost(formData: FormData) {
    "use server";

    const postId = Number(formData.get("postId"));
    if (isNaN(postId)) return;

    
    await prisma.postCategory.deleteMany({ where: { postId } });
    await prisma.postTag.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });

    redirect("/admin-panel/posts");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/admin-panel" className="block py-3 px-4 rounded-lg font-medium">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 bg-blue-600 rounded-lg">
            Posts
          </Link>
          <Link href="/admin-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            + New Post
          </Link>
          <Link href="/admin-panel/authors" className="block py-3 px-4 rounded-lg">
            Authors
          </Link>
          <Link href="/admin-panel/category" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Categories
          </Link>
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Tags
          </Link>
          <Link href="/admin-panel/comments" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Comments
          </Link>
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Settings
          </Link>
        </nav>
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
                    <td className="p-4">
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
                        <form action={deletePost}>
                          <input type="hidden" name="postId" value={post.id} />
                          <button
                            type="submit"
                            className="text-red-400 hover:underline"
                            onClick={(e) => {
                              if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
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