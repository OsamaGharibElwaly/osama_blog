import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client";
import Link from "next/link";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import MarkdownEditor from "@/components/MarkdownEditor";

type AdminCategory = { id: number; name: string };
type AdminTag = { id: number; name: string };

export default async function AuthorNewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "AUTHOR") {
    redirect("/login");
  }

  const authorId = Number(session.user.id);
  if (isNaN(authorId)) throw new Error("Invalid user ID");

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

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").trim() || "post";

    const shortDescription = formData.get("shortDescription") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "DRAFT" | "PENDING";

    let thumbnailUrl: string | null = null;
    const file = formData.get("thumbnail") as File | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/posts");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      thumbnailUrl = `/uploads/posts/${filename}`;
    }

    const categoryIds = (formData.getAll("categories") as string[]).map(Number).filter((n) => !isNaN(n));
    const tagIds = (formData.getAll("tags") as string[]).map(Number).filter((n) => !isNaN(n));

    await prisma.post.create({
      data: {
        title,
        slug,
        shortDescription,
        content,
        thumbnailUrl,
        status,
        author: { connect: { id: authorId } },
        categories: { create: categoryIds.map((id) => ({ category: { connect: { id } } })) },
        tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
      },
    });

    redirect("/author-panel/posts");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-xl font-bold">A</div>
          <h2 className="text-xl font-bold">Author Panel</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/author-panel" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">Dashboard</Link>
          <Link href="/author-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition">My Posts</Link>
          <Link href="/author-panel/posts/new" className="block py-3 px-4 bg-green-600 rounded-lg font-medium">+ New Post</Link>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8">Write New Post</h1>
        <form action={createPost} className="max-w-6xl space-y-10">
          {/* العنوان */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" name="title" className="mt-1 block w-full" />
          </div>

          {/* الوصف */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Short Description</label>
            <textarea id="shortDescription" name="shortDescription" className="mt-1 block w-full"></textarea>
          </div>

          {/* MarkdownEditor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <MarkdownEditor name="content" required={true} initialValue="Write your markdown here..." />
          </div>

          {/* الصورة المصغرة */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail</label>
            <input type="file" id="thumbnail" name="thumbnail" className="mt-1 block w-full" />
          </div>

          {/* الحالة */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" className="mt-1 block w-full">
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* التصنيفات */}
          <div>
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Categories</label>
            <select id="categories" name="categories" className="mt-1 block w-full" multiple>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* التاجز */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
            <select id="tags" name="tags" className="mt-1 block w-full" multiple>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>

          {/* الأزرار */}
          <div className="flex justify-between">
            <button type="submit" className="btn btn-primary">Create Post</button>
            <Link href="/author-panel/posts" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}