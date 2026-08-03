import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GitFork, Star, Users, BookOpen,
  Link as LinkIcon, MapPin, Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MOCK_USERS, MOCK_RECIPES, MOCK_COOKBOOKS } from "@/lib/mock-data";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { FollowButton } from "@/components/profile/FollowButton";

// The logged-in user is always "shrey" in Phase 1
const CURRENT_USER = "shrey";

// ── Extended mock profile data (replaces DB in Phase 2) ──────────────────────
// bannerBg: inline style so gradients render the same in light + dark
// (Tailwind's `from-green-*` etc. don't respond to the .dark class reliably here)
const PROFILE_META: Record<string, {
  location?: string;
  joinedYear: number;
  website?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  pinnedRecipeSlugs: string[];
  bannerBg: string;
}> = {
  shrey: {
    location: "San Francisco, CA",
    joinedYear: 2026,
    website: "https://shreyj.com",
    github: "shreyj",
    twitter: "shreyj",
    instagram: "shreyj",
    pinnedRecipeSlugs: ["tahini-chocolate-chip-cookies", "miso-banana-bread"],
    bannerBg: "linear-gradient(135deg, oklch(0.83 0.17 88 / 40%), oklch(0.83 0.17 88 / 8%))",
  },
  nonna_rosa: {
    location: "Naples, Italy",
    joinedYear: 2025,
    instagram: "nonna_rosa_cucina",
    pinnedRecipeSlugs: ["moms-lasagna"],
    bannerBg: "linear-gradient(135deg, oklch(0.70 0.15 50 / 40%), oklch(0.70 0.15 50 / 8%))",
  },
  vegan_vivienne: {
    location: "Portland, OR",
    joinedYear: 2025,
    twitter: "vivienneplant",
    instagram: "vivienneplant",
    pinnedRecipeSlugs: ["green-goddess-pasta", "smoky-black-bean-tacos", "thai-green-curry"],
    bannerBg: "linear-gradient(135deg, oklch(0.65 0.15 145 / 35%), oklch(0.65 0.15 145 / 6%))",
  },
  gluten_free_gary: {
    location: "Austin, TX",
    joinedYear: 2026,
    github: "gfgary",
    pinnedRecipeSlugs: ["moms-lasagna-gf"],
    bannerBg: "linear-gradient(135deg, oklch(0.60 0.12 240 / 35%), oklch(0.60 0.12 240 / 6%))",
  },
  kenji_tokyo: {
    location: "London, UK",
    joinedYear: 2026,
    twitter: "kenjitokyo",
    instagram: "kenji.ramen",
    website: "https://kenjitokyo.com",
    pinnedRecipeSlugs: ["tonkotsu-ramen"],
    bannerBg: "linear-gradient(135deg, oklch(0.65 0.20 25 / 35%), oklch(0.65 0.20 25 / 6%))",
  },
};

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = MOCK_USERS[username];
  if (!user) notFound();

  const meta = PROFILE_META[username] ?? {
    joinedYear: 2026,
    pinnedRecipeSlugs: [],
    bannerBg: "linear-gradient(135deg, oklch(0.83 0.17 88 / 25%), oklch(0.83 0.17 88 / 5%))",
  };

  const userRecipes = MOCK_RECIPES.filter((r) => r.owner.username === username);
  const forkedRecipes = MOCK_RECIPES.filter(
    (r) => r.owner.username === username && r.forkedFrom,
  );
  const userCookbooks = MOCK_COOKBOOKS.filter((c) => c.owner === username);
  const pinnedRecipes = meta.pinnedRecipeSlugs
    .map((slug) => MOCK_RECIPES.find((r) => r.slug === slug && r.owner.username === username))
    .filter(Boolean) as typeof MOCK_RECIPES;

  // Starred: recipes by other users (mock — first 4 not owned by this user)
  const starredRecipes = MOCK_RECIPES.filter((r) => r.owner.username !== username).slice(0, 4);

  // Cover images for cookbooks (keyed by cookbook id)
  const coverRecipes = Object.fromEntries(
    userCookbooks.map((cb) => [cb.id, MOCK_RECIPES.find((r) => cb.recipeIds.includes(r.id))]),
  );

  const totalStars = userRecipes.reduce((sum, r) => sum + r.stars, 0);

  const socials = [
    meta.github    && { href: `https://github.com/${meta.github}`,       icon: "GH",  label: meta.github },
    meta.twitter   && { href: `https://twitter.com/${meta.twitter}`,     icon: "𝕏",   label: `@${meta.twitter}` },
    meta.instagram && { href: `https://instagram.com/${meta.instagram}`, icon: "IG",  label: `@${meta.instagram}` },
    meta.website   && { href: meta.website, icon: <LinkIcon className="w-3.5 h-3.5" />, label: meta.website.replace(/^https?:\/\//, "") },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="h-32 border-b border-border" style={{ background: meta.bannerBg }} />

      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ───────────────────────────────────────────────────────── */}
          <aside className="lg:w-64 shrink-0">
            {/* Avatar overlaps banner */}
            <div className="-mt-14 mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback className="text-2xl font-bold bg-yellow-light">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">{user.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
            )}

            <FollowButton
              username={username}
              isOwnProfile={username === CURRENT_USER}
            />

            <Separator className="my-4" />

            {/* Meta info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {meta.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{meta.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Joined {meta.joinedYear}</span>
              </div>
            </div>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="mt-3 space-y-2">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-brand transition-colors"
                  >
                    {s.icon}
                    <span className="truncate">{s.label}</span>
                  </a>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Stats */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{user.recipeCount}</span> recipes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GitFork className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{user.forkCount}</span> forks</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  <Link href={`/${username}/followers`} className="font-semibold text-foreground hover:text-yellow-brand transition-colors">
                    {user.followers}
                  </Link>{" "}
                  followers
                  {" · "}
                  <Link href={`/${username}/following`} className="font-semibold text-foreground hover:text-yellow-brand transition-colors">
                    12
                  </Link>{" "}
                  following
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{totalStars.toLocaleString()}</span> stars earned</span>
              </div>
            </div>
          </aside>

          {/* ── Main ──────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pt-4 pb-14">
            {/* Pinned recipes */}
            {pinnedRecipes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Pinned
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pinnedRecipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href={`/${recipe.owner.username}/${recipe.slug}`}
                      className="flex gap-3 p-3 rounded-xl border border-border bg-card hover:border-yellow-brand hover:bg-yellow-subtle dark:hover:bg-muted transition-all"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{recipe.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{recipe.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" />{recipe.stars.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{recipe.forks}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <ProfileTabs
              username={username}
              userRecipes={userRecipes}
              forkedRecipes={forkedRecipes}
              userCookbooks={userCookbooks}
              starredRecipes={starredRecipes}
              coverRecipes={coverRecipes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
