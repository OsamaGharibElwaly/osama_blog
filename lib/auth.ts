// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../lib/db/client";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.author.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // مهم: رجع الـ role هنا
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role?.name?.toUpperCase() || "AUTHOR", // "ADMIN" أو "AUTHOR"
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role; // مهم جدًا
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id as string;
      session.user.role = token.role as string; // مهم جدًا
    }
    return session;
  },
},
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  useSecureCookies: false,
};

export default authOptions;