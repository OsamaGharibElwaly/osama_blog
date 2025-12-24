interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center space-x-2 pt-8">
      <button
        disabled={currentPage === 1}
        className="h-10 w-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        ←
      </button>
      {pages.map((page, index) => (
        <button
          key={index}
          disabled={typeof page === "string"}
          className={`h-10 w-10 rounded-lg ${
            typeof page === "number" && page === currentPage
              ? "bg-blue-600 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          } ${typeof page === "string" ? "cursor-default" : ""}`}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        className="h-10 w-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        →
      </button>
    </div>
  );
}