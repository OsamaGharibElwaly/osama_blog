import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";

type AdminTag = {
  id: number;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
};

export default async function TagsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  
  const tags: AdminTag[] = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  async function deleteTag(formData: FormData) {
    "use server";
    const tagId = Number(formData.get("tagId"));
    if (isNaN(tagId)) return;

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
          <Link href="/admin-panel" className="block py-3 px-4 rounded-lg font-medium">
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
          <Link href="/admin-panel/tags" className="block py-3 px-4 bg-blue-600 rounded-lg">
            Tags
          </Link>
          <Link href="/admin-panel/comments" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Comments
          </Link>
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tags Management ({tags.length})</h1>
          <Link href="/admin-panel/tags/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
            + Add Tag
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-20 text-xl">
              No tags yet. Create your first tag!
            </p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-gray-800 rounded-xl p-6 flex justify-between items-center hover:bg-gray-750 transition"
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-400">{tag.name}</h3>
                  <p className="text-sm text-gray-400">
                    {tag._count.posts} post{tag._count.posts !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-6">
                  <Link
                    href={`/admin-panel/tags/${tag.id}/edit`}
                    className="text-blue-400 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteTag}>
                    <input type="hidden" name="tagId" value={tag.id} />
                    <button
                      type="submit"
                      className="text-red-400 hover:underline"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this tag?")) {
                          e.preventDefault();
                        }
                      }}
                    >
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