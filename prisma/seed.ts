/**
 * Forkable — Dev Seed
 * Seeds the DB with mock users + recipes from src/lib/mock-data.ts
 *
 * Run: npx tsx prisma/seed.ts
 * Or:  npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Import mock data types (we re-declare locally so this file is standalone)
type MockUser = {
  username: string; displayName: string; avatarUrl: string;
  bio: string; recipeCount: number; forkCount: number; followers: number;
};

const prisma = new PrismaClient();

const USERS: MockUser[] = [
  { username: "shrey",           displayName: "Shrey",           avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=shrey",        bio: "Home cook. Building Forkable.",                      recipeCount: 4,  forkCount: 2,  followers: 38    },
  { username: "nonna_rosa",      displayName: "Nonna Rosa",      avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=nonna_rosa",   bio: "Italian grandmother. 60 years in the kitchen.",      recipeCount: 22, forkCount: 14, followers: 1204  },
  { username: "gluten_free_gary",displayName: "Gluten-Free Gary",avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=gary",         bio: "Making everything GF since 2019.",                   recipeCount: 17, forkCount: 31, followers: 542   },
  { username: "vegan_vivienne",  displayName: "Vivienne Plant",  avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivienne",     bio: "Plant-based chef. Zero compromise on flavor.",       recipeCount: 33, forkCount: 19, followers: 2871  },
  { username: "kenji_tokyo",     displayName: "Kenji Tokyo",     avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji",        bio: "Ramen obsessed. Tokyo → London.",                    recipeCount: 11, forkCount: 8,  followers: 934   },
];

async function main() {
  console.log("🌱 Seeding Forkable database…");

  // 1. Users
  const createdUsers: Record<string, string> = {};
  const devPassword = await bcrypt.hash("devpassword123", 12);

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username:     u.username,
        displayName:  u.displayName,
        email:        `${u.username}@forkable.dev`,
        avatarUrl:    u.avatarUrl,
        bio:          u.bio,
        passwordHash: devPassword,
      },
    });
    createdUsers[u.username] = user.id;
    console.log(`  ✓ User @${u.username}`);
  }

  // 2. Tags
  const TAG_NAMES = [
    "italian", "pasta", "comfort-food", "dinner", "gluten-free", "baking",
    "bread", "sweet", "quick", "vegan", "korean", "spicy", "japanese",
    "ramen", "greek", "mediterranean", "healthy", "breakfast",
  ];

  const tags: Record<string, string> = {};
  for (const name of TAG_NAMES) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, label: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), isGlobal: true },
    });
    tags[name] = tag.id;
  }
  console.log(`  ✓ ${TAG_NAMES.length} tags`);

  // 3. A sample recipe (Mom's Lasagna)
  const lasagna = await prisma.recipe.upsert({
    where: { authorId_slug: { authorId: createdUsers.nonna_rosa, slug: "moms-lasagna" } },
    update: {},
    create: {
      slug:        "moms-lasagna",
      name:        "Mom's Lasagna",
      description: "The definitive layered lasagna. Slow-simmered bolognese, béchamel from scratch, and the secret is resting it for 20 minutes before cutting.",
      imageUrl:    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",
      authorId:    createdUsers.nonna_rosa,
      starCount:   1893,
      forkCount:   247,
      tweakCount:  34,
      servings:    8,
      calories:    620,
      proteinG:    38,
      carbsG:      44,
      fatG:        29,
      fiberG:      3,
      tags: {
        create: ["italian", "pasta", "comfort-food", "dinner"]
          .filter((t) => tags[t])
          .map((t) => ({ tagId: tags[t] })),
      },
    },
  });
  console.log(`  ✓ Recipe: ${lasagna.name}`);

  // 4. Components + steps
  let bolo = await prisma.component.findFirst({
    where: { recipeId: lasagna.id, name: "bolognese-sauce", parentId: null },
  });
  if (!bolo) {
    bolo = await prisma.component.create({
      data: {
        recipeId:    lasagna.id,
        name:        "bolognese-sauce",
        displayName: "Bolognese Sauce",
        type:        "FOLDER",
        order:       0,
      },
    });
  }

  const boloSteps = [
    "Heat olive oil in a heavy-bottomed pot over medium-high heat. Brown the ground beef and pork in batches. Season generously.",
    "Add finely diced onion, carrot, and celery. Cook until softened and golden, about 10 minutes.",
    "Pour in red wine. Scrape up any browned bits and let reduce completely.",
    "Add tinned tomatoes and a splash of whole milk. Simmer on the lowest heat for at least 2 hours.",
    "Taste and season with salt. The bolognese is done when rich and dark.",
  ];

  for (let i = 0; i < boloSteps.length; i++) {
    await prisma.step.upsert({
      where: { id: `seed-bolo-step-${i}` },
      update: { content: boloSteps[i] },
      create: { id: `seed-bolo-step-${i}`, componentId: bolo.id, order: i, content: boloSteps[i] },
    });
  }

  // Initial commit
  await prisma.recipeVersion.upsert({
    where: { id: "seed-lasagna-v1" },
    update: {},
    create: {
      id:        "seed-lasagna-v1",
      recipeId:  lasagna.id,
      authorId:  createdUsers.nonna_rosa,
      message:   "Initial commit",
      additions: 10,
    },
  });

  console.log("✅ Seed complete!");
  console.log("\nDev login credentials:");
  console.log("  Email: shrey@forkable.dev");
  console.log("  Password: devpassword123");
  console.log("  (same password works for all seeded users)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
