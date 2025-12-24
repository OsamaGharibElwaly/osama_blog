export default function AboutMe() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">About Me</h3>
      <div className="flex items-center gap-4">
        <img src="/placeholder-avatar.jpg" alt="Alex" className="w-16 h-16 rounded-full" />
        <p className="text-gray-600 dark:text-gray-400">
          Hi, I'm Alex. A full-stack developer and UI/UX enthusiast passionate about creating clean, functional, and beautiful web experiences.
        </p>
      </div>
    </div>
  );
}