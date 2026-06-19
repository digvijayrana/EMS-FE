"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Bell, CalendarClock, LogOut, Menu, Moon, Settings, Sun, UserRound, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getLeaves } from "@/services/leave.service";
import { getSalaryAdvances } from "@/services/salary-advance.service";
import { Brand, Navigation } from "./sidebar";

type StoredUser = { firstName?: string; lastName?: string; email?: string; role?: string };

function subscribeToUser(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("user-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-updated", callback);
  };
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pendingLeaves = useQuery({ queryKey: ["navbar", "pending-leaves"], queryFn: () => getLeaves({ status: "PENDING", limit: 5 }), refetchInterval: 60_000 });
  const pendingAdvances = useQuery({ queryKey: ["navbar", "pending-advances"], queryFn: () => getSalaryAdvances({ status: "PENDING", limit: 5 }), refetchInterval: 60_000 });

  const storedUser = useSyncExternalStore(
    subscribeToUser,
    () => localStorage.getItem("user") || "{}",
    () => "{}",
  );
  const user = useMemo<StoredUser>(() => {
    try {
      return JSON.parse(storedUser);
    } catch {
      return {};
    }
  }, [storedUser]);

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const leaveCount = pendingLeaves.data?.data?.total || 0;
  const advanceCount = pendingAdvances.data?.data?.total || 0;
  const notificationCount = leaveCount + advanceCount;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin User";
  const initials = name.split(" ").map((item) => item[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden"><Menu /><span className="sr-only">Open menu</span></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[290px] p-5">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand /><div className="my-7 h-px bg-border" /><Navigation onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div><p className="text-sm font-semibold sm:text-base">Employee workspace</p><p className="hidden text-xs text-muted-foreground sm:block">Everything your people team needs</p></div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}>
              <Bell />
              {notificationCount > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">{notificationCount > 9 ? "9+" : notificationCount}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-2 text-sm font-semibold text-foreground"><span>Notifications</span><span className="text-xs font-normal text-muted-foreground">{notificationCount} pending</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationCount === 0 ? <div className="px-3 py-8 text-center"><Bell className="mx-auto mb-2 size-6 text-muted-foreground/60" /><p className="text-sm font-medium">You&apos;re all caught up</p><p className="mt-1 text-xs text-muted-foreground">No requests need your attention.</p></div> : <>
              {leaveCount > 0 && <DropdownMenuItem asChild className="cursor-pointer p-3"><Link href="/leaves"><span className="grid size-9 place-items-center rounded-lg bg-amber-500/10 text-amber-600"><CalendarClock /></span><span><span className="block font-medium">{leaveCount} leave request{leaveCount === 1 ? "" : "s"}</span><span className="text-xs text-muted-foreground">Waiting for review</span></span></Link></DropdownMenuItem>}
              {advanceCount > 0 && <DropdownMenuItem asChild className="cursor-pointer p-3"><Link href="/salary-advance"><span className="grid size-9 place-items-center rounded-lg bg-violet-500/10 text-violet-600"><Wallet /></span><span><span className="block font-medium">{advanceCount} salary advance{advanceCount === 1 ? "" : "s"}</span><span className="text-xs text-muted-foreground">Waiting for approval</span></span></Link></DropdownMenuItem>}
            </>}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-3 rounded-xl border-l pl-3 outline-none transition hover:opacity-80 sm:pl-4">
              <div className="hidden text-right sm:block"><p className="max-w-36 truncate text-sm font-semibold">{name}</p><p className="text-xs capitalize text-muted-foreground">{user.role?.toLowerCase().replace("_", " ") || "Administrator"}</p></div>
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">{initials}</div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="px-2 py-2"><span className="block text-sm font-semibold text-foreground">{name}</span><span className="block truncate text-xs font-normal">{user.email || "Signed-in user"}</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer"><Link href="/profile"><UserRound /> My profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer"><Link href="/profile"><Settings /> Account settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout} className="cursor-pointer"><LogOut /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
