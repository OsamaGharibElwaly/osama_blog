import Link from "next/link";

export default function LoginPrompt() {
  return (
    <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
      <p className="mb-3 text-center text-gray-700 dark:text-gray-300">Are you an admin or author?</p>
      <Link
        href="/login"
        className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        Click here to login
      </Link>
    </div>
  );
}