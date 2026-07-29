"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-zinc-500">
          Bu sahifa faqat administrator uchun mavjud.
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
