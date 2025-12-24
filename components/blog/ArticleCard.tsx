import Link from "next/link";

interface ArticleCardProps {
  type: "Article" | "News" | "Tutorial" | "Video";
  title: string;
  description: string;
  tags: string[];
  date: string;
  author: string;
  comments: number;
  slug: string;
  imageUrl: string;
}

export default function ArticleCard({
  type,
  title,
  description,
  tags,
  date,
  author,
  comments,
  slug,
  imageUrl,
}: ArticleCardProps) {
  const typeColors = {
    Article: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    News: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Tutorial: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Video: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeColors[type]}`}
        >
          {type}
        </span>
        <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          <Link href={`/posts/${slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {title}
          </Link>
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {author} · {date} · {comments} Comments
        </div>
        <Link
          href={`/posts/${slug}`}
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}