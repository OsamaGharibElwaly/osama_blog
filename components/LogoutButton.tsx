"use client"; // مهم جدًا هنا عشان يبقى Client Component

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-left py-3 px-4 hover:bg-red-900/30 rounded-lg text-red-400 font-medium transition"
    >
      Logout
    </button>
  );
}