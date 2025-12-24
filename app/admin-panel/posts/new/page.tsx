import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import MarkdownEditor from "@/components/MarkdownEditor";


type AdminCategory = {
  id: number;
  name: string;
};

type AdminTag = {
  id: number;
  name: string;
};

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const authorId = Number(session.user.id);
  if (isNaN(authorId) || !authorId) {
    throw new Error("Invalid user ID");
  }

  const categories: AdminCategory[] = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const tags: AdminTag[] = await prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function createPost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    if (!title?.trim()) throw new Error("Title is required");

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim() || "post";

    const shortDescription = formData.get("shortDescription") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "DRAFT" | "PENDING" | "PUBLISHED";

    let thumbnailUrl: string | null = null;
    const file = formData.get("thumbnail") as File | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/posts");
      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      thumbnailUrl = `/uploads/posts/${filename}`;
    }

    const categoryIds = (formData.getAll("categories") as string[])
      .map(Number)
      .filter((n) => !isNaN(n));

    const tagIds = (formData.getAll("tags") as string[])
      .map(Number)
      .filter((n) => !isNaN(n));

    await prisma.post.create({
      data: {
        title,
        slug,
        shortDescription,
        content,
        thumbnailUrl,
        status,
        author: { connect: { id: authorId } },
        categories: {
          create: categoryIds.map((catId) => ({
            category: { connect: { id: catId } },
          })),
        },
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });

    redirect("/admin-panel/posts");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/admin-panel" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Posts
          </Link>
          <Link href="/admin-panel/posts/new" className="block py-3 px-4 bg-blue-600 rounded-lg font-medium">
            + New Post
          </Link>
          <Link href="/admin-panel/categories" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Categories
          </Link>
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">
            Tags
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8">Create New Post</h1>

        <form action={createPost} className="max-w-6xl space-y-10">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Post Title *</label>
            <input
              name="title"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a catchy title..."
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Short Description *</label>
            <textarea
              name="shortDescription"
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief summary of the post..."
            />
          </div>

          {/* Markdown Editor */}
          <MarkdownEditor name="content" required />

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail Image (optional)</label>
            <input
              name="thumbnail"
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-sm text-gray-400 mt-2">Recommended: 1200x630px</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              defaultValue="DRAFT"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending Review</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat.id}
                    className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.id}
                    className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition"
            >
              Create Post
            </button>
            <Link
              href="/admin-panel/posts"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}