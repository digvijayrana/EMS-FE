"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Brand, Navigation } from "./sidebar";

type StoredUser = { firstName?: string; lastName?: string; email?: string; role?: string };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const storedUser = useSyncExternalStore(
    () => () => undefined,
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

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin User";
  const initials = name.split(" ").map((item) => item[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[290px] p-5">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
            <div className="my-7 h-px bg-border" />
            <Navigation onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div>
          <p className="text-sm font-semibold sm:text-base">Employee workspace</p>
          <p className="hidden text-xs text-muted-foreground sm:block">Everything your people team needs</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </Button>
        <div className="ml-1 hidden items-center gap-3 border-l pl-4 sm:flex">
          <div className="text-right">
            <p className="max-w-36 truncate text-sm font-semibold">{name}</p>
            <p className="text-xs capitalize text-muted-foreground">{user.role?.toLowerCase().replace("_", " ") || "Administrator"}</p>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            {initials}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
