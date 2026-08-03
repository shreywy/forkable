// ─── Mock data for Phase 1 UI development ────────────────────────────────────
// No database calls. Replace with real Prisma queries in Phase 2.
import type { RecipeCardData } from "@/lib/types";

/** Convert a MockRecipe to the RecipeCardData shape expected by RecipeCard */
export function toCardData(r: MockRecipe): RecipeCardData {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    author: {
      username: r.owner.username,
      displayName: r.owner.displayName,
      avatarUrl: r.owner.avatarUrl,
    },
    forkedFrom: r.forkedFrom
      ? { ownerUsername: r.forkedFrom.owner, recipeSlug: r.forkedFrom.recipe }
      : null,
    starCount: r.stars,
    forkCount: r.forks,
    tasteTestCount: r.tastings,
    tweakCount: r.tweaks,
    tags: r.tags.map((t) => ({ name: t, label: t })),
    updatedAt: r.updatedAt,
  };
}

export type MockUser = {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  recipeCount: number;
  forkCount: number;
  followers: number;
};

export type MockMacros = {
  servings: number;
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  fiber: number;     // g
};

export type MockRecipe = {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner: MockUser;
  imageUrl: string;
  forkedFrom: { owner: string; recipe: string } | null;
  forks: number;
  tastings: number; // "taste tests" / PRs
  tweaks: number;   // commits
  stars: number;
  tags: string[];
  updatedAt: string;
  components: MockComponent[];
  instructions: { step: number; text: string }[];
  macros: MockMacros;
  ingredientNames: string[]; // flat list for catalog matching
};

export type MockComponent = {
  type: "folder" | "file";
  name: string;
  updatedAt: string;
  lastTweak: string;
  children?: MockComponent[];
  // Sub-recipe steps - only present on folder-type components
  subSteps?: { step: number; text: string }[];
  displayName?: string; // human-friendly label (e.g. "Bolognese Sauce")
};

