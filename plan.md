# Forkable — Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Forkable from a working CRUD social app into a professionally engineered, resume-standout project by adding testing/CI infrastructure, deep git-metaphor features (snapshots, diffs, restore, merge, blame), PostgreSQL full-text search, SEO/OG tooling, caching + rate limiting, an analytics dashboard, recipe scaling / shopping lists, PWA offline support, and env-gated AI features.

**Architecture:** Everything builds on the existing Next.js 16 App Router + Prisma 5 + Neon Postgres + NextAuth v5 stack. New pure logic lives in `src/lib/*` as testable modules. External services (Upstash Redis, Sentry, Anthropic) are strictly **env-gated with graceful in-process fallbacks** so the app runs fully without them. DB changes are additive Prisma migrations; one raw-SQL migration adds a tsvector column for full-text search.

**Tech Stack additions:** Vitest, GitHub Actions, Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`), `next/og` (satori, already bundled in Next), pgvector-free ingredient-overlap similarity via SQL, Serwist or hand-rolled service worker for PWA, Anthropic SDK (`@anthropic-ai/sdk`, model `claude-haiku-4-5-20251001`), Docker Compose for local Postgres, Sentry (`@sentry/nextjs`).

## Global Constraints

- **Never add Claude as a git contributor.** No `Co-Authored-By: Claude` lines, no `🤖 Generated with` footers in commits, PRs, or README. (CLAUDE.md rule 4.)
- **App must remain fully usable without sign-in** (browse, search, view recipes). Auth-gated actions degrade to a sign-in prompt.
- **Dark theme is default.** All new UI must be built dark-first and verified in light mode too. Brand yellow `oklch(0.83 0.17 88)`; use existing Tailwind/shadcn tokens (`bg-background`, `text-muted-foreground`, `border-border`, `text-primary`, etc.). Never hardcode hex colors in components.
- **Free tiers only.** No feature may require a paid plan. Every external service must be optional: detected via env var, with a working fallback when absent, and documented in `SETUP.html`.
- **No em-dashes (`—`) in user-facing UI strings.** Use spaced hyphen ` - ` or rewrite. (Existing backlog rule; applies to all new copy.)
- **Windows dev environment** (PowerShell). npm scripts must be cross-platform (no `&&` chains relying on sh-only features, no `NODE_ENV=x` inline env; use `cross-env` only if truly needed - prefer avoiding).
- **Prisma 5.22 / Next 16.2 / React 19 / Tailwind v4 / zod v4.** Do not upgrade majors as part of this plan.
- **Neon free tier:** connection pooling via `DATABASE_URL` (pooled) + `DIRECT_URL` for migrations - keep this pattern in any new migration instructions.
- **Path alias:** `@/*` → `src/*`.
- **Mutations**: follow the existing split - server actions in `src/lib/actions/*` for form-ish flows, route handlers under `src/app/api/*` for client-side fetch flows. Every mutation: `auth()` session check → zod parse → ownership check → `prisma.$transaction` where multi-write → `revalidatePath`.
- **Denormalized counters** (`starCount`, `forkCount`, `tweakCount`, `tasteTestCount`) must be updated atomically in the same transaction as the row change.
- **Commit after each completed task** (`git add` specific paths, conventional-commit message given per task). Push to `origin main` after each *workstream* completes (Vercel auto-deploys from main).
- **`npm run build` must pass before every push.**

## Progress Log (KEEP THIS UPDATED - handoff state for whoever implements next)

> Update this section after every completed task. If you are picking this plan up fresh: everything marked ✅ is implemented, committed, and pushed; ⏳ is in progress with notes; unmarked tasks are untouched.

- ✅ **Task 1 (Vitest)** - `vitest.config.ts`, `src/lib/slug.ts` extracted, 18 tests in `src/lib/__tests__/{slug,recipe-parser}.test.ts`. Also improved `parseTextRecipe`: headerless pastes now auto-detect ingredients (first ingredient-looking line flips to auto-detect mode), and auto-detect no longer strips leading quantities from ingredients.
- ✅ **Task 2 (CI)** - `.github/workflows/ci.yml` (lint, tsc, vitest, build with dummy env). Also fixed ALL pre-existing lint errors: `<a>`→`<Link>` (home, FollowButton, DiscoverFeed), removed `any` casts in seed, StepEditor TOOLS moved to module scope with `applyTool(kind)`, cook page setState-in-effect moved into fetch callback, ThemeProvider rewritten with `useSyncExternalStore` (new helper `src/lib/use-local-storage.ts` - reuse it for Task 20 shopping list), ExploreClient fridge state now uses `useLocalStorage` + guarded setState-during-render for URL query sync.
- ✅ **Task 3 (Rate limiting)** - `src/lib/rate-limit.ts` (`checkRateLimit`, `rateLimitResponse`, `clientKey`) + 8 tests. Wired into: star (60/min), fork (10/min), follow (60/min), taste-tests (15/min), replies (15/min), import/url (5/min, ip-based when logged out), upload/presign (20/min). SETUP.html has Upstash section (Step 3.5).
- ✅ **Task 4 (Cache)** - `src/lib/cache.ts` (`cached`, `invalidate`). Wrapped: trending page (key `trending:v1`, 300 s), explore public data (key `explore:v1`, 120 s; pantry stays uncached per-user).
- ✅ **Tasks 7+8 (Snapshots + diff)** - `src/lib/snapshot.ts` (types + `buildSnapshot` + `countUnits`), `src/lib/diff.ts` (`diffSnapshots`, `diffWords`; identical-content reorders = no change), `src/lib/snapshot-db.ts` (`fetchSnapshotSource(db, recipeId)`). Wired into `createRecipe` + `createTweak` (actions/recipes.ts) and the PUT edit route. Seed re-run: 210 versions all carry snapshots; forks get TWO versions (inherited source snapshot backdated 3 days + tweak with real diff counts) so compare pages have demo data. NOTE: intra-lib imports in diff.ts/snapshot-db.ts are relative (`./snapshot`) so tsx can run the seed.
- ✅ **Task 9 (Diff viewer)** - `src/components/recipe/DiffView.tsx` (server-safe; fields/tags/ingredients/steps sections, word-level `<del>`/highlight for modified steps), `src/app/[username]/[recipe]/compare/[range]/page.tsx` (`range` = `fromId...toId`, 404 on malformed/foreign/no-snapshot). `TweakData` gained `hasSnapshot`. TweakRow expanded panel now links "View changes" to compare (prev = next item in desc list).
- ✅ **Task 10 (Restore)** - `src/lib/apply-snapshot.ts` (`applySnapshotTx`; does NOT restore name), `src/lib/catalog.ts` (`ensureTagTx`/`ensureIngredientTx` - actions/recipes.ts now uses these tx-aware versions), `src/lib/actions/versions.ts` (`restoreVersion` with confirm dialog in TweakRow, owner-only, non-latest, diff-based +/- counts).
- Tasks 5, 6, 11-25: not started. Next up: Task 11 (merge suggestions) + Task 12 (blame) - `mergeSuggestion` belongs in `src/lib/actions/versions.ts`, reuse `applySnapshotTx`.

**Environment notes for successors:** Windows + PowerShell; `gh` CLI not installed (verify CI on github.com). Never add Claude as git contributor (no Co-Authored-By). Push to `origin main` after each batch = Vercel deploy. Verify before push: `npm run lint && npx tsc --noEmit && npm test && npm run build`.

## Existing Code Map (context for implementers)

- `prisma/schema.prisma` - models: User, Recipe, RecipeVersion (has `snapshot Json?`, currently always null), Component (FOLDER/FILE tree), Step (nested via `parentStepId`), Ingredient, ComponentIngredient, Star, Fork, Follow, Cookbook, CookbookRecipe, TasteTest (COMMENT | SUGGESTION with `diff Json?`), TasteTestReply, PantryItem, Tag, RecipeTag, Notification.
- `src/lib/actions/recipes.ts` - `createRecipe`, `deleteRecipe`, `createTweak` server actions. `toSlug()` helper lives here (duplicate it into `src/lib/slug.ts` when tasks need it client-side).
- `src/lib/actions/` also has `auth.ts`, `tasteTests.ts`, `notifications.ts`, `social.ts`.
- `src/app/api/` - `fork`, `star`, `follow`, `taste-tests`, `taste-tests/[id]/replies`, `pantry` (+`[ingredientId]`, `matches`), `cookbooks`, `recipes/feed`, `recipes/[username]/[slug]`, `ingredients/search`, `import/url`, `upload/presign`, `users/suggestions`, `onboarding/complete`.
- `src/lib/recipe-parser.ts` - pure JSON-LD + regex recipe parser (`parseRecipeHtml`, `parseRecipeText`, `parseDuration`, `ParsedRecipe` type). Great unit-test target.
- `src/lib/off.ts` - OpenFoodFacts search client.
- `src/lib/r2.ts`, `src/lib/upload.ts` - R2 presigned uploads.
- `src/lib/auth.ts` - NextAuth v5 config, credentials + Google. `auth()` returns session with `user.id` and `user.username`.
- `src/lib/prisma.ts` - singleton client.
- `src/lib/types.ts` - UI-facing types (`RecipeCardData`, `RecipePageData`, `TasteTestData`, `FileTreeNode`, `TweakData`...).
- Recipe page: `src/app/[username]/[recipe]/page.tsx` (server component, fetches full recipe) + `src/components/recipe/RecipePageTabs.tsx` (client tabs: Recipe / Tweaks / Taste Tests), `FileTree.tsx`, `TweakList.tsx`.
- Edit page: `src/app/[username]/[recipe]/edit/EditClient.tsx`.
- Explore: `src/app/explore/ExploreClient.tsx` (client-side filtering of server-fetched list).
- Navbar: `src/components/Navbar.tsx`.
- Seed: `prisma/seed.ts` - 126 recipes (42 base + 84 forks), 68 taste tests.
- No tests, no `.github/`, no Docker, no README screenshots yet.

---

# Workstream 1 — Engineering Foundations

## Task 1: Vitest setup + unit tests for existing pure logic

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/recipe-parser.test.ts`
- Create: `src/lib/__tests__/slug.test.ts`
- Create: `src/lib/slug.ts` (extract `toSlug` so it is importable outside "use server" files)
- Modify: `src/lib/actions/recipes.ts` (import `toSlug` from `@/lib/slug` instead of local def)
- Modify: `package.json` (scripts + devDeps)

**Interfaces:**
- Produces: `toSlug(name: string): string` in `src/lib/slug.ts`; `npm test` and `npm run test:watch` scripts. Later tasks add test files under `src/lib/__tests__/`.

**Steps:**

- [ ] Install: `npm i -D vitest @vitest/coverage-v8`
- [ ] `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] Create `src/lib/slug.ts` with the exact `toSlug` implementation currently in `actions/recipes.ts`; update `actions/recipes.ts` to import it. ("use server" files may only export async functions, which is why the sync helper must move out.)
- [ ] `slug.test.ts`: cases - `"Mom's Lasagna"` → `moms-lasagna`; leading/trailing junk `"  Hello!! "` → `hello`; unicode-ish `"Crème Brûlée"` → expected output of the current impl (run it, assert actual behavior); empty string → `""`.
- [ ] `recipe-parser.test.ts`: test `parseDuration` (`"PT1H30M"` → `"1 hr 30 min"`, `"PT45M"` → `"45 min"`, `undefined` → `undefined`, garbage → `undefined`); test JSON-LD extraction with a realistic inline HTML fixture containing a `@type: "Recipe"` script block (name, ingredients array, HowToStep instructions, nutrition) and assert the full `ParsedRecipe`; test the `@graph` variant; test text-fallback parsing of a plain pasted recipe (ingredients section + numbered steps); test that a page with no recipe data returns low confidence / empty.
- [ ] Run `npm test` - all pass. Run `npm run build` - passes.
- [ ] Commit: `test: add vitest with parser and slug unit tests`

## Task 2: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Steps:**

- [ ] Workflow: trigger on `push` to `main` + all `pull_request`. Single job `ci` on `ubuntu-latest`: checkout, setup-node@v4 (node 20, npm cache), `npm ci`, `npx prisma generate`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` with dummy env:

```yaml
env:
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db"
  DIRECT_URL: "postgresql://user:pass@localhost:5432/db"
  NEXTAUTH_SECRET: "ci-dummy-secret"
  NEXTAUTH_URL: "http://localhost:3000"
```

- [ ] Verify build works locally with those dummy vars absent from runtime paths (build must not connect to DB; if any page does DB work at build time, mark it `export const dynamic = "force-dynamic"`).
- [ ] Commit: `ci: add GitHub Actions lint/typecheck/test/build pipeline`. Push and confirm the Action goes green on GitHub before proceeding.

## Task 3: Rate limiting with Upstash Redis + in-memory fallback

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/__tests__/rate-limit.test.ts`
- Modify: `src/app/api/fork/route.ts`, `src/app/api/star/route.ts`, `src/app/api/follow/route.ts`, `src/app/api/taste-tests/route.ts`, `src/app/api/taste-tests/[id]/replies/route.ts`, `src/app/api/import/url/route.ts`, `src/app/api/upload/presign/route.ts`
- Modify: `SETUP.html` (Upstash section)

**Interfaces:**
- Produces: `checkRateLimit(key: string, opts?: { limit?: number; windowSec?: number }): Promise<{ ok: boolean; remaining: number; resetAt: number }>` - `key` convention `"<route>:<userId|ip>"`, default 30 req / 60 s.

**Steps:**

- [ ] Install `@upstash/redis @upstash/ratelimit`.
- [ ] `rate-limit.ts`: if `UPSTASH_REDIS_REST_URL` && `UPSTASH_REDIS_REST_TOKEN` are set, use `Ratelimit.slidingWindow(limit, windowSec + " s")` with a module-level cached client; otherwise fall back to an in-memory sliding-window `Map<string, number[]>` (timestamps, pruned per call). Export a single `checkRateLimit` that hides the backend. Also export `rateLimitResponse(resetAt: number)` returning `new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Retry-After": String(secondsUntil(resetAt)) } })`.
- [ ] Unit-test the in-memory path only: N calls within window flip `ok` to false at N+1; window expiry restores it (use `vi.useFakeTimers()`).
- [ ] Wire into each listed route at the top of POST/DELETE handlers: derive key from session user id, else `request.headers.get("x-forwarded-for") ?? "anon"`. Sensible budgets: star/follow 60/min, fork 10/min, taste-tests + replies 15/min, import/url 5/min, presign 20/min.
- [ ] Add "Upstash Redis (optional)" section to `SETUP.html`: create free account → create Redis DB → copy REST URL + token into `.env` as `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` → also add to Vercel env.
- [ ] `npm test` + build pass. Commit: `feat: add rate limiting with Upstash Redis and in-memory fallback`

## Task 4: Query caching layer for trending + explore

**Files:**
- Create: `src/lib/cache.ts`
- Modify: `src/app/trending/page.tsx`, `src/app/explore/page.tsx`, homepage data fetch in `src/app/page.tsx` (whichever of these do heavy aggregate queries)

**Interfaces:**
- Produces: `cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T>` - Upstash Redis JSON get/set with TTL when env present, else in-memory `Map<string, { value; expiresAt }>`.

**Steps:**

- [ ] Implement `cached()` as above. JSON-serialize; on cache read, revive nothing (callers must tolerate `Date` fields coming back as ISO strings - the UI types already allow `Date | string`).
- [ ] Wrap the trending leaderboard queries (most starred / most forked / most tweaked, per time window) with `cached("trending:" + window, 300, ...)`.
- [ ] Wrap explore's all-recipes + cooks-to-follow fetch with 120 s TTL.
- [ ] Verify pages still render (`npm run dev`, load /trending and /explore). Build passes. Commit: `feat: add Redis-backed query cache for trending and explore`

## Task 5: Docker Compose local dev database

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.docker.example`
- Modify: `README.md` (local dev section, written fully in Task 25 - here just add the compose file + a stub note)

**Steps:**

- [ ] `docker-compose.yml`: single `postgres:16-alpine` service, port `5433:5432` (avoid clashing with any local PG), volume `forkable-pgdata`, env `POSTGRES_USER=forkable POSTGRES_PASSWORD=forkable POSTGRES_DB=forkable`, healthcheck `pg_isready`.
- [ ] `.env.docker.example` documents `DATABASE_URL=postgresql://forkable:forkable@localhost:5433/forkable` + same for `DIRECT_URL`.
- [ ] Add npm script `"db:local": "docker compose up -d"`.
- [ ] Commit: `chore: add docker compose for local postgres development`

## Task 6: Sentry error monitoring (env-gated)

**Files:**
- Create: `instrumentation.ts` (repo root, or `src/instrumentation.ts` matching Next 16 convention), `instrumentation-client.ts`
- Modify: `next.config.ts`, `SETUP.html`

**Steps:**

- [ ] Install `@sentry/nextjs`. Manual setup (do NOT run the wizard - it rewrites files): `instrumentation.ts` registers server/edge init with `dsn: process.env.SENTRY_DSN`, `enabled: !!process.env.SENTRY_DSN`, `tracesSampleRate: 0.1`. Client init in `instrumentation-client.ts` with `NEXT_PUBLIC_SENTRY_DSN`, same `enabled` guard.
- [ ] Wrap `next.config.ts` export with `withSentryConfig(config, { silent: true, disableLogger: true })` only when DSN env is present at build; otherwise export the plain config (ternary at module level).
- [ ] Confirm `npm run build` passes **without** any Sentry env vars set.
- [ ] SETUP.html: "Sentry (optional)" - free account, create Next.js project, copy DSN into `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] Commit: `feat: add optional Sentry error monitoring`

---

# Workstream 2 — Git Depth (snapshots, diff, restore, merge, blame)

This is the differentiator workstream. Order matters: snapshots → diff engine → diff UI → restore → merge → blame.

## Task 7: Recipe snapshots on every version

**Files:**
- Create: `src/lib/snapshot.ts`
- Create: `src/lib/__tests__/snapshot.test.ts`
- Modify: `src/lib/actions/recipes.ts` (`createRecipe`, `createTweak`), the edit-save path in `src/lib/actions/recipes.ts` or wherever `EditClient` persists (check `src/app/[username]/[recipe]/edit/` - if it saves via an API route, modify that route)

**Interfaces:**
- Produces:

```ts
// src/lib/snapshot.ts
export type SnapshotIngredient = { name: string; amount: number | null; unit: string | null; preparation: string | null; isOptional: boolean };
export type SnapshotStep = { content: string; subSteps: string[] };
export type SnapshotComponent = { name: string; displayName: string | null; type: "FOLDER" | "FILE"; ingredients: SnapshotIngredient[]; steps: SnapshotStep[] };
export type RecipeSnapshot = {
  name: string; description: string; servings: number;
  tags: string[];                 // tag slugs, sorted
  components: SnapshotComponent[]; // in `order`
};
export function buildSnapshot(recipe: RecipeWithRelations): RecipeSnapshot;   // pure mapper
export function countUnits(s: RecipeSnapshot): number;                        // total ingredients + steps, used for additions/deletions
```

where `RecipeWithRelations` is the Prisma payload `Recipe & { components: (Component & { ingredients: (ComponentIngredient & { ingredient: Ingredient })[]; steps: Step[] })[]; tags: (RecipeTag & { tag: Tag })[] }` - define this type in `snapshot.ts` via `Prisma.RecipeGetPayload<...>`.

**Steps:**

- [ ] Implement `buildSnapshot`: order components by `order`, ingredients by `order`, steps by `order`; only top-level steps (`parentStepId === null`) become `SnapshotStep`s, child steps become their `subSteps` strings ordered by `order`.
- [ ] Unit tests with a hand-built fixture object (no DB): component ordering respected, sub-steps nested, tags sorted.
- [ ] `createRecipe`: after creating components/steps/ingredients inside the transaction, re-fetch with relations via `tx` and store `snapshot: buildSnapshot(full)` on the initial `recipeVersion.create`, `additions: countUnits(snapshot)`.
- [ ] `createTweak`: fetch full recipe with relations, build snapshot, store on the new version. Compute `additions`/`deletions` against the **previous version's snapshot** using the diff engine once Task 8 lands - for now store `additions: 0, deletions: 0` with a `// refined in diff task` note ONLY if Task 8 is not yet merged; if implementing sequentially in one session, do Tasks 7+8 together and compute real counts.
- [ ] Find the edit-save mutation (grep `EditClient` for its submit handler target). Ensure every successful edit save creates a `RecipeVersion` with a user-provided message (the edit page already has a commit-message flow per project decisions) and attaches the fresh snapshot.
- [ ] Backfill: add to `prisma/seed.ts` snapshot generation for seeded versions (call `buildSnapshot` on each seeded recipe and attach to its versions so diff UI has data). Re-run `npm run db:seed` locally.
- [ ] Tests + build pass. Commit: `feat: store full recipe snapshots on every version (tweak)`

## Task 8: Diff engine

**Files:**
- Create: `src/lib/diff.ts`
- Create: `src/lib/__tests__/diff.test.ts`

**Interfaces:**
- Consumes: `RecipeSnapshot`, `SnapshotComponent`, `SnapshotIngredient`, `SnapshotStep` from `@/lib/snapshot`.
- Produces:

```ts
export type FieldChange = { field: "name" | "description" | "servings"; from: string; to: string };
export type IngredientChange =
  | { kind: "added";   component: string; ingredient: SnapshotIngredient }
  | { kind: "removed"; component: string; ingredient: SnapshotIngredient }
  | { kind: "changed"; component: string; name: string; from: SnapshotIngredient; to: SnapshotIngredient };
export type StepChange =
  | { kind: "added";    component: string; index: number; content: string }
  | { kind: "removed";  component: string; index: number; content: string }
  | { kind: "modified"; component: string; index: number; from: string; to: string };
export type RecipeDiff = {
  fields: FieldChange[];
  tags: { added: string[]; removed: string[] };
  ingredients: IngredientChange[];
  steps: StepChange[];
  additions: number;  // added + changed/modified count
  deletions: number;  // removed count
};
export function diffSnapshots(from: RecipeSnapshot, to: RecipeSnapshot): RecipeDiff;
export function diffWords(from: string, to: string): { text: string; type: "same" | "added" | "removed" }[]; // word-level LCS for inline highlight
```

**Steps:**

- [ ] Algorithm: match components by `name`. Within a component, match ingredients by `name` (added = in `to` only, removed = in `from` only, changed = same name but amount/unit/preparation/isOptional differ). Match steps by **LCS over normalized content** (lowercased, trimmed): steps in the LCS are "same", paired non-LCS steps at the same relative position with >0.5 token overlap (Jaccard over words) are "modified", the rest are added/removed. Components present in only one snapshot contribute all their units as added/removed.
- [ ] `diffWords`: classic LCS on word arrays, merge consecutive same-type runs.
- [ ] Unit tests (write FIRST, red → green): identical snapshots → empty diff, zero counts; ingredient amount change → one `changed`; renamed step with 80 % same words → `modified`; reordering steps without content change → empty step diff (LCS handles it); component added → all units counted as additions; tag add/remove; field change on servings (numbers stringified).
- [ ] Wire back into `createTweak` (Task 7): `const d = diffSnapshots(prevSnapshot, newSnapshot)` → store `additions: d.additions, deletions: d.deletions`.
- [ ] Commit: `feat: add structural recipe diff engine with word-level LCS`

## Task 9: Diff viewer UI (compare page + Tweaks tab integration)

**Files:**
- Create: `src/app/[username]/[recipe]/compare/[range]/page.tsx` (server component; `range` = `"<fromVersionId>...<toVersionId>"`)
- Create: `src/components/recipe/DiffView.tsx` (client or server presentational component)
- Modify: `src/components/recipe/TweakList.tsx` (each tweak row links to compare vs its parent; "+N -M" stat pills already exist - make them link)

**Interfaces:**
- Consumes: `diffSnapshots`, `diffWords`, `RecipeDiff` from Task 8; `RecipeSnapshot` from Task 7.
- Produces: `<DiffView diff={RecipeDiff} fromLabel={string} toLabel={string} />`.

**Steps:**

- [ ] Compare page: parse `range` (split on `"..."`; 404 if malformed), fetch both `RecipeVersion`s (must belong to this recipe - 404 otherwise), 404 if either lacks a snapshot, run `diffSnapshots`, render header ("Comparing *message A* → *message B*" with author avatars + dates) + `<DiffView/>`.
- [ ] `DiffView` design (GitHub-style, using theme tokens): sections for Fields / Tags / Ingredients / Steps. Ingredients: rows with `+` rows tinted `bg-green-500/10 text-green-600 dark:text-green-400` prefix `+`, removed rows `bg-red-500/10` prefix `-`, changed rows show `from → to` on amount/unit. Steps: card per change; modified steps render `diffWords` output with `<del>`/`<ins>`-styled spans (red strikethrough / green underline-free highlight). Empty diff → friendly "These versions are identical" state.
- [ ] `TweakList`: for each version (except the oldest), link the row to `/[username]/[recipe]/compare/[prevId]...[thisId]`.
- [ ] Manual check in dev with seeded data (seed backfill from Task 7 makes consecutive seeded versions diffable; if seeded versions share identical snapshots, adjust seed to mutate something per version, e.g. increment an ingredient amount, so demo diffs are non-empty).
- [ ] Build passes. Commit: `feat: add GitHub-style version compare page and diff viewer`

## Task 10: Restore a previous version (git revert)

**Files:**
- Create: `applySnapshot` in `src/lib/actions/versions.ts` (new server-action file: `restoreVersion`, and Task 11 adds `mergeSuggestion` here)
- Modify: `src/components/recipe/TweakList.tsx` (Restore button, owner-only)

**Interfaces:**
- Produces: `restoreVersion(versionId: string, message?: string): Promise<{ success?: true; error?: string }>` and internal helper `applySnapshotTx(tx: Prisma.TransactionClient, recipeId: string, snap: RecipeSnapshot): Promise<void>` (exported for Task 11 reuse — put the helper in `src/lib/apply-snapshot.ts`, NOT in the "use server" file).

**Steps:**

- [ ] `applySnapshotTx`: inside a transaction - delete all `Component`s of the recipe (cascades steps + componentIngredients), recreate components/ingredients/steps from the snapshot exactly as `createRecipe` does (reuse `ensureIngredient` logic - move `ensureTag`/`ensureIngredient` into `src/lib/catalog.ts` and import from both action files; they take `tx` as first param now). Update recipe scalar fields (name is **not** restored to avoid slug churn - restore description + servings only; note this in UI copy: "Restores ingredients, steps, description and servings"). Sync tags to snapshot tags.
- [ ] `restoreVersion` action: auth → load version + recipe → owner check → snapshot null check → transaction: `applySnapshotTx`, then create new `RecipeVersion` with message default `` `Restore: "${version.message}"` ``, snapshot = the restored snapshot, additions/deletions from `diffSnapshots(current, restored)`, increment `tweakCount` → `revalidatePath`.
- [ ] TweakList: owner sees a "Restore" button per historical version with a confirm dialog ("This replaces the current ingredients and steps with this version. A new tweak will record the restore."). On success, `router.refresh()`.
- [ ] Manual test in dev: tweak a recipe, restore the older version, verify ingredients/steps reverted and a new tweak row appeared.
- [ ] Commit: `feat: restore any previous recipe version as a new tweak`

## Task 11: Merge taste-test suggestions (one-click cherry-pick)

**Files:**
- Modify: `src/lib/actions/versions.ts` (add `mergeSuggestion`), `src/lib/actions/tasteTests.ts` (or keep merge in versions.ts - single home: versions.ts)
- Modify: `src/components/recipe/RecipePageTabs.tsx` (Merge / Close buttons on suggestion cards, owner-only)
- Modify: `src/app/api/taste-tests/route.ts` **only if** suggestion-creation doesn't already store a usable diff

**Interfaces:**
- Consumes: `TasteTest.diff` JSON (existing shape: `[{ ingredient: string; from: string; to: string }]` per `src/lib/types.ts`), `applySnapshotTx`, `buildSnapshot`, `diffSnapshots`.
- Produces: `mergeSuggestion(tasteTestId: string): Promise<{ success?: true; error?: string }>`, `closeSuggestion(tasteTestId: string): Promise<{ success?: true; error?: string }>`.

**Steps:**

- [ ] Inspect how suggestion diffs are stored today (read `tasteTests.ts` + seed). The stored diff entries reference ingredient names with `from`/`to` strings like `"200g"` → `"250g"`.
- [ ] `mergeSuggestion`: auth → load taste test + recipe (owner check, `type === "SUGGESTION"`, `status === "OPEN"`) → transaction: for each diff entry, find the recipe's `ComponentIngredient` whose `ingredient.name` matches (case-insensitive) and parse `to` into amount+unit (`/^([\d.\/]+)\s*(.*)$/` - handle `"1/2"` fractions; if `to` is unparseable, store it in `preparation`? No - keep it simple: set `amount = parsed ?? null`, `unit = rest || existing unit`); update it. Then build fresh snapshot, create `RecipeVersion` (message: `` `Merge taste test: "${tasteTest.title}"` ``, author = **suggestion author** so contribution is credited, additions/deletions via diff), set taste test `status: "MERGED"`, increment recipe `tweakCount`, create `Notification` (`type: SUGGESTION_MERGED`, recipient = suggestion author, actor = owner) → revalidate.
- [ ] `closeSuggestion`: owner-only, sets `CLOSED`, notification `SUGGESTION_CLOSED`.
- [ ] UI: on suggestion cards (status OPEN, viewer is recipe owner) show yellow "Merge" button + ghost "Close" button; after merge the existing MERGED badge styling takes over. Non-owner sees status only.
- [ ] Manual test with a seeded open suggestion.
- [ ] Commit: `feat: merge taste test suggestions into recipes with credited version`

## Task 12: Blame view (who last changed each step/ingredient)

**Files:**
- Create: `src/lib/blame.ts`, `src/lib/__tests__/blame.test.ts`
- Create: `src/components/recipe/BlameView.tsx`
- Modify: `src/components/recipe/RecipePageTabs.tsx` (add "Blame" toggle inside the Recipe tab, or a sub-tab)
- Modify: `src/app/[username]/[recipe]/page.tsx` (fetch versions with snapshots + authors, pass down)

**Interfaces:**
- Consumes: `RecipeSnapshot`, `diffSnapshots`.
- Produces:

```ts
export type BlameEntry = { versionId: string; message: string; author: { username: string; displayName: string; avatarUrl: string | null }; createdAt: string };
export type BlameResult = {
  steps: { component: string; content: string; blame: BlameEntry }[];
  ingredients: { component: string; name: string; blame: BlameEntry }[];
};
export function computeBlame(versions: { id: string; message: string; createdAt: Date; author: BlameEntry["author"]; snapshot: RecipeSnapshot }[]): BlameResult; // versions oldest → newest
```

**Steps:**

- [ ] Algorithm: walk versions oldest→newest; for each consecutive pair run `diffSnapshots`; any step/ingredient that is added or modified/changed in version *k* gets its blame set to version *k*. Items never touched after the first version blame to version 0. Final result reflects only items present in the newest snapshot.
- [ ] Unit tests: 3-version fixture where v2 edits step 2 and v3 adds an ingredient - assert blame attribution; item removed in v3 absent from result.
- [ ] `BlameView`: table-like rows - left gutter shows avatar + tweak message + relative date (muted, truncated), right shows the step/ingredient text. Group by component. Gutter cell links to the compare page for that version.
- [ ] Recipe tab gets a small toggle (`Eye` / `GitCommit` style icon buttons): "Normal | Blame". Only render Blame toggle when ≥1 version has a snapshot.
- [ ] Commit: `feat: add git blame view for recipe steps and ingredients`

---

# Workstream 3 — Search & Discovery

## Task 13: PostgreSQL full-text search

**Files:**
- Create: `prisma/migrations/<ts>_add_recipe_search_vector/migration.sql` (via `prisma migrate dev --create-only`)
- Create: `src/lib/search.ts`, `src/lib/__tests__/search.test.ts` (query-builder unit test only, no DB)
- Create: `src/app/api/search/route.ts`
- Modify: `src/app/explore/ExploreClient.tsx` + `src/app/explore/page.tsx` (server-backed search), `src/components/Navbar.tsx` (search submits to `/explore?q=`)

**Interfaces:**
- Produces: `searchRecipes(q: string, limit?: number): Promise<RecipeCardData[]>` (server-only, raw SQL); `GET /api/search?q=&type=recipes|users|all` → `{ recipes: RecipeCardData[], users: { username, displayName, avatarUrl }[] }`.

**Steps:**

- [ ] Migration SQL (schema.prisma cannot express this in Prisma 5 - keep the column OUT of the Prisma model, or map as `Unsupported("tsvector")?`; use `Unsupported` so `db push`/migrate stay consistent):

```sql
ALTER TABLE "Recipe" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("story", '')), 'C')
  ) STORED;
CREATE INDEX "Recipe_searchVector_idx" ON "Recipe" USING GIN ("searchVector");
```

  Add to schema.prisma on Recipe: `searchVector Unsupported("tsvector")?` (with `@ignore` not needed for Unsupported). Run `npx prisma migrate dev` against Neon (needs DIRECT_URL - it's configured).
- [ ] `search.ts`: `searchRecipes` uses `prisma.$queryRaw` with `websearch_to_tsquery('english', ${q})`, filters `"isPublic" = true`, orders by `ts_rank("searchVector", query) DESC, "starCount" DESC`, joins author + tags in a second Prisma query by ids (raw query returns ids + rank; hydrate via `prisma.recipe.findMany({ where: { id: { in: ids } }, include: {...} })` and re-sort by rank order). Fallback: if `q` produces an empty tsquery (symbols only), return `[]`.
- [ ] `GET /api/search`: zod-validate `q` (1-100 chars), rate-limit key `search:<ip>` 30/min, `type` param; users searched via `contains` insensitive on username/displayName (limit 5).
- [ ] Explore: server component reads `searchParams.q`; when present, use `searchRecipes` for the grid and pass an `initialQuery` to ExploreClient; client search box performs router.push with `?q=` (debounced 300 ms) instead of client-side substring filtering for the main grid (tag pills continue to filter client-side within results).
- [ ] Navbar search input submits (Enter) to `/explore?q=...`.
- [ ] Unit test: the tsquery-sanitizer helper (`toWebsearchQuery(raw: string): string` - trims, collapses whitespace, caps length) - pure function.
- [ ] Manual: search "lasagna", "chicken -spicy" style queries in dev. Commit: `feat: add Postgres full-text search with weighted tsvector and GIN index`

## Task 14: Command palette (Ctrl+K)

**Files:**
- Create: `src/components/CommandPalette.tsx`
- Modify: `src/components/Navbar.tsx` (mount palette; search box shows `Ctrl K` kbd hint), `src/components/ClientProviders.tsx` if a global mount point fits better

**Interfaces:**
- Consumes: `GET /api/search?q=&type=all` (Task 13).

**Steps:**

- [ ] Client component: global `keydown` listener for `Ctrl/Cmd+K` (preventDefault) toggling an overlay dialog (fixed inset, `bg-black/50 backdrop-blur-sm`, centered panel `max-w-lg` using card tokens). Input autofocus; 250 ms debounced fetch to `/api/search`; results grouped "Recipes" (image thumb, name, author) and "Cooks" (avatar, displayName); arrow-key navigation with `aria-selected`, Enter navigates (`router.push`), Esc closes. Empty query state shows quick links: New recipe, Explore, Trending, Shopping list, your profile.
- [ ] Static quick-link actions filter client-side by fuzzy includes match.
- [ ] Keyboard nav must wrap and scroll selected item into view. All interactive elements keyboard-accessible; dialog has `role="dialog" aria-modal="true"`.
- [ ] Commit: `feat: add global Ctrl+K command palette with live search`

## Task 15: Similar recipes ("You might also like")

**Files:**
- Create: `src/lib/similar.ts`
- Create: `src/components/recipe/SimilarRecipes.tsx`
- Modify: `src/app/[username]/[recipe]/page.tsx` (render below tabs / in sidebar bottom)

**Interfaces:**
- Produces: `getSimilarRecipes(recipeId: string, limit = 4): Promise<RecipeCardData[]>`.

**Steps:**

- [ ] SQL approach (one `$queryRaw`): score = shared ingredient count (join `ComponentIngredient` via `Component` on both sides) * 2 + shared tag count, exclude self + its direct forks + private, order by score desc then starCount, limit. Hydrate to `RecipeCardData` like Task 13.
- [ ] Wrap in `cached("similar:" + recipeId, 3600, ...)` (Task 4).
- [ ] `SimilarRecipes`: horizontal strip of existing `RecipeCard`s (reuse component; it already accepts `RecipeCardData`), heading "You might also like". Hide entirely when empty.
- [ ] Commit: `feat: add ingredient-overlap similar recipes section`

---

# Workstream 4 — SEO & Sharing

## Task 16: Dynamic Open Graph images

**Files:**
- Create: `src/app/[username]/[recipe]/opengraph-image.tsx`
- Create: `src/app/[username]/opengraph-image.tsx`

**Steps:**

- [ ] Use `next/og` `ImageResponse` (1200x630). Recipe card: dark charcoal background `#1a1a1a`, brand yellow `#F5C518` accent bar + fork glyph, recipe name (bold, up to 2 lines, `text-overflow` via slicing at ~60 chars), author `@username` with avatar `<img>` (absolute URL), stat row "★ N · ⑂ N tweaks". Fetch recipe via prisma in the image handler; `export const runtime = "nodejs"` (Prisma cannot run on edge), `export const alt`, `size`, `contentType = "image/png"`.
- [ ] Profile image: avatar, displayName, @username, follower + recipe counts.
- [ ] Unknown slug → return default branded image (name "Forkable").
- [ ] Verify by hitting `/{user}/{recipe}/opengraph-image` in dev browser.
- [ ] Commit: `feat: add dynamic OG images for recipes and profiles`

## Task 17: schema.org JSON-LD + metadata

**Files:**
- Create: `src/lib/jsonld.ts`
- Modify: `src/app/[username]/[recipe]/page.tsx` (inject `<script type="application/ld+json">` + `generateMetadata`), `src/app/[username]/page.tsx` (`generateMetadata` + ProfilePage JSON-LD), `src/app/layout.tsx` (metadataBase, default OG)

**Interfaces:**
- Produces: `recipeJsonLd(r: RecipePageData & { ingredientLines: string[] }): object` returning a schema.org `Recipe` object (name, description, image, author Person, datePublished, recipeYield, recipeIngredient[], recipeInstructions as HowToStep[], nutrition NutritionInformation when macros present, interactionStatistic for stars).

**Steps:**

- [ ] Nice symmetry note for README: Forkable *imports* recipes by parsing JSON-LD and now *exports* valid JSON-LD - a Forkable page can be imported into Forkable.
- [ ] `generateMetadata` on recipe page: title `"{name} by @{username} | Forkable"`, description (truncate 155 chars), openGraph + twitter card `summary_large_image` (images resolved automatically from Task 16 file convention - just set metadataBase in root layout to `https://<prod-domain>` via `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"`).
- [ ] Render JSON-LD with `dangerouslySetInnerHTML` + `JSON.stringify` (escape `<` as `<`).
- [ ] Validate output shape against Google's Rich Results test schema manually (paste one page's JSON-LD).
- [ ] Commit: `feat: add schema.org Recipe JSON-LD and full page metadata`

## Task 18: sitemap.xml, robots.txt, RSS feed

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[username]/rss.xml/route.ts`

**Steps:**

- [ ] `sitemap.ts`: static routes (/, /explore, /trending) + all public recipes (`/${author.username}/${slug}`, lastModified = updatedAt) + public profiles. Cap at 5000 entries (`take: 5000`, ordered by starCount).
- [ ] `robots.ts`: allow all, disallow `/api/`, `/settings`, `/onboarding`; sitemap URL from `NEXT_PUBLIC_APP_URL`.
- [ ] RSS route: latest 20 public recipes by a user as RSS 2.0 XML (hand-built template string, escape entities), `Content-Type: application/rss+xml`. `<link rel="alternate">` tag added on profile page metadata.
- [ ] Commit: `feat: add sitemap, robots, and per-user RSS feeds`

---

# Workstream 5 — Product Features

## Task 19: Recipe scaling + unit conversion

**Files:**
- Create: `src/lib/units.ts`, `src/lib/__tests__/units.test.ts`
- Create: `src/components/recipe/ServingsControl.tsx`
- Modify: the ingredients list rendering component (inside `src/app/[username]/[recipe]/page.tsx` / `RecipePageTabs.tsx` - find where `ComponentIngredient`s render) to be scaling-aware; cook mode page `src/app/[username]/[recipe]/cook/page.tsx` gets the same control

**Interfaces:**
- Produces:

```ts
export type Amount = { value: number; unit: string | null };
export function scaleAmount(a: Amount, factor: number): Amount;         // smart: 0.5 tsp not 0.499999
export function formatAmount(a: Amount): string;                        // "1½ cups", "250 g" - vulgar fractions for imperial units
export function convertUnit(a: Amount, target: "metric" | "imperial"): Amount; // g↔oz, ml↔cups/tbsp/tsp, kg↔lb; unknown units returned unchanged
export const CONVERTIBLE_UNITS: Record<string, { system: "metric" | "imperial"; toBase: number; base: "g" | "ml" }>;
```

**Steps:**

- [ ] `units.ts`: unit table (g, kg, mg, ml, l, tsp=4.93 ml, tbsp=14.79 ml, cup=236.6 ml, fl-oz=29.57 ml, oz=28.35 g, lb=453.6 g). `scaleAmount` rounds to 2 significant decimals, snaps to nice fractions (¼ ⅓ ½ ⅔ ¾) within 3 % for imperial volume units. `formatAmount` renders vulgar fraction glyphs. `convertUnit` picks the most readable target unit (e.g. 480 ml → "2 cups", 1500 g → "3.3 lb").
- [ ] TDD: tests first for each function - scaling 2x of "¾ cup", metric→imperial for 250 g, unknown unit "cloves" passthrough, null unit passthrough, snapping behavior.
- [ ] `ServingsControl` (client): `- 4 servings +` stepper plus `g/oz` toggle; lifts state via URL search params? No - local React state within a client wrapper: convert the ingredients section into a client component `IngredientsPanel` receiving raw ingredient data `{ name, amount, unit, preparation, isOptional, component }[]` + `baseServings`; it renders the control and the scaled/converted list. Server page passes data down.
- [ ] Cook mode: same `IngredientsPanel` or its slimmer variant in the sidebar.
- [ ] Commit: `feat: add recipe scaling and metric/imperial unit conversion`

## Task 20: Shopping list

**Files:**
- Create: `src/lib/shopping-list.ts`, `src/lib/__tests__/shopping-list.test.ts`
- Create: `src/app/shopping-list/page.tsx`, `src/components/ShoppingListClient.tsx`
- Create: `src/components/recipe/AddToShoppingListButton.tsx`
- Modify: recipe page sidebar (add button), `src/components/Navbar.tsx` (link in user dropdown or nav: "Shopping list")

**Interfaces:**
- Produces:

```ts
// localStorage schema, key "forkable:shopping-list:v1"
export type ShoppingListEntry = { recipeId: string; recipeName: string; recipeSlug: string; authorUsername: string; servingsFactor: number; addedAt: string };
export type MergedItem = { name: string; amounts: Amount[]; merged: Amount | null; recipes: string[]; checked: boolean };
export function mergeIngredients(lists: { recipeName: string; ingredients: { name: string; amount: number | null; unit: string | null }[]; factor: number }[]): MergedItem[];
```

- Consumes: `Amount`, `convertUnit`, `formatAmount`, `CONVERTIBLE_UNITS` from Task 19; `GET /api/recipes/[username]/[slug]` for ingredient data.

**Steps:**

- [ ] `mergeIngredients`: group by normalized ingredient name; sum amounts whose units share a base (convert to base g/ml then to the most readable unit); incompatible/unitless amounts listed separately in `amounts` with `merged: null`. Scale by `factor` before merging. TDD with cases: 200 g + 0.5 lb butter merges; "2 cloves" + "3 cloves" merges numerically with unit "cloves" (same-unit merge even for unknown units); unitless + gram stays split.
- [ ] Button on recipe page: adds `{recipeId, servingsFactor: currentScale}` to localStorage (dedupe by recipeId - re-adding updates factor), toast-style confirmation (simple state text), navbar badge count.
- [ ] `/shopping-list` page (client): reads entries, fetches each recipe's ingredients from the existing API route in parallel, renders merged list grouped alphabetically with checkboxes (checked state persisted in localStorage), per-recipe chips showing sources, "Remove recipe" per entry, "Clear checked", "Copy as text" (writes plain text list to clipboard), print stylesheet (`@media print` hides nav/buttons).
- [ ] Works logged-out (pure localStorage - aligns with "usable without sign-in").
- [ ] Commit: `feat: add multi-recipe shopping list with unit-merging engine`

## Task 21: Ingredient catalog pages

**Files:**
- Create: `src/app/ingredients/page.tsx`, `src/app/ingredients/[slug]/page.tsx`
- Modify: `src/components/Footer.tsx` or Navbar "Explore" area to link "Ingredients"

**Steps:**

- [ ] Index page: searchable grid of ingredients (name, usage count via `_count.usages`, macro chips). Server component + `searchParams.q` filter (`contains` insensitive). Order by usage count desc. Paginate `?page=` (48/page, simple prev/next links).
- [ ] Detail page: ingredient header (name, aliases, macro panel styled like the recipe macros panel - per 100 g, macroSource badge "OpenFoodFacts | Manual | Estimated"), pantry toggle button (reuse pantry API; hidden when logged out), and "Used in N recipes" grid of `RecipeCard`s (query recipes joining ComponentIngredient, public only, top 12 by stars).
- [ ] `generateMetadata` for both.
- [ ] Commit: `feat: add ingredient catalog index and detail pages`

## Task 22: Recipe view tracking + insights dashboard

**Files:**
- Modify: `prisma/schema.prisma` (new model) + migration
- Create: `src/app/api/recipes/[username]/[slug]/view/route.ts`
- Create: `src/components/recipe/ViewTracker.tsx`
- Create: `src/app/[username]/[recipe]/insights/page.tsx`, `src/components/recipe/InsightsCharts.tsx`
- Modify: recipe page (mount ViewTracker; owner sees "Insights" tab/link with a `BarChart3` icon)

**Interfaces:**
- Produces (schema):

```prisma
model RecipeDailyStat {
  recipeId String
  day      DateTime @db.Date
  views    Int      @default(0)
  recipe   Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  @@id([recipeId, day])
  @@index([recipeId, day])
}
```

  plus `dailyStats RecipeDailyStat[]` on Recipe. `POST .../view` → 204.

**Steps:**

- [ ] Migration `add_recipe_daily_stats`.
- [ ] View route: no auth required; rate-limit `view:<ip>:<recipeId>` 3/hour so refresh-spam doesn't inflate; upsert `views: { increment: 1 }` on `(recipeId, today-UTC)`.
- [ ] `ViewTracker`: client component, `useEffect` once → `fetch(..., { method: "POST", keepalive: true })`, fires only after 5 s on page (setTimeout) to skip bounces. Renders nothing.
- [ ] Insights page: owner-only (redirect otherwise). Fetch last 30 days of stats + star/fork/tasteTest event dates (group by day via Prisma `groupBy` on `Star.createdAt` etc.). Charts as **hand-rolled inline SVG** (no chart lib - resume point: custom SVG viz): 30-day view area chart with yellow gradient fill, hover tooltip showing exact day+count; small stat tiles (views 30d, stars total, forks total, taste tests total with 7d deltas); horizontal bar list "Top referrer days". Use theme tokens via `currentColor`/CSS vars; must be legible in both themes.
- [ ] Charts get `role="img"` + `aria-label` summaries.
- [ ] Commit: `feat: add view tracking and owner insights dashboard with SVG charts`

## Task 23: PWA + offline cook mode

**Files:**
- Create: `src/app/manifest.ts`, `public/sw.js`, `src/components/ServiceWorkerRegistrar.tsx`, icons `public/icons/icon-192.png`, `public/icons/icon-512.png` (generate with sharp from an SVG fork glyph - write a one-off script `scripts/gen-icons.ts` run via tsx, commit outputs)
- Modify: `src/app/layout.tsx` (mount registrar)

**Steps:**

- [ ] `manifest.ts`: name "Forkable", short_name, `theme_color: "#F5C518"`, `background_color: "#1a1a1a"`, display standalone, icons.
- [ ] `sw.js` (hand-rolled, ~60 lines - simpler + more explainable than Serwist): install → precache `/` shell assets? Keep minimal: **runtime caching only** - `fetch` handler: for GET same-origin navigations and `/_next/static/`, network-first with cache fallback (cache name `forkable-v1`); for recipe pages (`/[user]/[slug]` and `/cook`), stale-while-revalidate so a visited recipe opens offline in the kitchen. Skip `/api/` entirely. `activate` cleans old cache versions.
- [ ] Registrar: `navigator.serviceWorker.register("/sw.js")` in production only (`process.env.NODE_ENV === "production"`).
- [ ] Test: `npm run build && npm start`, DevTools offline mode, previously visited recipe + cook mode load.
- [ ] Commit: `feat: add PWA manifest and offline-capable cook mode via service worker`

---

# Workstream 6 — AI + Polish

## Task 24: "Sous Chef" AI features (env-gated Anthropic)

> Before implementing, load the `claude-api` skill for current SDK/model guidance. Model: `claude-haiku-4-5-20251001` (cheap, fast).

**Files:**
- Create: `src/lib/ai.ts`
- Create: `src/app/api/ai/substitutions/route.ts`, `src/app/api/ai/enrich/route.ts`
- Create: `src/components/recipe/SubstitutionsCard.tsx`
- Modify: new-recipe wizard `src/app/new/page.tsx` ("Suggest description & tags" button), recipe page sidebar (substitutions card), `SETUP.html`

**Interfaces:**
- Produces: `aiEnabled(): boolean` (checks `ANTHROPIC_API_KEY`); `suggestSubstitutions(ingredients: string[], dietary?: string): Promise<{ ingredient: string; substitute: string; note: string }[]>`; `enrichRecipe(input: { name: string; ingredients: string[]; steps: string[] }): Promise<{ description: string; tags: string[] }>`.

**Steps:**

- [ ] `ai.ts`: lazy-import `@anthropic-ai/sdk`, singleton client. Both functions: single `messages.create` call, `max_tokens: 1024`, strict JSON-only prompt ("Respond with only a JSON array/object, no prose"), parse with zod, on any error return `[]`/nulls (never throw to UI).
- [ ] Routes: 401 if unauthenticated (AI costs money - require login), 503 `{ error: "AI features not configured" }` when `!aiEnabled()`, rate limit 10/hour/user. Substitutions route caches result per recipe in `cached("ai:subs:" + recipeId, 86400, ...)` so repeat views cost nothing.
- [ ] UI: `SubstitutionsCard` renders only after user clicks "Suggest substitutions ✨" (no auto-spend); loading shimmer; graceful hidden state when 503 (feature-detect once via the response, hide button). New-recipe wizard button fills description + tag fields but leaves them editable.
- [ ] SETUP.html: "Anthropic API (optional)" - console.anthropic.com key → `ANTHROPIC_API_KEY`.
- [ ] Commit: `feat: add env-gated AI ingredient substitutions and recipe enrichment`

## Task 25: README overhaul + copy audit + CLAUDE.md sync

**Files:**
- Modify: `README.md`, `CLAUDE.md`, `SETUP.html`
- Audit: all `src/**` UI strings for em-dashes

**Steps:**

- [ ] README: hero section (logo/name, one-liner, live demo link), screenshots (grab from running dev: home, recipe page w/ diff, insights - store in `docs/screenshots/`), the git→cooking concept table, feature list, architecture section (stack table + a mermaid diagram: Next.js → Prisma → Neon; R2; Upstash; OFF API; Anthropic), local dev setup (clone → `npm i` → docker compose OR Neon → migrate → seed → dev), testing + CI badges (`![CI](https://github.com/shreywy/<repo>/actions/workflows/ci.yml/badge.svg)`), env var table marking optional vars.
- [ ] Grep `—` across `src/` UI strings; replace per constraint. (Code comments may keep them.)
- [ ] CLAUDE.md: update Current Sprint to point at `plan.md`, move completed items to Completed Features.
- [ ] Commit: `docs: overhaul README with architecture, screenshots, and setup guide`

---

# Execution Order & Batching

| Batch | Tasks | Push after |
|---|---|---|
| 1 | 1, 2 (test infra + CI) | ✅ push (verify Action green) |
| 2 | 3, 4 (rate limit + cache) | ✅ push |
| 3 | 7, 8 (snapshots + diff engine) | ✅ push |
| 4 | 9, 10 (diff UI + restore) | ✅ push |
| 5 | 11, 12 (merge + blame) | ✅ push |
| 6 | 13, 14, 15 (search + palette + similar) | ✅ push |
| 7 | 16, 17, 18 (OG + JSON-LD + sitemap/RSS) | ✅ push |
| 8 | 19, 20 (scaling + shopping list) | ✅ push |
| 9 | 21, 22 (ingredients + insights) | ✅ push |
| 10 | 23 (PWA) | ✅ push |
| 11 | 24 (AI) | ✅ push |
| 12 | 5, 6, 25 (docker, sentry, README) | ✅ push |

Before every push: `npm run lint && npx tsc --noEmit && npm test && npm run build` all green.

# Resume Bullet Bank (what this plan buys)

- Engineered a git-inspired version-control system for recipes: JSON snapshots per commit, a custom LCS-based structural diff engine, one-click revert, PR-style merge with contributor attribution, and blame views.
- Implemented PostgreSQL full-text search with weighted tsvector generated columns and GIN indexes, exposed through a debounced Ctrl+K command palette.
- Added Redis-backed sliding-window rate limiting and query caching (Upstash) with transparent in-memory fallbacks for zero-config local dev.
- Built CI/CD with GitHub Actions (lint, typecheck, Vitest suite, production build) and Vercel preview deployments.
- Shipped SEO infrastructure: dynamic Open Graph image generation, schema.org Recipe JSON-LD (round-trippable with the site's own JSON-LD recipe importer), sitemap and RSS.
- Designed an offline-capable PWA cook mode with a hand-rolled service worker (stale-while-revalidate).
- Created an owner analytics dashboard with custom inline-SVG time-series charts and daily aggregate tables.
- Integrated Claude Haiku for structured-output ingredient substitutions with cost controls (auth-gated, cached, rate-limited, feature-flagged).
