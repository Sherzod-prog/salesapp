"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1">
      <AppSidebar user={user} />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            {user.email} · {user.role}
          </p>
          <Button variant="outline" size="sm" onClick={logout}>
            Chiqish
          </Button>
        </header>
        <main className="flex-1 bg-zinc-50 p-6 dark:bg-black">{children}</main>
      </div>
    </div>
  );
}
