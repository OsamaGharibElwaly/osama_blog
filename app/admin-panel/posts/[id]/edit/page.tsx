// src/app/admin-panel/posts/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../../../lib/db/client";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const postId = Number(params.id);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      author: true,
    },
  });

  if (!post) redirect("/admin-panel/posts");

  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();

  async function updatePost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        shortDescription: formData.get("shortDescription") as string,
        content: formData.get("content") as string,
        thumbnailUrl: formData.get("thumbnailUrl") ? (formData.get("thumbnailUrl") as string) : null,
        status: formData.get("status") as any,
        categories: {
          deleteMany: {},
          create: (formData.getAll("categories") as string[]).map((id) => ({
            category: { connect: { id: Number(id) } },
          })),
        },
        tags: {
          deleteMany: {},
          create: (formData.getAll("tags") as string[]).map((id) => ({
            tag: { connect: { id: Number(id) } },
          })),
        },
      },
    });

    redirect("/admin-panel/posts");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar نفس اللي فوق */}
      <aside className="w-64 bg-gray-800 p-6">
        {/* نفس الكود */}
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Edit Post: {post.title}</h1>

        <form action={updatePost} className="max-w-4xl space-y-6">
          {/* نفس الفورم من New Post بس values من post */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={post.title}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg"
            />
          </div>

          {/* كل الحقول نفسها مع defaultValue أو checked */}
          {/* ... نفس الكود من New Post مع defaultValue */}

          <div className="flex gap-4">
            <button type="submit" className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium">
              Update Post
            </button>
            <Link href="/admin-panel/posts" className="px-8 py-3 bg-gray-700 rounded-lg font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}