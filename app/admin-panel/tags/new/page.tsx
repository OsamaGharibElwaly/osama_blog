// src/app/admin-panel/tags/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../../lib/db/client";
import Link from "next/link";

export default async function NewTagPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  async function createTag(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    await prisma.tag.create({
      data: { name, slug },
    });

    redirect("/admin-panel/tags");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <nav className="space-y-2">
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Tags
          </Link>
          <Link href="/admin-panel/tags/new" className="block py-3 px-4 bg-blue-600 rounded-lg">
            + Add Tag
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Add New Tag</h1>

        <form action={createTag} className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tag Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Next.js"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
              Create Tag
            </button>
            <Link href="/admin-panel/tags" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}