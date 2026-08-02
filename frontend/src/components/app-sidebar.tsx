"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth-context";
import { WarehouseIcon, HomeIcon, PackageIcon, ListIcon, TruckIcon, InboxIcon, ShoppingCartIcon, BarChartIcon, UsersIcon } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <HomeIcon />, href: "/", label: "Bosh sahifa" },
  { icon: <PackageIcon />, href: "/products", label: "Mahsulotlar" },
  { icon: <ListIcon />, href: "/categories", label: "Kategoriyalar" },
  { icon: <TruckIcon />, href: "/suppliers", label: "Yetkazib beruvchilar", adminOnly: true },
  { icon: <InboxIcon />, href: "/stock-in", label: "Kirim", adminOnly: true },
  { icon: <WarehouseIcon />, href: "/inventory", label: "Ombor qoldig'i" },
  { icon: <ShoppingCartIcon />, href: "/sales", label: "Sotuvlar" },
  { icon: <BarChartIcon />, href: "/reports", label: "Hisobotlar", adminOnly: true },
  { icon: <UsersIcon />, href: "/users", label: "Foydalanuvchilar", adminOnly: true },
];

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black sm:block">
      <div className="mb-6 px-2">
        <p className="text-lg font-semibold">SalesApp</p>
        <p className="text-xs text-zinc-500">{user.fullName}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "ADMIN").map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
              )}
            ><div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
