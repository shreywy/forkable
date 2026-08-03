"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

interface Props {
  username: string;
  isOwnProfile?: boolean;
}

export function FollowButton({ username, isOwnProfile }: Props) {
  const [following, setFollowing] = useState(false);

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

  return (
    <button
      onClick={() => setFollowing((f) => !f)}
      className={`mt-4 w-full h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
        following
          ? "border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 text-foreground"
          : "bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)]"
      }`}
      aria-label={following ? `Unfollow @${username}` : `Follow @${username}`}
    >
      {following ? (
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
  );
}
