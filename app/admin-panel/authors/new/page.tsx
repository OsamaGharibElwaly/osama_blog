// src/app/admin-panel/authors/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../../lib/db/client";
import Link from "next/link";
import { hash } from "bcryptjs";

export default async function NewAuthorPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // جلب الـ Roles للـ dropdown
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  async function createAuthor(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;
    const bio = formData.get("bio") as string | null;
    const profileImageUrl = (formData.get("profileImageUrl") as string) || null;
    const roleId = Number(formData.get("roleId"));

    if (!name || !email || !rawPassword || !roleId) {
      throw new Error("All required fields must be filled");
    }

    // تشفير الباسورد
    const passwordHash = await hash(rawPassword, 10);

    await prisma.author.create({
      data: {
        name,
        email,
        passwordHash,
        bio: bio || null,
        profileImageUrl,
        roleId,
      },
    });

    redirect("/admin-panel/authors");
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
          <Link href="/admin-panel" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Posts
          </Link>
          <Link href="/admin-panel/authors" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Authors
          </Link>
          <Link href="/admin-panel/authors/new" className="block py-3 px-4 bg-blue-600 rounded-lg font-medium">
            + Add Author
          </Link>
          <Link href="/admin-panel/categories" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Categories
          </Link>
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Tags
          </Link>
          {/* باقي اللينكات */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8">Add New Author</h1>

        <form action={createAuthor} className="max-w-2xl space-y-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="author@techstream.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="At least 6 characters"
            />
            <p className="text-sm text-gray-400 mt-2">The password will be securely hashed</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select
              name="roleId"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.description && `(${role.description})`}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio (optional)</label>
            <textarea
              name="bio"
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Short bio about the author..."
            />
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Image URL (optional)</label>
            <input
              name="profileImageUrl"
              type="url"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition"
            >
              Create Author
            </button>
            <Link
              href="/admin-panel/authors"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-lg"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}