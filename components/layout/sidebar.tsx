"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menus = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", href: "/employees", icon: Users },
  { title: "Attendance", href: "/attendance", icon: Clock3 },
  { title: "Leave requests", href: "/leaves", icon: CalendarDays },
  { title: "Salary advance", href: "/salary-advance", icon: Wallet },
  { title: "Payroll", href: "/payroll", icon: Receipt },
];

export function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
        <Sparkles className="size-5" />
      </span>
      <span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">PeopleCore</span>
        <span className="block text-lg font-bold leading-5">EMS</span>
      </span>
    </Link>
  );
}

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5">
      {menus.map(({ title, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className={cn("size-5 transition-transform group-hover:scale-105", active && "text-white")} />
            <span>{title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/80 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
      <Brand />
      <div className="my-7 h-px bg-border" />
      <Navigation />
      <div className="mt-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-lg shadow-indigo-500/15">
        <p className="text-sm font-semibold">People, simplified.</p>
        <p className="mt-1 text-xs leading-5 text-indigo-100">Keep attendance, leave and payroll beautifully organized.</p>
      </div>
    </aside>
  );
}
