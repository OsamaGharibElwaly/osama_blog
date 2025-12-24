// src/app/admin-panel/authors/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/db/client";
import Link from "next/link";

export default async function AuthorsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const authors = await prisma.author.findMany({
  include: {
    role: true,
    posts: {
      select: { id: true },
    },
  },
  orderBy: { createdAt: "desc" },
});

  const roles = await prisma.role.findMany();

  async function deleteAuthor(formData: FormData) {
    "use server";
    const authorId = Number(formData.get("authorId"));
    await prisma.author.delete({ where: { id: authorId } });
    redirect("/admin-panel/authors");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar - نفس اللي في Dashboard */}
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
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Posts
          </Link>
          <Link href="/admin-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            + New Post
          </Link>
          <Link href="/admin-panel/authors" className="block py-3 px-4 bg-blue-600 rounded-lg">
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
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg mt-8">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Authors Management</h1>
          <Link href="/admin-panel/authors/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
            + Add Author
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Posts</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id} className="border-b border-gray-700">
                  <td className="p-4">{author.name}</td>
                  <td className="p-4">{author.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      author.role.name === "ADMIN" ? "bg-purple-600" : "bg-green-600"
                    }`}>
                      {author.role.name}
                    </span>
                  </td>
                  <td className="p-4">{author.posts.length}</td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/admin-panel/authors/${author.id}/edit`} className="text-blue-400 hover:underline">
                        Edit
                      </Link>
                      <form action={deleteAuthor}>
                        <input type="hidden" name="authorId" value={author.id} />
                        <button type="submit" className="text-red-400 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}