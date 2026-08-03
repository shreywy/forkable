# Forkable — Project Brain

> Claude reads and updates this file to maintain context across sessions. If returning after a break, start here.

## What We're Building

**Forkable** is a version control platform for recipes. Think "friendly yellow GitHub for cooks."

| Git Concept | Forkable Concept |
|---|---|
| Repository | Recipe (e.g., `shrey/moms-lasagna`) |
| README.md | Hero image + description + story |
| Folders | Components (`/sauce`, `/cheese-blend`) |
| Files | `ingredients.json` & `instructions.md` |
| Commit | Tweak (manual save with a message) |
| Fork | Remix (copy to your profile) |
| Pull Request | Taste Test (suggest changes to original, with visual diff) |

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | |
| Styling | Tailwind CSS + shadcn/ui | |
| Database | PostgreSQL via Neon.tech | Free tier |
| ORM | Prisma | |
| Auth | NextAuth.js | |
| Storage | Cloudflare R2 or AWS S3 | Recipe images |
| Macros API | OpenFoodFacts (free) or Edamam | Phase 4, added later |

## Design Brief

- **Theme:** Mellow yellow (`#F5C518` range) + white + warm grays. Friendly GitHub.
- **Confirm styling to a tee before any backend code.**
- **Phase 1 uses mock JSON data only — no DB calls.**

## Development Phases

| Phase | Name | Status |
|---|---|---|
| 0 | Workspace Initialization | ✅ Complete |
| 1 | UI/UX & Theming (static shells, mock data) | 🔄 In progress — awaiting user styling approval |
| 2 | Database & Architecture (schema, Neon setup) | ⏳ Blocked on Phase 1 approval |
| 3 | Core Git Logic (commits, forks, diffs) | ⏳ Blocked on Phase 2 |
| 4 | Cook Mode + Macro API | ⏳ Blocked on Phase 3 |
| 5 | Seeding (fake users + parsed recipes) | ⏳ Blocked on Phase 4 |

## Rules

1. **Never skip a phase.** Get explicit confirmation before moving forward.
2. **No Prisma/DB code during Phase 1** — mock data only.
3. **Bite-sized code** — one component or file at a time.
4. **Do not add Claude as a Git contributor** when the repo is set up.
5. **Update this file** at the end of every major step.

## Current Sprint

**Phase 1 — UI/UX Styling**
Goal: Get user sign-off on colors, layout, and component feel before any backend work.
Awaiting feedback on: hero section, recipe cards, repo/recipe page with file tree.

## Completed Features

- ✅ Next.js 16 + Turbopack bootstrapped
- ✅ Tailwind CSS v4 + shadcn/ui v4 (Base UI) installed
- ✅ Mellow yellow theme — brand yellow `oklch(0.83 0.17 88)` ≈ `#F5C518`
- ✅ Dark mode — neutral gray (`oklch(0.18 0 0)`, not pitch black) + yellow accent only; animated moon/sun toggle
- ✅ Navbar with logo, search, New dropdown, notification bell, theme toggle, user avatar menu
- ✅ Homepage: hero (no pill tag), genre category grid (8 categories), Trending + Discover grids
- ✅ Recipe page: file tree, instructions (numbered steps), macros panel (5-column grid), sidebar stats
- ✅ Profile page: gradient banner (inline CSS, dark-mode safe), pinned recipes, **Cookbooks** section, social links (GH/X/IG/web), stats sidebar, Recipes/Cookbooks/Forks/Starred tabs
- ✅ Explore page: search bar, tag filter pills, all-recipes grid, cookbooks grid, cooks-to-follow cards
- ✅ Trending page: time filter bar, leaderboards (Most Starred / Most Forked / Most Tweaked), Hot Right Now card grid
- ✅ Mock data — 9 recipes, 5 users, 4 cookbooks ("Weeknight Wins", "Baking Experiments", "Plant-Based Staples", "Ramen Deep Dive")
- ✅ `next.config.ts` — Unsplash + DiceBear image domains whitelisted
- ✅ Ingredient catalog (Explore) — % match engine, "What's in your fridge?" banner, tiered recipe results (Perfect/Almost/Worth a look), smart ingredient search
- ✅ New recipe wizard — `TagSelector` (custom + common tags), `StepEditor` (markdown toolbar + preview), `NUTRITION_DB` + `estimateMacros()` for OpenFoodFacts-style estimate
- ✅ `StepEditor` component — Bold/Italic/Code/Bullet/Numbered toolbar, edit/preview toggle, cursor-aware `insertAt`/`insertLine`
- ✅ Cook mode — pre-flight sub-component screen ("Do you already have bolognese ready?"), merged step queue, section-separated sidebar
- ✅ Mock data — `subSteps[]` + `displayName` added to `MockComponent` for lasagna sub-folders (bolognese, béchamel, pasta sheets)
- ✅ Login page — email/password + Google SSO (simulated), show password toggle
- ✅ Signup page — display name, username (auto-generated), email, password with strength meter
- ✅ Onboarding wizard — 5-step: profile photo + avatar picker, bio/location/social links, taste profile (cuisine/dietary/style tags), theme picker, who to follow
- ✅ Navbar — `DEMO_LOGGED_IN` flag, logged-out state shows Sign in / Sign up buttons; Sign out routes to `/login`
- ✅ Feed, Notifications, Cookbooks/new, Recipe edit, Followers/Following pages

