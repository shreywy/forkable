// ─── Shared UI types (bridge between Prisma models and UI components) ────────
// These types mirror what the UI components need, decoupled from mock-data.ts.

export type RecipeAuthor = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type RecipeTag = {
  /** The display label shown in the UI (e.g. "Italian") */
  label: string;
  /** The URL-safe slug (e.g. "italian") */
  name: string;
};

/** The minimal shape RecipeCard needs */
export type RecipeCardData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  author: RecipeAuthor;
  /** null means it's an original recipe */
  forkedFrom: { ownerUsername: string; recipeSlug: string } | null;
  starCount: number;
  forkCount: number;
  tasteTestCount: number;
  tweakCount: number;
  tags: RecipeTag[];
  updatedAt: Date | string;
};

/** Cookbook shape for ProfileTabs */
export type CookbookData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  /** Number of recipes inside this cookbook */
  recipeCount: number;
};

/** Tweak / commit shape for RecipePageTabs */
export type TweakData = {
  id: string;
  message: string;
  author: RecipeAuthor;
  createdAt: Date | string;
  additions: number;
  deletions: number;
  /** true when this version stores a full content snapshot (enables compare/restore) */
  hasSnapshot: boolean;
};

/** Reply on a taste test */
export type TasteTestReplyData = {
  id: string;
  body: string;
  author: RecipeAuthor;
  createdAt: Date | string;
};

/** Taste test shape for RecipePageTabs */
export type TasteTestData = {
  id: string;
  type: "COMMENT" | "SUGGESTION";
  status: "OPEN" | "MERGED" | "CLOSED";
  author: RecipeAuthor;
  createdAt: Date | string;
  // comment
  body?: string | null;
  rating?: number | null;
  // suggestion
  title?: string | null;
  diff?: { ingredient: string; from: string; to: string }[] | null;
  replies?: TasteTestReplyData[];
};

/** File-tree node shape */
export type FileTreeNode = {
  type: "folder" | "file";
  name: string;
  displayName?: string | null;
  updatedAt: Date | string;
  lastTweak: string | null;
  children?: FileTreeNode[];
  subSteps?: { step: number; text: string }[];
};

/** Full recipe shape for the recipe page */
export type RecipePageData = RecipeCardData & {
  servings: number;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  components: FileTreeNode[];
  instructions: { step: number; text: string }[];
};
