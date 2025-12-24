import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechStream - Modern Tech Blog",
  description: "A modern tech blog covering web development, design, and technology trends",
  keywords: [
    "tech blog",
    "web development",
    "Next.js",
    "React",
    "JavaScript",
    "TypeScript",
    "frontend",
    "backend",
    "technology trends",
    "programming",
  ],
  authors: [{name: "Osama Alwaly"}],
  creator: "Osama Alwaly",
  icons: {
    icon: "/icon.png", 
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}