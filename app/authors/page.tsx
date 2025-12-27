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

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Our Authors
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Meet the talented writers behind our content. Click on any author to explore their articles and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Authors List */}
            <div className="lg:col-span-2 space-y-10">
              {authors.length === 0 ? (
                <div className="text-center py-32">
                  <p className="text-3xl font-light text-gray-500 dark:text-gray-400">
                    No authors yet.
                  </p>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-500">
                    Check back soon for amazing content creators!
                  </p>
                </div>
              ) : (
                authors.map((author, index) => (
                  <div
                    key={author.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Author Image */}
                      <div className="relative group">
                        <img
                          src={author.profileImageUrl || "https://placehold.co/400x400"}
                          alt={author.name}
                          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-blue-500/20 dark:ring-blue-400/30 transition-all duration-500 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Author Info */}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                          {author.name}
                        </h3>

                        <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                          {author.role.name} • {author._count.posts}{" "}
                          {author._count.posts === 1 ? "Post" : "Posts"}
                        </p>

                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                          {author.bio || "Passionate writer sharing valuable insights and knowledge with the community."}
                        </p>

                        <Link
                          href={`/authors/${author.id}`}
                          className="inline-flex items-center gap-2 text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 group"
                        >
                          View Full Profile
                          <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 text-center">
                <h3 className="text-3xl font-bold mb-6">Want to Write for Us?</h3>
                <p className="text-lg leading-relaxed mb-8 opacity-95">
                  Join our team of authors and share your expertise with thousands of readers.
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Get in Touch →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-500 text-center">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Total Authors
                </h3>
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {authors.length}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}