"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">
        {isSigningOut ? "Signing out..." : "Sign Out"}
      </span>
    </button>
  );
}