export type MockTweak = {
  id: string;
  message: string;
  author: MockUser;
  timestamp: string;
  additions: number;
  deletions: number;
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<string, MockUser> = {
  shrey: {
    username: "shrey",
    displayName: "Shrey",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=shrey",
    bio: "Home cook. Building Forkable.",
    recipeCount: 4,
    forkCount: 2,
    followers: 38,
  },
  nonna_rosa: {
    username: "nonna_rosa",
    displayName: "Nonna Rosa",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=nonna_rosa",
    bio: "Italian grandmother. 60 years in the kitchen.",
    recipeCount: 22,
    forkCount: 14,
    followers: 1204,
  },
  gluten_free_gary: {
    username: "gluten_free_gary",
    displayName: "Gluten-Free Gary",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=gary",
    bio: "Making everything GF since 2019.",
    recipeCount: 17,
    forkCount: 31,
    followers: 542,
  },
  vegan_vivienne: {
    username: "vegan_vivienne",
    displayName: "Vivienne Plant",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivienne",
    bio: "Plant-based chef. Zero compromise on flavor.",
    recipeCount: 33,
    forkCount: 19,
    followers: 2871,
  },
  kenji_tokyo: {
    username: "kenji_tokyo",
    displayName: "Kenji Tokyo",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji",
    bio: "Ramen obsessed. Tokyo → London.",
    recipeCount: 11,
    forkCount: 8,
    followers: 934,
  },
};

// ── Recipes ───────────────────────────────────────────────────────────────────

export const MOCK_RECIPES: MockRecipe[] = [
  {
    id: "1",
    slug: "moms-lasagna",
    name: "Mom's Lasagna",
    description:
      "The definitive layered lasagna. Slow-simmered bolognese, béchamel from scratch, and the secret is resting it for 20 minutes before cutting.",
    owner: MOCK_USERS.nonna_rosa,
    imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",
    forkedFrom: null,
    forks: 247,
    tastings: 12,
    tweaks: 34,
    stars: 1893,
    tags: ["italian", "pasta", "comfort-food", "dinner"],
    updatedAt: "2026-07-28",
    components: [
      {
        type: "folder",
        name: "bolognese-sauce",
        displayName: "Bolognese Sauce",
        updatedAt: "2026-07-28",
        lastTweak: "Add splash of milk to finish sauce",
        children: [
          { type: "file", name: "ingredients.json", updatedAt: "2026-07-28", lastTweak: "Add splash of milk to finish sauce" },
          { type: "file", name: "instructions.md",  updatedAt: "2026-07-12", lastTweak: "Clarify browning step" },
        ],
        subSteps: [
          { step: 1, text: "Heat olive oil in a heavy-bottomed pot over medium-high heat. Add the ground beef and pork mince in batches - don't overcrowd. Season generously with salt and pepper and brown deeply, about 6–8 min." },
          { step: 2, text: "Add finely diced onion, carrot, and celery (soffritto). Reduce heat to medium and cook until softened and golden, about 10 minutes." },
          { step: 3, text: "Pour in the red wine. Scrape up any browned bits and let the wine reduce completely, about 3 minutes." },
          { step: 4, text: "Add tinned tomatoes and a splash of whole milk. Stir, cover partially, and simmer on the lowest possible heat for at least 2 hours. The sauce should barely blip." },
          { step: 5, text: "Taste and season with salt. The bolognese is done when it's rich, dark, and the fat has risen to the surface. Set aside." },
        ],
      },
      {
        type: "folder",
        name: "bechamel",
        displayName: "Béchamel",
        updatedAt: "2026-06-14",
        lastTweak: "Increase nutmeg slightly",
        children: [
          { type: "file", name: "ingredients.json", updatedAt: "2026-06-14", lastTweak: "Increase nutmeg slightly" },
          { type: "file", name: "instructions.md",  updatedAt: "2026-05-02", lastTweak: "Initial commit" },
        ],
        subSteps: [
          { step: 1, text: "Melt butter in a medium saucepan over medium heat. Add flour all at once and whisk vigorously for 2 minutes to cook out the raw flour taste." },
          { step: 2, text: "Slowly pour in warm whole milk, a ladleful at a time, whisking constantly to avoid lumps. Once all milk is added, cook stirring until the sauce thickens, about 5–7 minutes." },
          { step: 3, text: "Remove from heat. Season with salt, white pepper, and a generous grating of fresh nutmeg. The béchamel should coat a spoon thickly. Set aside." },
        ],
      },
      {
        type: "folder",
        name: "pasta-sheets",
        displayName: "Fresh Pasta Sheets",
        updatedAt: "2026-05-02",
        lastTweak: "Initial commit",
        children: [
          { type: "file", name: "ingredients.json", updatedAt: "2026-05-02", lastTweak: "Initial commit" },
          { type: "file", name: "instructions.md",  updatedAt: "2026-05-02", lastTweak: "Initial commit" },
        ],
        subSteps: [
          { step: 1, text: "Pile the flour on a clean work surface. Make a well in the centre and crack in the eggs. Use a fork to gradually incorporate the flour from the inner walls." },
          { step: 2, text: "Once the dough comes together, knead by hand for 10 minutes until smooth and elastic. Wrap in cling film and rest at room temperature for 30 minutes." },
          { step: 3, text: "Divide into 4 pieces. Roll each piece through a pasta machine from the widest setting down to setting 5 (or roll by hand to 2mm thickness)." },
          { step: 4, text: "Blanch sheets in a large pot of salted boiling water for 30 seconds. Transfer directly to a bowl of cold water, then lay flat on a clean tea towel." },
        ],
      },
      { type: "file", name: "README.md",        updatedAt: "2026-07-28", lastTweak: "Update hero photo" },
      { type: "file", name: "assembly.md",      updatedAt: "2026-07-01", lastTweak: "Note resting time" },
      { type: "file", name: "macros.json",      updatedAt: "2026-07-01", lastTweak: "Auto-calculated macros" },
    ],
    instructions: [
      { step: 1, text: "Brown the ground beef and pork in a heavy-bottomed pot over medium-high heat. Season generously with salt and pepper." },
      { step: 2, text: "Add finely diced onion, carrot, and celery. Cook until softened, about 8 minutes." },
      { step: 3, text: "Pour in the wine and let it reduce completely. Add crushed tomatoes and a splash of whole milk. Simmer on the lowest heat for at least 2 hours." },
      { step: 4, text: "Make the béchamel: melt butter, whisk in flour, then slowly add warm milk. Season with salt, white pepper, and a grating of nutmeg." },
      { step: 5, text: "Layer: bolognese → pasta → béchamel → repeat. Finish with béchamel and a thick layer of Parmigiano." },
      { step: 6, text: "Bake at 375°F (190°C) for 45 minutes until bubbling and golden. Rest for 20 minutes before cutting - this is non-negotiable." },
    ],
    macros: { servings: 8, calories: 620, protein: 38, carbs: 44, fat: 29, fiber: 3 },
    ingredientNames: ["ground beef", "pork mince", "onion", "carrot", "celery", "red wine", "tinned tomatoes", "whole milk", "butter", "all-purpose flour", "parmigiano reggiano", "pasta", "nutmeg", "salt", "olive oil"],
  },
  {
    id: "2",
    slug: "moms-lasagna-gf",
    name: "Mom's Lasagna (Gluten-Free)",
    description:
      "Gluten-free remix of Nonna Rosa's legendary lasagna. Swapped pasta sheets for rice-flour sheets and used GF flour in the béchamel. Tastes identical.",
    owner: MOCK_USERS.gluten_free_gary,
    imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",
    forkedFrom: { owner: "nonna_rosa", recipe: "moms-lasagna" },
    forks: 41,
    tastings: 3,
    tweaks: 8,
    stars: 312,
    tags: ["italian", "gluten-free", "pasta", "dinner"],
    updatedAt: "2026-07-30",
    components: [],
    instructions: [
      { step: 1, text: "Substitute pasta sheets with rice-flour sheets. Boil until just flexible." },
      { step: 2, text: "Replace all-purpose flour in béchamel with rice flour. Whisk well to avoid lumps." },
      { step: 3, text: "Follow assembly steps from the original recipe." },
    ],
    macros: { servings: 8, calories: 590, protein: 36, carbs: 48, fat: 26, fiber: 4 },
    ingredientNames: ["ground beef", "pork mince", "onion", "carrot", "tinned tomatoes", "whole milk", "butter", "rice flour", "parmigiano reggiano", "gluten-free pasta", "nutmeg", "salt"],
  },
  {
    id: "3",
    slug: "miso-banana-bread",
    name: "Miso Banana Bread",
    description:
      "White miso adds an umami depth that makes this banana bread dangerously addictive. One bowl, no mixer.",
    owner: MOCK_USERS.shrey,
    imageUrl: "https://images.unsplash.com/photo-1605286978633-2dec93ff88a2?w=800&q=80",
    forkedFrom: null,
    forks: 89,
    tastings: 5,
    tweaks: 11,
    stars: 674,
    tags: ["baking", "bread", "sweet", "quick"],
    updatedAt: "2026-08-01",
    components: [],
    instructions: [
      { step: 1, text: "Mash 3 very ripe bananas until smooth. Whisk in white miso, brown sugar, melted butter, eggs, and vanilla." },
      { step: 2, text: "Fold in flour, baking soda, and a pinch of salt. Do not overmix." },
      { step: 3, text: "Pour into a greased loaf pan. Bake at 350°F for 55–60 minutes until a skewer comes out clean." },
    ],
    macros: { servings: 10, calories: 210, protein: 4, carbs: 32, fat: 8, fiber: 2 },
    ingredientNames: ["white miso", "bananas", "butter", "eggs", "vanilla extract", "all-purpose flour", "baking soda", "sugar", "salt"],
  },
  {
    id: "4",
    slug: "green-goddess-pasta",
    name: "Green Goddess Pasta",
    description:
      "Blended basil, spinach, avocado, and lemon create a vibrant no-cook sauce. On the table in 15 minutes.",
    owner: MOCK_USERS.vegan_vivienne,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
    forkedFrom: null,
    forks: 156,
    tastings: 9,
    tweaks: 19,
    stars: 1102,
    tags: ["vegan", "pasta", "quick", "spring"],
    updatedAt: "2026-07-31",
    components: [],
    instructions: [
      { step: 1, text: "Boil pasta in heavily salted water until al dente. Reserve 1 cup pasta water before draining." },
      { step: 2, text: "Blend basil, spinach, avocado, garlic, lemon juice, olive oil, and a pinch of salt until silky smooth." },
      { step: 3, text: "Toss hot pasta with the sauce, adding pasta water a splash at a time until glossy and coated." },
    ],
    macros: { servings: 4, calories: 480, protein: 14, carbs: 68, fat: 18, fiber: 7 },
    ingredientNames: ["pasta", "fresh basil", "spinach", "avocado", "garlic", "lemon juice", "olive oil", "salt"],
  },
  {
    id: "5",
    slug: "tahini-chocolate-chip-cookies",
    name: "Tahini Chocolate Chip Cookies",
    description:
      "Brown butter + tahini + dark chocolate. Crisp edges, chewy center. The best cookie you'll ever make.",
    owner: MOCK_USERS.shrey,
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    forkedFrom: null,
    forks: 203,
    tastings: 17,
    tweaks: 22,
    stars: 1547,
    tags: ["baking", "cookies", "sweet", "snack"],
    updatedAt: "2026-07-25",
    components: [],
    instructions: [
      { step: 1, text: "Brown the butter in a saucepan until nutty and amber. Cool slightly, then whisk in tahini, both sugars, egg, egg yolk, and vanilla." },
      { step: 2, text: "Fold in flour, baking soda, and salt. Stir in dark chocolate chunks. Chill dough 30 minutes." },
      { step: 3, text: "Scoop onto lined baking sheets. Bake at 375°F for 10–12 minutes - they will look underdone. Rest on the pan for 5 minutes." },
    ],
    macros: { servings: 18, calories: 195, protein: 3, carbs: 22, fat: 11, fiber: 1 },
    ingredientNames: ["tahini", "butter", "sugar", "eggs", "all-purpose flour", "baking soda", "chocolate chips", "vanilla extract", "salt"],
  },
  {
    id: "6",
    slug: "smoky-black-bean-tacos",
    name: "Smoky Black Bean Tacos",
    description:
      "Chipotle-spiced black beans with pickled red onion and avocado crema. Weeknight dinner in 20 minutes.",
    owner: MOCK_USERS.vegan_vivienne,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    forkedFrom: null,
    forks: 94,
    tastings: 6,
    tweaks: 13,
    stars: 788,
    tags: ["vegan", "mexican", "tacos", "quick"],
    updatedAt: "2026-07-20",
    components: [],
    instructions: [
      { step: 1, text: "Drain and rinse black beans. Sauté in a pan with chipotle in adobo, cumin, garlic powder, and a pinch of smoked paprika for 5 minutes." },
      { step: 2, text: "Thinly slice red onion and pickle in lime juice, a pinch of salt, and sugar for 15 minutes." },
      { step: 3, text: "Blend avocado with lime juice, garlic, and a splash of water until smooth. Season to taste." },
      { step: 4, text: "Warm corn tortillas directly on a gas flame or dry pan. Fill with beans, pickled onion, and avocado crema." },
    ],
    macros: { servings: 4, calories: 340, protein: 12, carbs: 52, fat: 10, fiber: 12 },
    ingredientNames: ["black beans", "avocado", "lime juice", "red onion", "chipotle", "cumin", "smoked paprika", "garlic", "salt", "sugar", "corn tortillas"],
  },
  {
    id: "7",
    slug: "tonkotsu-ramen",
    name: "Tonkotsu Ramen",
    description:
      "A 12-hour pork bone broth that's milky-white and impossibly rich. Topped with chashu, soft-boiled eggs, nori, and green onion.",
    owner: MOCK_USERS.kenji_tokyo,
    imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
    forkedFrom: null,
    forks: 312,
    tastings: 28,
    tweaks: 41,
    stars: 3102,
    tags: ["japanese", "soup", "ramen", "weekend"],
    updatedAt: "2026-07-29",
    components: [],
    instructions: [
      { step: 1, text: "Blanch pork bones in boiling water for 10 minutes. Drain, rinse under cold water, and scrub clean." },
      { step: 2, text: "Roast bones at 425°F for 30 minutes until golden. Transfer to a large stockpot with water, ginger, and garlic. Boil hard - the hard boil is what makes the broth turn milky white." },
      { step: 3, text: "Simmer for 10–12 hours, topping up water as needed. Strain through a fine mesh sieve." },
      { step: 4, text: "Cook ramen noodles separately. Season broth with tare (2 tbsp soy, 1 tbsp mirin, 1 tbsp sake per bowl). Top with chashu, marinated egg, nori, menma, and scallions." },
    ],
    macros: { servings: 4, calories: 720, protein: 52, carbs: 58, fat: 28, fiber: 2 },
    ingredientNames: ["pork bones", "ginger", "garlic", "soy sauce", "mirin", "sake", "ramen noodles", "eggs", "nori", "scallions", "sesame oil"],
  },
  {
    id: "8",
    slug: "greek-yogurt-pancakes",
    name: "Greek Yogurt Pancakes",
    description:
      "Fluffy, protein-packed pancakes that taste indulgent but are made with Greek yogurt. Crisp edges, cloud-soft center.",
    owner: MOCK_USERS.shrey,
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
    forkedFrom: null,
    forks: 67,
    tastings: 4,
    tweaks: 9,
    stars: 521,
    tags: ["breakfast", "quick", "sweet", "high-protein"],
    updatedAt: "2026-07-27",
    components: [],
    instructions: [
      { step: 1, text: "Whisk together 1 cup Greek yogurt, 2 eggs, 1 tsp vanilla, and 2 tbsp maple syrup." },
      { step: 2, text: "Fold in ¾ cup flour, 1 tsp baking powder, and a pinch of salt. Don't overmix - lumps are fine." },
      { step: 3, text: "Cook on a buttered non-stick pan over medium-low heat. Flip when bubbles form and edges look set, about 2–3 minutes per side." },
    ],
    macros: { servings: 8, calories: 145, protein: 8, carbs: 18, fat: 4, fiber: 1 },
    ingredientNames: ["greek yogurt", "eggs", "all-purpose flour", "baking powder", "maple syrup", "vanilla extract", "butter", "salt"],
  },
  {
    id: "9",
    slug: "thai-green-curry",
    name: "Thai Green Curry",
    description:
      "Fragrant, creamy, and deeply spiced. Homemade green curry paste makes all the difference - it only takes 10 minutes in a blender.",
    owner: MOCK_USERS.vegan_vivienne,
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    forkedFrom: null,
    forks: 178,
    tastings: 11,
    tweaks: 16,
    stars: 1342,
    tags: ["thai", "vegan", "curry", "dinner"],
    updatedAt: "2026-07-26",
    components: [],
    instructions: [
      { step: 1, text: "Blend lemongrass, green chilies, galangal, kaffir lime zest, cilantro roots, shallots, and garlic into a smooth paste." },
      { step: 2, text: "Fry paste in coconut oil for 2 minutes until fragrant. Add coconut milk and bring to a gentle simmer." },
      { step: 3, text: "Add vegetables (zucchini, baby corn, bell pepper) and simmer 8 minutes. Season with fish sauce (or soy) and palm sugar." },
      { step: 4, text: "Serve over jasmine rice. Garnish with thai basil and thinly sliced red chili." },
    ],
    macros: { servings: 4, calories: 410, protein: 8, carbs: 32, fat: 28, fiber: 5 },
    ingredientNames: ["coconut milk", "lemongrass", "green chilies", "galangal", "garlic", "shallots", "zucchini", "baby corn", "bell pepper", "soy sauce", "jasmine rice", "thai basil", "lime juice", "coconut oil"],
  },
];

// ── Cookbooks (saved recipe collections, like GitHub Stars lists) ─────────────
export type MockCookbook = {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner: string; // username
  recipeIds: string[];
  isPublic: boolean;
  followers: number;
};

export const MOCK_COOKBOOKS: MockCookbook[] = [
  {
    id: "cb1",
    slug: "weeknight-wins",
    name: "Weeknight Wins",
    description: "Quick, reliable dinners I can make after work without thinking.",
    owner: "shrey",
    recipeIds: ["3", "6", "9"],
    isPublic: true,
    followers: 24,
  },
  {
    id: "cb2",
    slug: "baking-experiments",
    name: "Baking Experiments",
    description: "Recipes I'm actively tinkering with. Expect forks.",
    owner: "shrey",
    recipeIds: ["5", "3"],
    isPublic: true,
    followers: 11,
  },
  {
    id: "cb3",
    slug: "plant-based-staples",
    name: "Plant-Based Staples",
    description: "The recipes I cook on rotation - all vegan, all crowd-pleasers.",
    owner: "vegan_vivienne",
    recipeIds: ["4", "6", "9"],
    isPublic: true,
    followers: 312,
  },
  {
    id: "cb4",
    slug: "ramen-deep-dive",
    name: "Ramen Deep Dive",
    description: "Every ramen recipe worth making. Sorted by broth type.",
    owner: "kenji_tokyo",
    recipeIds: ["7"],
    isPublic: true,
    followers: 88,
  },
];

// ── Taste Tests (comments + PR-style suggestions) ─────────────────────────────
export type MockTasteTest = {
  id: string;
  type: "comment" | "suggestion";
  author: MockUser;
  timestamp: string;
  // comment fields
  body?: string;
  rating?: number; // 1–5 forks
  // suggestion (PR) fields
  title?: string;
  diff?: { ingredient: string; from: string; to: string }[];
  status?: "open" | "merged" | "closed";
};

export const MOCK_TASTE_TESTS: MockTasteTest[] = [
  {
    id: "tt1",
    type: "suggestion",
    author: MOCK_USERS.gluten_free_gary,
    timestamp: "2026-07-30",
    title: "Swap pasta sheets for rice-flour sheets",
    diff: [
      { ingredient: "pasta sheets", from: "250g semolina pasta sheets", to: "250g rice-flour pasta sheets" },
      { ingredient: "flour (béchamel)", from: "30g all-purpose flour", to: "30g rice flour" },
    ],
    status: "open",
  },
  {
    id: "tt2",
    type: "comment",
    author: MOCK_USERS.vegan_vivienne,
    timestamp: "2026-07-22",
    body: "Made this last Sunday for the family. The 20-minute resting time is absolutely non-negotiable - cut into it early once and regretted it. 10/10 recipe, Nonna Rosa.",
    rating: 5,
  },
  {
    id: "tt3",
    type: "suggestion",
    author: MOCK_USERS.shrey,
    timestamp: "2026-07-15",
    title: "Add fresh basil to bolognese finish",
    diff: [
      { ingredient: "fresh basil", from: "(not present)", to: "handful of fresh basil, torn, added off heat" },
    ],
    status: "closed",
  },
  {
    id: "tt4",
    type: "comment",
    author: MOCK_USERS.kenji_tokyo,
    timestamp: "2026-07-10",
    body: "Tried the béchamel with a bit more nutmeg after Tweak #4 - agree completely, it makes a real difference. Also added a pinch of cayenne.",
    rating: 4,
  },
  {
    id: "tt5",
    type: "comment",
    author: MOCK_USERS.gluten_free_gary,
    timestamp: "2026-06-28",
    body: "Any reason you use a mix of beef and pork? Curious if all-beef works. I've had great GF results with just beef.",
    rating: undefined,
  },
];

export const MOCK_TWEAKS: MockTweak[] = [
  {
    id: "t1",
    message: "Add splash of milk to finish bolognese",
    author: MOCK_USERS.nonna_rosa,
    timestamp: "2026-07-28",
    additions: 2,
    deletions: 0,
  },
  {
    id: "t2",
    message: "Note resting time before cutting",
    author: MOCK_USERS.nonna_rosa,
    timestamp: "2026-07-01",
    additions: 1,
    deletions: 0,
  },
  {
    id: "t3",
    message: "Auto-calculated macro values",
    author: MOCK_USERS.nonna_rosa,
    timestamp: "2026-07-01",
    additions: 12,
    deletions: 0,
  },
  {
    id: "t4",
    message: "Increase nutmeg in béchamel",
    author: MOCK_USERS.nonna_rosa,
    timestamp: "2026-06-14",
    additions: 1,
    deletions: 1,
  },
  {
    id: "t5",
    message: "Clarify meat browning step",
    author: MOCK_USERS.nonna_rosa,
    timestamp: "2026-06-12",
    additions: 3,
    deletions: 1,
  },
];
