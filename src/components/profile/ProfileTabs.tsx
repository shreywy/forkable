"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star, GitFork, Users, BookOpen, Library, BookMarked,
} from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import type { MockRecipe, MockCookbook } from "@/lib/mock-data";

type Tab = "recipes" | "cookbooks" | "forks" | "starred";

interface Props {
  username: string;
  userRecipes: MockRecipe[];
  forkedRecipes: MockRecipe[];
  userCookbooks: MockCookbook[];
  starredRecipes: MockRecipe[];
  coverRecipes: Record<string, MockRecipe | undefined>;
}

export function ProfileTabs({
  username,
  userRecipes,
  forkedRecipes,
  userCookbooks,
  starredRecipes,
  coverRecipes,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("recipes");

  const tabs = [
    { id: "recipes"   as Tab, label: "Recipes",   count: userRecipes.length },
    { id: "cookbooks" as Tab, label: "Cookbooks",  count: userCookbooks.length },
    { id: "forks"     as Tab, label: "Forks",      count: forkedRecipes.length },
    { id: "starred"   as Tab, label: "Starred",    count: starredRecipes.length },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-yellow-brand text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="px-1.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Recipes tab ─────────────────────────────────────────────────────── */}
      {activeTab === "recipes" && (
        <>
          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<BookOpen className="w-10 h-10" />} message="No recipes yet." />
          )}
        </>
      )}

      {/* ── Cookbooks tab ───────────────────────────────────────────────────── */}
      {activeTab === "cookbooks" && (
        <>
          {userCookbooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userCookbooks.map((cb) => {
                const cover = coverRecipes[cb.id];
                return (
                  <Link
                    key={cb.id}
                    href={`/${username}/cookbooks/${cb.slug}`}
                    className="flex gap-3 p-3 rounded-xl border border-border bg-card hover:border-yellow-brand hover:bg-yellow-subtle dark:hover:bg-muted transition-all group"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover.imageUrl}
                          alt={cb.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-yellow-brand transition-colors">
                        {cb.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {cb.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span>{cb.recipeIds.length} recipes</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cb.followers} followers
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                          {cb.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Library className="w-10 h-10" />}
              message="No cookbooks yet."
              sub="Cookbooks let you group recipes into themed collections - like playlists."
            />
          )}
        </>
      )}

      {/* ── Forks tab ───────────────────────────────────────────────────────── */}
      {activeTab === "forks" && (
        <>
          {forkedRecipes.length > 0 ? (
            <div className="space-y-3">
              {forkedRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/${recipe.owner.username}/${recipe.slug}`}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand transition-all group"
                >
                  <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors">
                      {recipe.name}
                    </p>
                    {recipe.forkedFrom && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        forked from{" "}
                        <span className="text-foreground">
                          {recipe.forkedFrom.owner}/{recipe.forkedFrom.recipe}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {recipe.stars.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {recipe.forks}
                      </span>
                      <span className="text-[11px]">Updated {recipe.updatedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<GitFork className="w-10 h-10" />}
              message="No forks yet."
              sub="Fork a recipe to create your own remixed version."
            />
          )}
        </>
      )}

      {/* ── Starred tab ─────────────────────────────────────────────────────── */}
      {activeTab === "starred" && (
        <>
          {starredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {starredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<BookMarked className="w-10 h-10" />}
              message="No starred recipes."
              sub="Star recipes you love to save them here."
            />
          )}
        </>
      )}
    </>
  );
}

function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <span className="w-10 h-10 mx-auto mb-3 opacity-30 flex justify-center">{icon}</span>
      <p className="text-sm font-medium">{message}</p>
      {sub && <p className="text-xs mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  );
}
