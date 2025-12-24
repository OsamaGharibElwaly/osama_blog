// src/app/author-panel/posts/[id]/edit/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export default async function AuthorEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const postId = Number(id);

  if (isNaN(postId)) {
    redirect("/author-panel/posts");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "AUTHOR") {
    redirect("/login");
  }

  const authorId = Number(session.user.id);

  // جلب البوست مع التأكد من أنه ملك المؤلف
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    redirect("/author-panel/posts"); // البوست مش موجود أو مش ملكك
  }

  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();

  // Server Action لتحديث البوست
  async function updatePost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const shortDescription = formData.get("shortDescription") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "DRAFT" | "PENDING" | "PUBLISHED"; // لو عايز تضيف PUBLISHED

    // دلوقتي post موجود بالتأكيد (خارج الـ action بس داخل الـ page)
    let thumbnailUrl: string | null = post?.thumbnailUrl ?? null;

    const file = formData.get("thumbnail") as File | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // اسم ملف فريد
      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/posts");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      thumbnailUrl = `/uploads/posts/${filename}`;
    }

    const categoryIds = (formData.getAll("categories") as string[])
      .map(Number)
      .filter((n) => !isNaN(n));
    const tagIds = (formData.getAll("tags") as string[])
      .map(Number)
      .filter((n) => !isNaN(n));

    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        shortDescription,
        content,
        thumbnailUrl,
        status,
        categories: {
          deleteMany: {}, // امسح القديمة
          create: categoryIds.map((catId) => ({
            category: { connect: { id: catId } },
          })),
        },
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });

    redirect("/author-panel/posts");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar - نفس اللي في الـ dashboard أو new post */}

      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-8">Edit Post: {post.title}</h1>

        <form action={updatePost} className="max-w-4xl space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={post.title}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <textarea
              name="shortDescription"
              required
              rows={4}
              defaultValue={post.shortDescription}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown supported)</label>
            <textarea
              name="content"
              required
              rows={16}
              defaultValue={post.content}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Thumbnail</label>
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt="Current thumbnail"
                className="w-96 h-64 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-96 h-64 bg-gray-700 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                No thumbnail
              </div>
            )}
            <input
              name="thumbnail"
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg file:bg-green-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded"
            />
            <p className="text-sm text-gray-400 mt-2">Leave empty to keep current image</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              defaultValue={post.status}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending Review</option>
              <option value="PUBLISHED">Published</option> {/* لو عايز المؤلف ينشر بنفسه */}
            </select>
          </div>

          {/* Categories Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat.id}
                    defaultChecked={post.categories.some((pc) => pc.category.id === cat.id)}
                    className="w-5 h-5 text-green-600 bg-gray-800 rounded focus:ring-green-600"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.id}
                    defaultChecked={post.tags.some((pt) => pt.tag.id === tag.id)}
                    className="w-5 h-5 text-green-600 bg-gray-800 rounded focus:ring-green-600"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg transition"
            >
              Update Post
            </button>
            <Link
              href="/author-panel/posts"
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