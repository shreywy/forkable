import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Star, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_USERS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ username: string }>;
}

// Mock following data — in Phase 2 these come from the DB
const MOCK_FOLLOWING: Record<string, string[]> = {
  shrey:            ["nonna_rosa", "vegan_vivienne", "kenji_tokyo"],
  nonna_rosa:       ["shrey", "vegan_vivienne"],
  vegan_vivienne:   ["nonna_rosa", "kenji_tokyo", "shrey"],
  gluten_free_gary: ["nonna_rosa", "shrey"],
  kenji_tokyo:      ["nonna_rosa", "vegan_vivienne"],
};

export default async function FollowingPage({ params }: Props) {
  const { username } = await params;
  const user = MOCK_USERS[username];
  if (!user) notFound();

  const followingUsernames = MOCK_FOLLOWING[username] ?? [];
  const following = followingUsernames
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
              @{username} is following
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {following.length} cooks this person follows.
          </p>
        </div>

        {/* List */}
        <div className="space-y-3">
          {following.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Not following anyone yet.</p>
            </div>
          ) : (
            following.map((cook) => (
              <Link
                key={cook.username}
                href={`/${cook.username}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand transition-all group"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={cook.avatarUrl} alt={cook.displayName} />
                  <AvatarFallback className="bg-yellow-light text-sm font-bold">
                    {cook.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors">
                    {cook.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">@{cook.username}</p>
                  {cook.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cook.bio}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {cook.recipeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {cook.followers}
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
