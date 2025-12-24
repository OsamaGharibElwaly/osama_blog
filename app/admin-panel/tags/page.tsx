import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/db/client";
import Link from "next/link";

export default async function TagsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  async function deleteTag(formData: FormData) {
    "use server";
    const tagId = Number(formData.get("tagId"));
    await prisma.tag.delete({ where: { id: tagId } });
    redirect("/admin-panel/tags");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar موحد */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/admin-panel" className="block py-3 px-4  rounded-lg font-medium">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
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
          <Link href="/admin-panel/tags" className="block py-3 px-4 bg-blue-600 hover:bg-gray-700 rounded-lg">
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
          <h1 className="text-3xl font-bold">Tags Management ({tags.length})</h1>
          <Link href="/admin-panel/tags/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            + Add Tag
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-10">No tags yet. Create your first tag!</p>
          ) : (
            tags.map((tag) => (
              <div key={tag.id} className="bg-gray-800 rounded-xl p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">{tag.name}</h3>
                  <p className="text-sm text-gray-400">{tag._count.posts} post{tag._count.posts !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-4">
                  <Link href={`/admin-panel/tags/${tag.id}/edit`} className="text-blue-400 hover:underline">
                    Edit
                  </Link>
                  <form action={deleteTag}>
                    <input type="hidden" name="tagId" value={tag.id} />
                    <button type="submit" className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}