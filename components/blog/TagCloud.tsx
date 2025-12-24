import Link from "next/link";

export default function TagCloud() {
  const tags = ["Design", "Tutorial", "Web", "Frontend", "Trends", "JavaScript"];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Tag Cloud</h3>
      <div className="grid grid-cols-3 gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${tag.toLowerCase()}`}
            className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}