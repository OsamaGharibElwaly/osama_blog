// src/app/admin-panel/contact-messages/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/db/client";
import Link from "next/link";

export default async function ContactMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function updateMessageStatus(formData: FormData) {
    "use server";
    const messageId = Number(formData.get("messageId"));
    const status = formData.get("status") as "READ" | "ARCHIVED";

    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });

    redirect("/admin-panel/contact-message");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        {/* نفس الـ Sidebar */}
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
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 bg-blue-600 hover:bg-gray-700 rounded-lg">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg mt-8">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Contact Messages ({messages.length})</h1>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{msg.name} &lt;{msg.email}&gt;</h3>
                  <p className="text-sm text-gray-400">{msg.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  msg.status === "READ" ? "bg-blue-600" :
                  msg.status === "ARCHIVED" ? "bg-gray-600" :
                  "bg-orange-600"
                }`}>
                  {msg.status}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{msg.messageBody}</p>
              <div className="text-sm text-gray-500 mb-4">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
              <div className="flex gap-4">
                {msg.status === "NEW" && (
                  <form action={updateMessageStatus}>
                    <input type="hidden" name="messageId" value={msg.id} />
                    <input type="hidden" name="status" value="READ" />
                    <button type="submit" className="text-blue-400 hover:underline">Mark as Read</button>
                  </form>
                )}
                <form action={updateMessageStatus}>
                  <input type="hidden" name="messageId" value={msg.id} />
                  <input type="hidden" name="status" value="ARCHIVED" />
                  <button type="submit" className="text-gray-400 hover:underline">Archive</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}