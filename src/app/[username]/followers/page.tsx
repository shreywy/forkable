import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Star, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ username: string }>;
}

// Mock follower data — in Phase 2 these come from the DB
const MOCK_FOLLOWERS: Record<string, string[]> = {
  shrey:          ["nonna_rosa", "vegan_vivienne", "gluten_free_gary"],
  nonna_rosa:     ["shrey", "vegan_vivienne", "gluten_free_gary", "kenji_tokyo"],
  vegan_vivienne: ["shrey", "nonna_rosa", "kenji_tokyo"],
  gluten_free_gary: ["nonna_rosa", "kenji_tokyo"],
  kenji_tokyo:    ["shrey", "nonna_rosa", "vegan_vivienne"],
};

export default async function FollowersPage({ params }: Props) {
  const { username } = await params;
  const user = MOCK_USERS[username];
  if (!user) notFound();

  const followerUsernames = MOCK_FOLLOWERS[username] ?? [];
  const followers = followerUsernames
    .map((u) => MOCK_USERS[u])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[640px] mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to @{username}
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-brand" />
            <h1 className="text-xl font-bold text-foreground">
              Followers of @{username}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {followers.length} people follow this cook.
          </p>
        </div>

        {/* List */}
        <div className="space-y-3">
          {followers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No followers yet.</p>
            </div>
          ) : (
            followers.map((follower) => (
              <Link
                key={follower.username}
                href={`/${follower.username}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand transition-all group"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={follower.avatarUrl} alt={follower.displayName} />
                  <AvatarFallback className="bg-yellow-light text-sm font-bold">
                    {follower.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors">
                    {follower.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">@{follower.username}</p>
                  {follower.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{follower.bio}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {follower.recipeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {follower.followers}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
