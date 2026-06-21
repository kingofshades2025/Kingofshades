"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/admin";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-snow/70 transition-colors hover:bg-white/5 hover:text-red-400"
    >
      <LogOut className="h-[18px] w-[18px]" />
      Sign out
    </button>
  );
}
