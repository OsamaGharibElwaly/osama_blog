import Header from "@/components/layout/Header";
import prisma from "../../../lib/db/client";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 
import rehypeRaw from "rehype-raw"; 
import { format } from "date-fns";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) notFound();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Featured Image */}
          <img
            src={post.thumbnailUrl || "https://placehold.co/1200x600"}
            alt={post.title}
            className="w-full h-96 object-cover rounded-xl shadow-lg mb-12"
          />

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
            <img
              src={post.author.profileImageUrl || "https://placehold.co/80x80"}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{post.author.name}</p>
              <p className="text-sm">
                {format(new Date(post.createdAt), "MMMM dd, yyyy")} • {post.comments.length} Comments
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-12">
            {post.tags.map((t) => (
              <span
                key={t.tag.id}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {t.tag.name}
              </span>
            ))}
          </div>

          {/* Content with Markdown + Tailwind Prose */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Author Bio */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-6">
              <img
                src={post.author.profileImageUrl || "https://placehold.co/120x120"}
                alt={post.author.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {post.author.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  {post.author.bio || "Passionate developer sharing knowledge through detailed articles."}
                </p>
              </div>
            </div>
          </div>

          {/* Comments (simple) */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold mb-8">Comments ({post.comments.length})</h3>
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {comment.authorName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="font-medium">{comment.authorName || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}