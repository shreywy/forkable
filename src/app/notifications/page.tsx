"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, Star, GitFork, ChefHat, GitMerge, X, UserPlus, AtSign,
  Check, Filter, Inbox, Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeAgo, type NotificationItem, type NotificationType } from "@/components/NotificationsDropdown";

type FilterId = "all" | "unread" | NotificationType;

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  NEW_STAR: <Star className="w-3.5 h-3.5 text-yellow-brand fill-yellow-brand/30" />,
  NEW_FORK: <GitFork className="w-3.5 h-3.5 text-blue-400" />,
  NEW_FOLLOWER: <UserPlus className="w-3.5 h-3.5 text-yellow-brand" />,
  NEW_TASTE_TEST: <ChefHat className="w-3.5 h-3.5 text-green-400" />,
  SUGGESTION_MERGED: <GitMerge className="w-3.5 h-3.5 text-green-500" />,
  SUGGESTION_CLOSED: <X className="w-3.5 h-3.5 text-muted-foreground" />,
  MENTION: <AtSign className="w-3.5 h-3.5 text-muted-foreground" />,
};

const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
  { id: "all",               label: "All" },
  { id: "unread",            label: "Unread" },
  { id: "NEW_STAR",          label: "Stars" },
  { id: "NEW_FORK",          label: "Forks" },
  { id: "NEW_TASTE_TEST",    label: "Taste Tests" },
  { id: "SUGGESTION_MERGED", label: "Merges" },
  { id: "NEW_FOLLOWER",      label: "Follows" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  useEffect(() => {
    fetch("/api/notifications?limit=50")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { notifications: NotificationItem[] } | null) => {
        if (data) setNotifications(data.notifications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const { markAllNotificationsRead } = await import("@/lib/actions/notifications");
    markAllNotificationsRead().catch(() => {});
  };

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const { markNotificationsRead } = await import("@/lib/actions/notifications");
    markNotificationsRead([id]).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[720px] mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-brand" />
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeFilter === f.id
                  ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-6 h-6 text-yellow-brand animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => (
              <Link
                key={notif.id}
                href={notif.href}
                onClick={() => markRead(notif.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-yellow-brand/50 ${
                  !notif.read
                    ? "border-yellow-brand/30 bg-yellow-subtle/50 dark:bg-yellow-muted/20"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                {/* Type icon */}
                <span className="shrink-0 mt-0.5">{TYPE_ICONS[notif.type]}</span>

                {/* Actor avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={notif.actor?.avatarUrl ?? undefined} alt={notif.actor?.displayName} />
                  <AvatarFallback className="text-[10px] bg-yellow-light">
                    {(notif.actor?.displayName ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{notif.text}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-yellow-brand mt-1.5" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