## Key Decisions Log

- User prefers manual "commit" flow (user sets a message when they save), not auto-save on publish.
- Macros via free API (OpenFoodFacts / Edamam) — not LLM, added in Phase 4.
- Repo-style URL structure: `forkable.com/[username]/[recipe-slug]/tree/main/[component]`
- Styling confirmed BEFORE any backend work starts.
- Dark theme: warm charcoal (`oklch(0.13)`) + yellow accents. Moon/sun animated toggle in navbar.
- CLI interface (`forkable` CLI like `git` or `clasp`) — noted for much later, post-MVP.

## Planned Features (log before Phase 2)

### Recipe Collections — "Cookbooks" (Phase 3+)
Git-themed name for saved recipe playlists. Tentative name: **Cookbooks** (or "Branches"?).
- Users can create named collections: e.g. "Desserts", "Sunday Roasts", "High Protein"
- Displayed on profile page as a dedicated section/tab
- Each cookbook has a cover image (first recipe's photo), name, description, recipe count
- Other users can follow/fork a cookbook
- URL: `/[username]/cookbooks/[cookbook-slug]`

### Taste Tests = Comments + Reviews (Phase 3+)
"Taste Test" serves dual purpose:
1. **Suggestions (PR-style)**: a proposed change to the recipe with a diff (the original concept)
2. **Comments/Reviews**: regular text comment + optional star rating (1–5 forks? 🍴)
Both live under the "Taste Tests" tab. Keep them visually distinct (suggestion = diff card, review = comment bubble).

### Nested Instructions + Sub-recipe Links (Phase 3+)
Instructions need richer structure:
- **Sub-steps**: a step can have nested children (e.g. "Make the béchamel" → 3 sub-steps)
- **Sub-recipe links**: a step can link to another recipe page (e.g. "Make the pasta sheets" → links to `/nonna_rosa/fresh-pasta-sheets`)
- DB schema: `instruction_steps` table with `parent_step_id` (nullable) for nesting + `linked_recipe_id` (nullable) for cross-links
- UI: collapsible sub-steps, linked recipes shown as inline cards

### CLI Interface — `forkable` (Far future, post-MVP)
Like `git` or `clasp`. `forkable init`, `forkable commit -m "reduced sugar"`, `forkable fork nonna_rosa/moms-lasagna`.
Note for later: explore building with Node.js + `commander` or `oclif`.

## Ingredient Catalog (Phase 4+)

A dedicated tab/page (`/ingredients` or `/catalog`), NOT a homepage search. Design:

- **Master catalog**: every ingredient added to any recipe auto-joins the catalog.
- **Git-style UI**: browse, search, and view ingredient "commits" (who added it, when, with what macros).
- **Recipe creation flow**: when authoring a recipe, user searches the catalog to add ingredients. If ingredient doesn't exist, they create it — confirming macro data (from OpenFoodFacts API, editable).
- **Confirmed macros**: each catalog entry has verified nutrition data (calories, protein, carbs, fat, fiber per 100g) and a source (API-pulled or manually entered).
- **URL**: `/ingredients/[slug]` for individual ingredient pages.
- This powers the dynamic "what's in my fridge" search (Phase 5+): query the catalog by ingredient → find recipes containing it.

## Database Schema (Phase 2 — not started)

_TBD after UI approval._

## Environment Variables Needed (fill in as you go)

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```
