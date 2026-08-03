"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search, GitFork, Bell, Plus, ChevronDown,
  Star, ChefHat, GitCommitHorizontal, Rss,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession, signOut } from "next-auth/react";

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    icon: <Star className="w-3.5 h-3.5 text-yellow-brand" />,
    text: "nonna_rosa starred your Tahini Cookies",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    icon: <GitFork className="w-3.5 h-3.5 text-muted-foreground" />,
    text: "gluten_free_gary forked your Miso Banana Bread",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    icon: <ChefHat className="w-3.5 h-3.5 text-muted-foreground" />,
    text: "vegan_vivienne left a taste test on your Greek Yogurt Pancakes",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    icon: <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground" />,
    text: "kenji_tokyo tweaked your recipe",
    time: "1d ago",
    unread: false,
  },
];

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

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

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
            className="w-full h-8 pl-8 pr-3 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-yellow-brand focus:border-yellow-brand placeholder:text-muted-foreground transition-all"
          />
        </form>

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
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-yellow-subtle dark:hover:bg-yellow-muted transition-colors outline-none">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-[9px] font-bold">
                  {unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <button className="text-xs text-yellow-brand hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${n.unread ? "bg-yellow-subtle/50 dark:bg-yellow-muted/20" : ""}`}
                  >
                    <span className="shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && (
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-brand mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button
                  onClick={() => router.push("/notifications")}
                  className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <DropdownMenuItem onClick={() => router.push(`/${user?.username}`)}>
                Your profile
              </DropdownMenuItem>
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
