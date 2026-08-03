import Link from "next/link";
import Image from "next/image";
import { GitFork, Star, FlameKindling, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RecipeCardData } from "@/lib/types";

interface RecipeCardProps {
  recipe: RecipeCardData;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const href = `/${recipe.author.username}/${recipe.slug}`;

  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden hover:border-yellow-brand hover:shadow-sm transition-all duration-150">
      {/* Recipe image */}
      <Link href={href} className="block relative h-44 overflow-hidden bg-yellow-subtle">
        {recipe.imageUrl && (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {recipe.forkedFrom && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-background/90 backdrop-blur-sm rounded-full text-[11px] font-medium text-muted-foreground border border-border">
              <GitFork className="w-3 h-3" />
              forked from {recipe.forkedFrom.ownerUsername}/{recipe.forkedFrom.recipeSlug}
            </span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="p-4">
        {/* Owner */}
        <Link
          href={`/${recipe.author.username}`}
          className="inline-flex items-center gap-1.5 mb-2 group/owner"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={recipe.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[10px] bg-yellow-light">
              {recipe.author.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground group-hover/owner:text-foreground transition-colors">
            {recipe.author.username}
          </span>
        </Link>

        {/* Name */}
        <Link href={href}>
          <h3 className="text-[15px] font-semibold text-foreground leading-snug hover:text-yellow-hover transition-colors line-clamp-1">
            {recipe.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="text-[11px] px-2 py-0 h-5 bg-yellow-muted text-foreground/70 hover:bg-yellow-light border-0 font-normal"
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {recipe.starCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            {recipe.forkCount}
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            {recipe.tasteTestCount} taste tests
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px]">
            <FlameKindling className="w-3 h-3" />
            {recipe.tweakCount} tweaks
          </span>
        </div>
      </div>
    </article>
  );
}
