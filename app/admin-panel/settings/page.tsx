// src/app/admin-panel/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <nav className="space-y-2">
          <Link href="/admin-panel" className="block py-3 px-4 font-medium">
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
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Tags
          </Link>
          <Link href="/admin-panel/comments" className="block py-3 px-4  hover:bg-gray-700 rounded-lg">
            Comments
          </Link>
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 bg-blue-600 hover:bg-gray-700 rounded-lg mt-4">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="bg-gray-800 rounded-xl p-8">
          <p className="text-gray-300">Blog settings, theme, SEO, and more coming soon...</p>
        </div>
      </main>
    </div>
  );
}