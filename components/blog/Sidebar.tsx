import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const tags = [
    { name: "Design", slug: "design" },
    { name: "Tutorial", slug: "tutorial" },
    { name: "Web", slug: "web" },
    { name: "Frontend", slug: "frontend" },
    { name: "Trends", slug: "trends" },
    { name: "JavaScript", slug: "javascript" },
  ];

  return (
    <aside className={className}>
      {/* About Me */}
      <div className="rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          About Me
        </h3>
        <div className="mb-4">
          <div className="mb-3 h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <p className="text-gray-600 dark:text-gray-400">
            Hi, I'm Alex. A full-stack developer and UI/UX enthusiast passionate about creating clean, functional, and beautiful web experiences.
          </p>
        </div>
      </div>

      {/* Follow Me */}
      <div className="mt-6 rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Follow Me
        </h3>
        <div className="flex gap-4">
          {[
            { icon: Twitter, href: "#", label: "Twitter" },
            { icon: Linkedin, href: "#", label: "LinkedIn" },
            { icon: Github, href: "#", label: "GitHub" },
            { icon: Mail, href: "#", label: "Email" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
              aria-label={social.label}
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="mt-6 rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Tag Cloud
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="rounded-full border px-3 py-1 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Admin/Author Login */}
      <div className="mt-6 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="mb-3 text-center text-gray-700 dark:text-gray-300">
          Are you an admin or author?
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Click here to login
        </Link>
      </div>
    </aside>
  );
}