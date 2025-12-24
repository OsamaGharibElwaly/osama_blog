// src/app/admin-panel/categories/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../../lib/db/client";
import Link from "next/link";

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  async function createCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    await prisma.category.create({
      data: { name, slug },
    });

    redirect("/admin-panel/category");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <nav className="space-y-2">
          <Link href="/admin-panel/category" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Categories
          </Link>
          <Link href="/admin-panel/category/new" className="block py-3 px-4 bg-blue-600 rounded-lg">
            + New Category
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Add New Category</h1>

        <form action={createCategory} className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Technology"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
              Create Category
            </button>
            <Link href="/admin-panel/categories" className="px-6 py-3 bg-gray-700 rounded-lg">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}