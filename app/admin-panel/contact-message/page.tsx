import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/client"; 
import Link from "next/link";


type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  messageBody: string;
  status: string; 
  createdAt: Date;
};

export default async function ContactMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");


  const messages: AdminContactMessage[] = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function updateMessageStatus(formData: FormData) {
    "use server";
    const messageId = Number(formData.get("messageId"));
    const status = formData.get("status") as "READ" | "ARCHIVED";

    if (isNaN(messageId)) return;

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
          <Link href="/admin-panel/comments" className="block py-3 px-4 hover:bg-gray-700 rounded-lg">
            Comments
          </Link>
          <Link href="/admin-panel/contact-message" className="block py-3 px-4 bg-blue-600 rounded-lg">
            Contact Messages
          </Link>
          <Link href="/admin-panel/settings" className="block py-3 px-4 hover:bg-gray-700 rounded-lg mt-8">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Contact Messages ({messages.length})</h1>

        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-xl">No contact messages yet.</p>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {msg.name} &lt;<span className="text-blue-400">{msg.email}</span>&gt;
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{msg.subject}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      msg.status === "READ"
                        ? "bg-blue-600"
                        : msg.status === "ARCHIVED"
                        ? "bg-gray-600"
                        : "bg-orange-600"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{msg.messageBody}</p>
                <div className="text-sm text-gray-500 mb-4">
                  {new Date(msg.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </div>
                <div className="flex gap-6">
                  {msg.status === "NEW" && (
                    <form action={updateMessageStatus} className="inline">
                      <input type="hidden" name="messageId" value={msg.id} />
                      <input type="hidden" name="status" value="READ" />
                      <button type="submit" className="text-blue-400 hover:underline">
                        Mark as Read
                      </button>
                    </form>
                  )}
                  <form action={updateMessageStatus} className="inline">
                    <input type="hidden" name="messageId" value={msg.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button type="submit" className="text-gray-400 hover:underline">
                      Archive
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}