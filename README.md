<div align="center">

# Forkable

**Version control for recipes.**

Think GitHub — but for cooks. Fork recipes, commit tweaks, open Taste Tests (pull requests), and cook step-by-step.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Prisma](https://img.shields.io/badge/Prisma_v5-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![NextAuth](https://img.shields.io/badge/NextAuth_v5-purple)](https://authjs.dev)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2)

![Forkable homepage](public/screenshots/homepage.png)

</div>

---

## The Concept

Every git concept maps to something in the kitchen:

| Git | Forkable |
|-----|----------|
| Repository | Recipe (`shrey/moms-lasagna`) |
| README | Hero image + story |
| Folders | Components (`/bolognese-sauce`, `/bechamel`) |
| Files | `ingredients.json` + `instructions.md` |
| Commit | Tweak — save with a message |
| Fork | Remix — copy to your profile |
| Pull Request | Taste Test — suggest changes with a visual diff |

---

## Screenshots

<table>
<tr>
<td width="50%">

**Recipe page** — GitHub-style file tree, macros panel, sidebar stats

![Recipe page](public/screenshots/recipe-page.png)

</td>
<td width="50%">

**Profile page** — gradient banner, pinned recipes, follow stats

![Profile page](public/screenshots/profile-page.png)

</td>
</tr>
<tr>
<td width="50%">

**Cook mode** — pre-flight sub-component check ("Do you already have the bechamel?"), merged step queue with timer detection and F/C toggle

![Cook mode](public/screenshots/cook-mode.png)

</td>
<td width="50%">

**Recipe import** — extracts schema.org JSON-LD from recipe URLs. Works with BBC Good Food, Bon Appetit, RecipeTin Eats and more. No LLM, no paid APIs.

![Import page](public/screenshots/homepage.png)

</td>
</tr>
</table>

---

## Tech Stack

### Frontend
- **Next.js 16** App Router — Server Components, Server Actions, ISR, dynamic routes
- **TypeScript** strict mode throughout
- **Tailwind CSS v4** + **shadcn/ui** — custom mellow-yellow design system
- **next-themes** — dark mode default with animated toggle

### Backend & Data
- **PostgreSQL** on [Neon.tech](https://neon.tech) — serverless with auto-suspend
- **Prisma v5** — 15-model schema with denormalized counters (`starCount`, `forkCount`) for O(1) reads, updated atomically via `prisma.$transaction`
- **NextAuth v5** — Google OAuth + Credentials (bcrypt, 12 rounds), JWT sessions with type-safe augmentation
- **Cloudflare R2** — S3-compatible image storage via presigned PUT URLs
- **OpenFoodFacts API** — free nutrition data proxy with 30-day DB caching

### Notable Patterns
- **Zero-LLM recipe import** — extracts `@type: "Recipe"` schema.org JSON-LD from recipe site HTML; handles `@graph` arrays, `HowToSection` groups, and unquoted HTML attributes
- **Server Actions + Zod** validation on every write
- **Deep fork transaction** — `forkRecipe()` copies all components, steps, and ingredients atomically
- **Cook mode step merging** — detects sub-component folders, asks which you have prepped, builds a merged ordered step queue

---

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — trending and discover grids |
| `/explore` | Search + tag filters + "What's in your fridge?" ingredient match engine |
| `/trending` | Time-filtered leaderboards (most starred / forked / tweaked) |
| `/feed` | Activity feed from followed cooks |
| `/[username]` | Profile — recipes, cookbooks, forks, starred tabs |
| `/[username]/[recipe]` | Recipe — file tree, instructions, macros, taste tests |
| `/[username]/[recipe]/cook` | Cook mode — guided steps with sub-component pre-flight |
| `/[username]/[recipe]/edit` | Recipe editor with markdown toolbar and live preview |
| `/import` | URL import (JSON-LD) + text paste fallback |
| `/new` | New recipe wizard — tags, step editor, macro estimator |

---

## Database Schema

15 Prisma models across 4 domains:

```
Auth:    User · Account · Session · VerificationToken
Recipe:  Recipe · RecipeVersion · Component · Step · Ingredient · ComponentIngredient
Social:  Star · Fork · Follow · Cookbook · CookbookRecipe
Comms:   TasteTest · Tag · RecipeTag · Notification
```

Key design decisions:
- **RecipeVersion** snapshots the full recipe as JSON on every tweak (commit history)
- **Step** has `parentStepId` for nested sub-steps and `linkedRecipeId` for cross-recipe links
- **TasteTest** is dual-purpose: `COMMENT` (review + rating) or `SUGGESTION` (PR-style diff with merge/close)
- Counters (`starCount`, `forkCount`, `tweakCount`) are denormalized on Recipe for O(1) reads

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Neon.tech](https://neon.tech) PostgreSQL database (free tier is fine)

### Setup

```bash
git clone https://github.com/shreywy/forkable.git
cd forkable
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET in .env.local
```

```bash
npm run db:migrate    # push schema to Neon
npm run db:seed       # seed 5 users + sample lasagna recipe
npm run dev
```

Dev credentials: `shrey@forkable.dev` / `devpassword123`

### npm Scripts

```bash
npm run db:migrate    # prisma migrate dev
npm run db:push       # prisma db push (no migration file)
npm run db:seed       # tsx prisma/seed.ts
npm run db:studio     # prisma studio GUI
npm run db:generate   # prisma generate
```

---

## Roadmap

- [x] 25-route full UI with dark theme and mock data
- [x] 15-model Prisma schema + migrations
- [x] NextAuth v5 (Google OAuth + Credentials)
- [x] Server Actions with Zod validation
- [x] Cloudflare R2 presigned image upload
- [x] OpenFoodFacts nutrition proxy with DB caching
- [x] Zero-LLM recipe URL import
- [ ] Wire all pages to real DB (homepage, recipe, profile, explore, feed)
- [ ] Taste Test diff view
- [ ] Real-time notifications (Pusher / SSE)
- [ ] Ingredient catalog pages (`/ingredients/[slug]`)
- [ ] Full Taste Test flow (comments, suggestions, merge)

---

<div align="center">

Built by [Shrey](https://github.com/shreywy) &nbsp;·&nbsp; Recipes licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

</div>
