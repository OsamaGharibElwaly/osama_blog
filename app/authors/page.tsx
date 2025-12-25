import Header from "@/components/layout/Header";
import prisma from "@/lib/db/client"; 
import Link from "next/link";

type PublicAuthor = {
  id: number;
  name: string;
  bio: string | null;
  profileImageUrl: string | null;
  role: {
    name: string;
  };
  _count: {
    posts: number;
  };
};

export default async function AuthorsPage() {
  const authors: PublicAuthor[] = await prisma.author.findMany({
    include: {
      role: true,
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold">Authors</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
              Choose an author to see their stats and social links.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {authors.length === 0 ? (
                <p className="text-center text-gray-400 py-20 text-2xl">
                  No authors yet.
                </p>
              ) : (
                authors.map((author: PublicAuthor) => (
                  <div key={author.id} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                    <div className="flex items-center gap-8">
                      <img
                        src={author.profileImageUrl || "https://placehold.co/200x200"}
                        alt={author.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
                      />
                      <div>
                        <h3 className="text-3xl font-bold">{author.name}</h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                          {author.role.name} • {author._count.posts} Posts
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">
                          {author.bio || "Passionate developer sharing knowledge."}
                        </p>
                        <Link href={`/authors/${author.id}`} className="mt-6 inline-block text-blue-600 hover:underline transition">
                          View Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <aside className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4">Become an Author</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your knowledge with the world.
                </p>
                <Link href="/contact" className="mt-4 inline-block text-blue-600 hover:underline transition">
                  Contact Us →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}