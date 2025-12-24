"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; 

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession(); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              TechStream | Osama Alwaly
            </Link>
          </div>

          {/* Navigation - Middle */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Home", "Category", "Authors", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                {item}
              </Link>
            ))}
          </nav>

          
        </div>

        {/* Separator Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800" />
      </div>
    </header>
  );
}