import { Twitter, Linkedin, Instagram, Globe } from "lucide-react";

export default function FollowMe() {
  const socialLinks = [
    { icon: Twitter, href: "#", label: "X" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Globe, href: "#", label: "Website" },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Follow Me</h3>
      <div className="flex gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            aria-label={social.label}
          >
            <social.icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  );
}