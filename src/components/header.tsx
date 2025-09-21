"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleAuthButtonClick = () => {
    if (session) {
      signOut({ callbackUrl: "/" });
    } else {
      router.push("/admin/login");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAuthButtonClick}
          disabled={status === "loading"}
        >
          {status === "loading" ? "..." : session ? "Sign Out" : "Admin"}
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
