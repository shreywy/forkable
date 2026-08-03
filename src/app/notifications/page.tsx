"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, Star, GitFork, ChefHat, GitCommitHorizontal,
  Check, Filter, Inbox,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NotifType = "star" | "fork" | "taste-test" | "tweak" | "follow";
type Filter = "all" | "unread" | NotifType;

interface Notification {
  id: string;
  type: NotifType;
  text: string;
  subtext?: string;
  actor: { username: string; displayName: string; avatarUrl: string };
  link: string;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "star",
    text: "nonna_rosa starred your Tahini Chocolate Chip Cookies",
    actor: { username: "nonna_rosa", displayName: "Nonna Rosa", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=nonna_rosa" },
    link: "/shrey/tahini-chocolate-chip-cookies",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    type: "fork",
    text: "gluten_free_gary forked your Miso Banana Bread",
    subtext: "Created: Miso Banana Bread (GF)",
    actor: { username: "gluten_free_gary", displayName: "Gluten-Free Gary", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=gary" },
    link: "/shrey/miso-banana-bread",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    type: "taste-test",
    text: "vegan_vivienne left a taste test on your Greek Yogurt Pancakes",
    subtext: '"These are incredible — suggest adding lemon zest to brighten the flavour"',
    actor: { username: "vegan_vivienne", displayName: "Vivienne Plant", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivienne" },
    link: "/shrey/greek-yogurt-pancakes",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    type: "tweak",
    text: "kenji_tokyo tweaked your Tahini Chocolate Chip Cookies",
    subtext: "Reduced sugar by 20% and added sea salt flakes on top",
    actor: { username: "kenji_tokyo", displayName: "Kenji Tokyo", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji" },
    link: "/shrey/tahini-chocolate-chip-cookies",
    time: "1d ago",
    unread: false,
  },
  {
    id: "5",
    type: "star",
    text: "vegan_vivienne starred your Miso Banana Bread",
    actor: { username: "vegan_vivienne", displayName: "Vivienne Plant", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivienne" },
    link: "/shrey/miso-banana-bread",
    time: "2d ago",
    unread: false,
  },
  {
    id: "6",
    type: "follow",
    text: "kenji_tokyo started following you",
    actor: { username: "kenji_tokyo", displayName: "Kenji Tokyo", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji" },
    link: "/kenji_tokyo",
    time: "3d ago",
    unread: false,
  },
  {
    id: "7",
    type: "taste-test",
    text: "nonna_rosa suggested a change to your Miso Banana Bread",
    subtext: '"Try folding in toasted walnuts — they pair wonderfully with miso"',
    actor: { username: "nonna_rosa", displayName: "Nonna Rosa", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=nonna_rosa" },
    link: "/shrey/miso-banana-bread",
    time: "4d ago",
    unread: false,
  },
  {
    id: "8",
    type: "fork",
    text: "vegan_vivienne forked your Greek Yogurt Pancakes",
    subtext: "Created: Greek Yogurt Pancakes (Vegan)",
    actor: { username: "vegan_vivienne", displayName: "Vivienne Plant", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivienne" },
    link: "/shrey/greek-yogurt-pancakes",
    time: "5d ago",
    unread: false,
  },
  {
    id: "9",
    type: "star",
    text: "kenji_tokyo starred your Greek Yogurt Pancakes",
    actor: { username: "kenji_tokyo", displayName: "Kenji Tokyo", avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji" },
    link: "/shrey/greek-yogurt-pancakes",
    time: "1w ago",
    unread: false,
  },
];

const TYPE_ICONS: Record<NotifType, React.ReactNode> = {
  star:        <Star className="w-3.5 h-3.5 text-yellow-brand fill-yellow-brand/30" />,
  fork:        <GitFork className="w-3.5 h-3.5 text-blue-400" />,
  "taste-test": <ChefHat className="w-3.5 h-3.5 text-green-400" />,
  tweak:       <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground" />,
  follow:      <Bell className="w-3.5 h-3.5 text-yellow-brand" />,
};

const FILTER_OPTIONS: { id: Filter; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "unread",     label: "Unread" },
  { id: "star",       label: "Stars" },
  { id: "fork",       label: "Forks" },
  { id: "taste-test", label: "Taste Tests" },
  { id: "tweak",      label: "Tweaks" },
  { id: "follow",     label: "Follows" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.unread;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );

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
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link}
                onClick={() => markRead(notif.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-yellow-brand/50 ${
                  notif.unread
                    ? "border-yellow-brand/30 bg-yellow-subtle/50 dark:bg-yellow-muted/20"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                {/* Type icon */}
                <span className="shrink-0 mt-0.5">{TYPE_ICONS[notif.type]}</span>

                {/* Actor avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-[10px] bg-yellow-light">
                    {notif.actor.displayName[0]}
                  </AvatarFallback>
                  <AvatarFallback>
                    {notif.actor.displayName[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{notif.text}</p>
                  {notif.subtext && (
                    <p className="mt-1 text-xs text-muted-foreground italic line-clamp-1">
                      {notif.subtext}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">{notif.time}</p>
                </div>

                {/* Unread dot */}
                {notif.unread && (
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
