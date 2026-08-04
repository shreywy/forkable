"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface Props {
  username: string;
  isOwnProfile?: boolean;
  initialIsFollowing?: boolean;
  initialFollowerCount?: number;
}

export function FollowButton({ username, isOwnProfile, initialIsFollowing = false, initialFollowerCount }: Props) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) {
    return (
      <a
        href="/settings"
        className="mt-4 w-full h-8 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium transition-colors flex items-center justify-center"
      >
        Edit profile
      </a>
    );
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const action = following ? "unfollow" : "follow";
    const prevFollowing = following;
    const prevCount = followerCount;
    // Optimistic update
    setFollowing(!following);
    if (followerCount !== undefined) {
      setFollowerCount(followerCount + (following ? -1 : 1));
    }
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername: username, action }),
      });
      const data = await res.json() as { success?: boolean; followerCount?: number };
      if (!data.success) {
        setFollowing(prevFollowing);
        setFollowerCount(prevCount);
      } else if (typeof data.followerCount === "number") {
        setFollowerCount(data.followerCount);
      }
    } catch {
      setFollowing(prevFollowing);
      setFollowerCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${
          following
            ? "border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 text-foreground"
            : "bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)]"
        }`}
        aria-label={following ? `Unfollow @${username}` : `Follow @${username}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : following ? (
          <>
            <UserCheck className="w-3.5 h-3.5" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" />
            Follow
          </>
        )}
      </button>
      {followerCount !== undefined && (
        <p className="text-center text-[11px] text-muted-foreground">
          {followerCount.toLocaleString()} {followerCount === 1 ? "follower" : "followers"}
        </p>
      )}
    </div>
  );
}
