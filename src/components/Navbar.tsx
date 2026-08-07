"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search, GitFork, Plus, ChevronDown, ShoppingCart, Rss,
} from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { SHOPPING_LIST_KEY } from "@/lib/shopping-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useSession, signOut } from "next-auth/react";

function ShoppingListLink() {
  const [listRaw] = useLocalStorage(SHOPPING_LIST_KEY);
  let count = 0;
  try {
    count = listRaw ? (JSON.parse(listRaw) as unknown[]).length : 0;
  } catch {
    count = 0;
  }

  return (
    <Link
      href="/shopping-list"
      aria-label={`Shopping list (${count} recipes)`}
      className="relative p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-yellow-subtle transition-colors"
    >
      <ShoppingCart className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const user = session?.user;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background nav-shadow transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-brand text-white font-bold text-sm shadow-sm group-hover:bg-yellow-hover transition-colors">
            <GitFork className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="font-bold text-[15px] tracking-tight text-foreground">
            Forkable
          </span>
        </Link>

        {/* ── Search ────────────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full h-8 pl-8 pr-12 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-yellow-brand focus:border-yellow-brand placeholder:text-muted-foreground transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5 pointer-events-none">
            Ctrl K
          </kbd>
        </form>
        <CommandPalette />

        {/* ── Nav links ─────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/feed"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-yellow-subtle rounded-md transition-colors"
          >
            <Rss className="w-3.5 h-3.5" />
            Feed
          </Link>
          <Link
            href="/explore"
            className="px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-yellow-subtle rounded-md transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/trending"
            className="px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-yellow-subtle rounded-md transition-colors"
          >
            Trending
          </Link>
        </nav>

        {/* ── Right side ────────────────────────────────────────── */}
        <div className="ml-auto flex items-center gap-2">
          <ShoppingListLink />
          {/* Logged-out state */}
          {!isLoggedIn && (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="px-3 h-8 flex items-center text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-yellow-subtle rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-3 h-8 flex items-center text-sm font-semibold rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}

          {isLoggedIn && (
          <>{/* New recipe dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 gap-1.5 px-3 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] font-medium text-sm transition-colors shadow-none border-0 outline-none focus-visible:ring-2 focus-visible:ring-yellow-brand focus-visible:ring-offset-2">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">New</span>
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push("/new")}>
                New recipe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/import")}>
                Import recipe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/cookbooks/new")}>
                New cookbook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Dark / light toggle */}
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-yellow-brand focus-visible:ring-offset-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-yellow-light text-xs font-medium">
                  {user?.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">@{user?.username}</p>
              </div>
              <DropdownMenuSeparator />
              {user?.username && (
                <DropdownMenuItem onClick={() => router.push(`/${user.username}`)}>
                  Your profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>)}
        </div>
      </div>
    </header>
  );
}
