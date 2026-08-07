"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Star, GitFork, ChefHat, GitMerge, X, UserPlus, AtSign, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationType =
  | "NEW_STAR"
  | "NEW_FORK"
  | "NEW_FOLLOWER"
  | "NEW_TASTE_TEST"
  | "SUGGESTION_MERGED"
  | "SUGGESTION_CLOSED"
  | "MENTION";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: { username: string; displayName: string; avatarUrl: string | null } | null;
  href: string;
  text: string;
};

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  NEW_STAR: <Star className="w-3.5 h-3.5 text-yellow-brand" />,
  NEW_FORK: <GitFork className="w-3.5 h-3.5 text-muted-foreground" />,
  NEW_FOLLOWER: <UserPlus className="w-3.5 h-3.5 text-yellow-brand" />,
  NEW_TASTE_TEST: <ChefHat className="w-3.5 h-3.5 text-muted-foreground" />,
  SUGGESTION_MERGED: <GitMerge className="w-3.5 h-3.5 text-green-500" />,
  SUGGESTION_CLOSED: <X className="w-3.5 h-3.5 text-muted-foreground" />,
  MENTION: <AtSign className="w-3.5 h-3.5 text-muted-foreground" />,
};

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function NotificationsDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/notifications?limit=8")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { notifications: NotificationItem[]; unreadCount: number } | null) => {
        if (data) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const markAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const { markAllNotificationsRead } = await import("@/lib/actions/notifications");
    markAllNotificationsRead().catch(() => {});
  };

  const handleClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      const { markNotificationsRead } = await import("@/lib/actions/notifications");
      markNotificationsRead([notif.id]).catch(() => {});
    }
    router.push(notif.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-yellow-subtle dark:hover:bg-yellow-muted transition-colors outline-none">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-[9px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-yellow-brand hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {loaded && notifications.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Inbox className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet.</p>
            </div>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                !n.read ? "bg-yellow-subtle/50 dark:bg-yellow-muted/20" : ""
              }`}
            >
              <span className="shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-brand mt-1.5" />
              )}
            </button>
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
  );
}
