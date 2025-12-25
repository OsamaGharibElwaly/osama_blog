import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";
import DeleteTagButton from "@/components/DeleteTagButton"; // Import the client component

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
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
                  {/* Use the DeleteTagButton component here */}
                  <DeleteTagButton tagId={tag.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
