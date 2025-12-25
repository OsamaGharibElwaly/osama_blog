// pages/admin-panel/category/index.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";
import DeleteCategoryButton from "@/components/DeleteCategoryButton"; // Import the client component

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count: {
    posts: number;
  };
};

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const categories: AdminCategory[] = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
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
          <Link href="/admin-panel/category" className="block py-3 px-4 hover:bg-gray-700 bg-blue-600 rounded-lg transition">
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

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <Link href="/admin-panel/category/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            + Add Category
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          {categories.length === 0 ? (
            <p className="p-10 text-center text-gray-400">No categories found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Slug</th>
                  <th className="text-left p-4 font-medium">Posts Count</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-4">{cat.name}</td>
                    <td className="p-4">{cat.slug}</td>
                    <td className="p-4">{cat._count.posts}</td>
                    <td className="p-4">
                      <div className="flex gap-6">
                        <Link
                          href={`/admin-panel/category/${cat.id}/edit`}
                          className="text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        {/* Use the DeleteCategoryButton component here */}
                        <DeleteCategoryButton catId={cat.id} />
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
