// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (session) {
    // استخدم الـ built-in signout route لتدمير الجلسة
    return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/", process.env.NEXTAUTH_URL || "http://localhost:3001"));
  }
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3001"));
}