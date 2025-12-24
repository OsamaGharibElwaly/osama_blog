import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";


type AdminComment = {
  id: number;
  content: string;
  authorName: string | null;
  authorEmail: string | null;
  status: string; 
  createdAt: Date;
  post: {
    id: number;
    title: string;
    slug: string;
  };
};

export default async function CommentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  
  const comments: AdminComment[] = await prisma.comment.findMany({
    include: { post: true },
    orderBy: { createdAt: "desc" },
  });

  async function updateCommentStatus(formData: FormData) {
    "use server";
    const commentId = Number(formData.get("commentId"));
    const status = formData.get("status") as "APPROVED" | "REJECTED" | "SPAM";

    if (isNaN(commentId)) return;

    await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });

    redirect("/admin-panel/comments");
  }

  async function deleteComment(formData: FormData) {
    "use server";
    const commentId = Number(formData.get("commentId"));

    if (isNaN(commentId)) return;

    await prisma.comment.delete({ where: { id: commentId } });
    redirect("/admin-panel/comments");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar الموحد */}
      <aside className="w-64 bg-gray-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
            A
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/admin-panel" className="block py-3 px-4 font-medium rounded-lg">
            Dashboard
          </Link>
          <Link href="/admin-panel/posts" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Posts
          </Link>
          <Link href="/admin-panel/posts/new" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            + New Post
          </Link>
          <Link href="/admin-panel/authors" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Authors
          </Link>
          <Link href="/admin-panel/category" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Categories
          </Link>
          <Link href="/admin-panel/tags" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Tags
          </Link>
          <Link href="/admin-panel/comments" className="block py-3 px-4 bg-blue-600 rounded-lg">
            Comments
          </Link>
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg mt-8">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Comments Management ({comments.length})</h1>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          {comments.length === 0 ? (
            <p className="p-10 text-center text-gray-400">No comments yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium">Comment</th>
                  <th className="text-left p-4 font-medium">Author</th>
                  <th className="text-left p-4 font-medium">Post</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-4 max-w-xs truncate" title={comment.content}>
                      {comment.content}
                    </td>
                    <td className="p-4">{comment.authorName || "Anonymous"}</td>
                    <td className="p-4">
                      <Link href={`/posts/${comment.post.slug}`} className="text-blue-400 hover:underline">
                        {comment.post.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          comment.status === "APPROVED"
                            ? "bg-green-600"
                            : comment.status === "REJECTED"
                            ? "bg-red-600"
                            : comment.status === "SPAM"
                            ? "bg-purple-600"
                            : "bg-orange-600"
                        }`}
                      >
                        {comment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-3">
                        {comment.status === "PENDING" && (
                          <>
                            <form action={updateCommentStatus} className="inline">
                              <input type="hidden" name="commentId" value={comment.id} />
                              <input type="hidden" name="status" value="APPROVED" />
                              <button type="submit" className="text-green-400 hover:underline">
                                Approve
                              </button>
                            </form>
                            <form action={updateCommentStatus} className="inline">
                              <input type="hidden" name="commentId" value={comment.id} />
                              <input type="hidden" name="status" value="REJECTED" />
                              <button type="submit" className="text-red-400 hover:underline">
                                Reject
                              </button>
                            </form>
                          </>
                        )}
                        <form action={deleteComment} className="inline">
                          <input type="hidden" name="commentId" value={comment.id} />
                          <button
                            type="submit"
                            className="text-red-400 hover:underline"
                            onClick={(e) => {
                              if (!confirm("Are you sure you want to delete this comment?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
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