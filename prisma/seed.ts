/**
 * Forkable — Comprehensive Dev Seed
 * 8 realistic users, 20+ base recipes, 15+ forks, real ingredients & steps
 *
 * Run: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  {
    username: "marco_cucina",
    displayName: "Marco Bianchi",
    email: "marco@forkable.dev",
    bio: "Third-generation Bolognese cook. Nonno taught me everything. Pasta from scratch only.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=marco_cucina",
    bannerUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    location: "Bologna, Italy",
    cuisineTags: ["italian", "mediterranean"],
    styleTags: ["from-scratch", "traditional"],
  },
  {
    username: "sarah_bakes",
    displayName: "Sarah Chen",
    email: "sarah@forkable.dev",
    bio: "Pastry chef turned home baker. Sourdough evangelist. I test every recipe three times.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=sarah_bakes",
    bannerUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80",
    location: "San Francisco, CA",
    cuisineTags: ["baking", "french"],
    styleTags: ["precise", "sweet"],
  },
  {
    username: "kenji_noodles",
    displayName: "Kenji Yamamoto",
    email: "kenji@forkable.dev",
    bio: "Ramen obsessed. Moved from Tokyo to London and couldn't find a decent bowl. So I learned.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=kenji_noodles",
    bannerUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80",
    location: "London, UK",
    cuisineTags: ["japanese", "korean", "asian"],
    styleTags: ["umami", "noodles"],
  },
  {
    username: "raj_spice",
    displayName: "Raj Patel",
    email: "raj@forkable.dev",
    bio: "Mumbai street food to fine dining. Every recipe has a story. Spice is not just heat.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=raj_spice",
    bannerUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80",
    location: "Mumbai, India",
    cuisineTags: ["indian", "south-asian"],
    styleTags: ["spicy", "aromatic"],
  },
  {
    username: "vivi_verde",
    displayName: "Vivienne Laurent",
    email: "vivi@forkable.dev",
    bio: "Plant-based since 2018. Zero compromise on flavor. Fork any recipe and I will vegan-ify it.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=vivi_verde",
    bannerUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
    location: "Amsterdam, Netherlands",
    cuisineTags: ["vegan", "mediterranean"],
    styleTags: ["healthy", "plant-based"],
  },
  {
    username: "tex_bbq",
    displayName: "Travis Holt",
    email: "travis@forkable.dev",
    bio: "Austin pitmaster. Low and slow is the only way. Competition BBQ since 2011.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=tex_bbq",
    bannerUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
    location: "Austin, TX",
    cuisineTags: ["american", "bbq"],
    styleTags: ["smoky", "low-and-slow"],
  },
  {
    username: "maite_mx",
    displayName: "Maite Reyes",
    email: "maite@forkable.dev",
    bio: "Oaxacan food is the soul of Mexico. Mole takes three days and is worth every minute.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=maite_mx",
    bannerUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=1200&q=80",
    location: "Oaxaca, Mexico",
    cuisineTags: ["mexican", "latin"],
    styleTags: ["bold", "traditional"],
  },
  {
    username: "chef_alex",
    displayName: "Alex Rousseau",
    email: "alex@forkable.dev",
    bio: "Classically trained in Lyon. Cooking school dropout turned food content creator.",
    avatarUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=chef_alex",
    bannerUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    location: "Lyon, France",
    cuisineTags: ["french", "european"],
    styleTags: ["classical", "technique"],
  },
];

// ─── Tags ─────────────────────────────────────────────────────────────────────

const TAGS: { name: string; label: string }[] = [
  { name: "italian", label: "Italian" },
  { name: "pasta", label: "Pasta" },
  { name: "comfort-food", label: "Comfort Food" },
  { name: "dinner", label: "Dinner" },
  { name: "gluten-free", label: "Gluten Free" },
  { name: "baking", label: "Baking" },
  { name: "bread", label: "Bread" },
  { name: "sweet", label: "Sweet" },
  { name: "quick", label: "Quick (30 min)" },
  { name: "vegan", label: "Vegan" },
  { name: "vegetarian", label: "Vegetarian" },
  { name: "japanese", label: "Japanese" },
  { name: "korean", label: "Korean" },
  { name: "spicy", label: "Spicy" },
  { name: "ramen", label: "Ramen" },
  { name: "indian", label: "Indian" },
  { name: "curry", label: "Curry" },
  { name: "mexican", label: "Mexican" },
  { name: "french", label: "French" },
  { name: "american", label: "American" },
  { name: "bbq", label: "BBQ" },
  { name: "breakfast", label: "Breakfast" },
  { name: "soup", label: "Soup" },
  { name: "salad", label: "Salad" },
  { name: "seafood", label: "Seafood" },
  { name: "chicken", label: "Chicken" },
  { name: "beef", label: "Beef" },
  { name: "pork", label: "Pork" },
  { name: "dessert", label: "Dessert" },
  { name: "high-protein", label: "High Protein" },
  { name: "low-carb", label: "Low Carb" },
  { name: "mediterranean", label: "Mediterranean" },
  { name: "thai", label: "Thai" },
  { name: "one-pot", label: "One Pot" },
  { name: "meal-prep", label: "Meal Prep" },
];

// ─── Recipes ──────────────────────────────────────────────────────────────────

type IngredientEntry = {
  name: string;
  slug: string;
  amount?: number;
  unit?: string;
  preparation?: string;
  isOptional?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
};

type ComponentDef = {
  name: string;
  displayName: string;
  type: "FOLDER" | "FILE";
  order: number;
  ingredients: IngredientEntry[];
  steps: string[];
};

type RecipeDef = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  authorKey: string;
  tags: string[];
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  starCount: number;
  forkCount: number;
  tweakCount: number;
  components: ComponentDef[];
};

const RECIPES: RecipeDef[] = [
  // ── marco_cucina ──────────────────────────────────────────────────────────
  {
    slug: "cacio-e-pepe",
    name: "Cacio e Pepe",
    description: "Three ingredients. Infinite technique. The Roman pasta that humbles every chef who underestimates it.",
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    authorKey: "marco_cucina",
    tags: ["italian", "pasta", "quick", "vegetarian"],
    servings: 2,
    calories: 580,
    proteinG: 22,
    carbsG: 72,
    fatG: 24,
    fiberG: 3,
    starCount: 2841,
    forkCount: 312,
    tweakCount: 45,
    components: [
      {
        name: "pasta",
        displayName: "Pasta",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Spaghetti", slug: "spaghetti", amount: 200, unit: "g", calories: 131, protein: 5, carbs: 26, fat: 0.5, fiber: 1.8 },
          { name: "Pecorino Romano", slug: "pecorino-romano", amount: 80, unit: "g", preparation: "finely grated", calories: 387, protein: 25, carbs: 0, fat: 31, fiber: 0 },
          { name: "Parmigiano Reggiano", slug: "parmigiano-reggiano", amount: 40, unit: "g", preparation: "finely grated", calories: 392, protein: 36, carbs: 0, fat: 26, fiber: 0 },
          { name: "Black pepper", slug: "black-pepper", amount: 2, unit: "tsp", preparation: "coarsely cracked", calories: 6, protein: 0.2, carbs: 1.5, fat: 0.1, fiber: 0.5 },
          { name: "Pasta water", slug: "pasta-water", amount: 100, unit: "ml" },
        ],
        steps: [
          "Bring a large pot of lightly salted water to a boil. (Less salt than usual — the Pecorino is very salty.)",
          "Toast the cracked black pepper in a dry wide skillet over medium heat for 60 seconds until fragrant. Remove to a small bowl.",
          "Cook spaghetti 2 minutes less than the package says. It will finish cooking in the sauce.",
          "Reserve at least 1 cup of pasta water before draining.",
          "Add the pepper back to the pan, splash in 1/4 cup pasta water, bring to a gentle simmer.",
          "Add the drained pasta and toss continuously. Add more pasta water a splash at a time.",
          "Remove from heat. Add the grated cheeses in 3 batches, tossing vigorously between each addition. The residual heat melts the cheese. If it seizes up, add a tiny splash of warm pasta water.",
          "Serve immediately in warmed bowls. Add extra cheese and pepper at the table.",
        ],
      },
    ],
  },
  {
    slug: "ribollita",
    name: "Ribollita",
    description: "Tuscan bread soup meant to be made the day before and 're-boiled' the next day. Gets better every time.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    authorKey: "marco_cucina",
    tags: ["italian", "soup", "vegan", "comfort-food", "meal-prep"],
    servings: 6,
    calories: 310,
    proteinG: 14,
    carbsG: 48,
    fatG: 8,
    fiberG: 12,
    starCount: 1204,
    forkCount: 89,
    tweakCount: 22,
    components: [
      {
        name: "soffritto",
        displayName: "Soffritto Base",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Olive oil", slug: "olive-oil", amount: 4, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "large", preparation: "diced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Carrot", slug: "carrot", amount: 2, unit: "medium", preparation: "diced", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
          { name: "Celery", slug: "celery", amount: 3, unit: "stalks", preparation: "diced", calories: 16, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6 },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "thinly sliced", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
        ],
        steps: [
          "Heat olive oil in a large heavy pot over medium heat. Add onion and a pinch of salt. Cook 10 minutes until soft.",
          "Add carrot and celery. Cook another 10 minutes. Add garlic, cook 2 more minutes.",
        ],
      },
      {
        name: "soup",
        displayName: "Soup",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Canned whole tomatoes", slug: "canned-whole-tomatoes", amount: 400, unit: "g", calories: 18, protein: 0.9, carbs: 3.5, fat: 0.2, fiber: 1.1 },
          { name: "Cannellini beans", slug: "cannellini-beans", amount: 400, unit: "g", preparation: "drained and rinsed", calories: 337, protein: 23, carbs: 60, fat: 0.9, fiber: 17 },
          { name: "Cavolo nero", slug: "cavolo-nero", amount: 200, unit: "g", preparation: "stems removed, torn", calories: 35, protein: 2.2, carbs: 4.4, fat: 0.5, fiber: 2 },
          { name: "Stale crusty bread", slug: "stale-bread", amount: 200, unit: "g", preparation: "torn into chunks", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
          { name: "Vegetable stock", slug: "vegetable-stock", amount: 1.5, unit: "L", calories: 5, protein: 0.1, carbs: 1, fat: 0, fiber: 0 },
          { name: "Rosemary", slug: "rosemary", amount: 2, unit: "sprigs" },
          { name: "Parmesan rind", slug: "parmesan-rind", amount: 1, unit: "piece", isOptional: true },
        ],
        steps: [
          "Crush tomatoes into the soffritto by hand. Add rosemary sprigs and Parmesan rind if using.",
          "Add half the beans whole. Puree the other half with a little stock and add it too — this thickens the soup naturally.",
          "Pour in stock. Bring to a boil, then reduce to a gentle simmer for 30 minutes.",
          "Add cavolo nero, simmer 15 more minutes until completely tender.",
          "Add bread, stir gently. Simmer 5 more minutes. The bread should partially melt into the soup.",
          "Season with salt. Leave to cool overnight.",
          "The next day: re-boil (ribollita means 're-boiled'). Adjust consistency with water or stock. Finish with a generous pour of your best olive oil.",
        ],
      },
    ],
  },

  // ── sarah_bakes ────────────────────────────────────────────────────────────
  {
    slug: "sourdough-country-loaf",
    name: "Sourdough Country Loaf",
    description: "A 75% hydration open-crumb country loaf. My starter is named Gerald. He is 4 years old.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["baking", "bread", "vegan"],
    servings: 12,
    calories: 180,
    proteinG: 6,
    carbsG: 36,
    fatG: 1,
    fiberG: 2,
    starCount: 3201,
    forkCount: 445,
    tweakCount: 78,
    components: [
      {
        name: "levain",
        displayName: "Levain (Pre-Ferment)",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Sourdough starter", slug: "sourdough-starter", amount: 20, unit: "g", preparation: "active, ripe", calories: 197, protein: 6.4, carbs: 40, fat: 0.8, fiber: 1.8 },
          { name: "Bread flour", slug: "bread-flour", amount: 100, unit: "g", calories: 361, protein: 12, carbs: 72, fat: 1.2, fiber: 2.4 },
          { name: "Water", slug: "water-warm", amount: 100, unit: "g", preparation: "30C / 86F" },
        ],
        steps: [
          "Mix levain ingredients in a jar. Cover loosely and leave at room temperature (24C) for 8-12 hours until doubled and domed.",
          "The levain is ready when a small piece floats in water (the float test).",
        ],
      },
      {
        name: "dough",
        displayName: "Dough",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Bread flour", slug: "bread-flour", amount: 400, unit: "g" },
          { name: "Whole wheat flour", slug: "whole-wheat-flour", amount: 100, unit: "g", calories: 340, protein: 13, carbs: 69, fat: 1.9, fiber: 10.7 },
          { name: "Water", slug: "water-cold", amount: 375, unit: "g", preparation: "cold" },
          { name: "Fine sea salt", slug: "fine-sea-salt", amount: 10, unit: "g" },
          { name: "Levain", slug: "sourdough-levain", amount: 150, unit: "g" },
        ],
        steps: [
          "Autolyse: Mix both flours with 350g water (hold back 25g). Cover and rest 1 hour.",
          "Add levain and remaining 25g water. Squeeze through the dough with your fingers until fully incorporated. Rest 30 minutes.",
          "Add salt, work it in by squeezing and folding. Rest 30 minutes.",
          "Perform 4 sets of stretch-and-folds at 30-minute intervals. After each set, rotate the bowl 90 degrees and repeat 4 times.",
          "Bulk fermentation: Leave covered at room temperature for 4-5 hours until dough is jiggly, bubbly, and increased ~50% in volume.",
          "Pre-shape: Gently tip onto unfloured surface. Fold into a rough round. Rest 30 minutes uncovered.",
          "Final shape: Flip, stretch gently, fold sides in, roll toward you. Place seam-up in a floured banneton.",
          "Cold retard: Cover with plastic, refrigerate 8-16 hours overnight.",
          "Preheat Dutch oven in oven at 260C / 500F for 45 minutes.",
          "Score the cold dough quickly with a lame at 30-degree angle. Bake covered 20 minutes, uncovered 20-25 minutes until deep mahogany.",
          "Cool completely on wire rack for at least 2 hours before slicing. The crumb continues to set.",
        ],
      },
    ],
  },
  {
    slug: "brown-butter-chocolate-chip-cookies",
    name: "Brown Butter Chocolate Chip Cookies",
    description: "The extra step of browning the butter adds a toasty, nutty depth that elevates these from good to obsession-worthy.",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["baking", "sweet", "dessert", "comfort-food"],
    servings: 24,
    calories: 210,
    proteinG: 3,
    carbsG: 28,
    fatG: 11,
    fiberG: 1,
    starCount: 4102,
    forkCount: 521,
    tweakCount: 89,
    components: [
      {
        name: "cookies",
        displayName: "Cookie Dough",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 225, unit: "g", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Brown sugar", slug: "brown-sugar", amount: 200, unit: "g", calories: 380, protein: 0.1, carbs: 98, fat: 0, fiber: 0 },
          { name: "Granulated sugar", slug: "granulated-sugar", amount: 100, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Large eggs", slug: "large-eggs", amount: 2, unit: "whole", calories: 143, protein: 13, carbs: 1, fat: 10, fiber: 0 },
          { name: "Egg yolk", slug: "egg-yolk", amount: 1, unit: "yolk", calories: 322, protein: 16, carbs: 3.6, fat: 27, fiber: 0 },
          { name: "Vanilla extract", slug: "vanilla-extract", amount: 2, unit: "tsp" },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 280, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Baking soda", slug: "baking-soda", amount: 1, unit: "tsp" },
          { name: "Fine salt", slug: "fine-salt", amount: 1.5, unit: "tsp" },
          { name: "Dark chocolate chips", slug: "dark-chocolate-chips", amount: 340, unit: "g", calories: 479, protein: 6, carbs: 67, fat: 27, fiber: 7 },
          { name: "Flaky sea salt", slug: "flaky-sea-salt", amount: 1, unit: "tsp", preparation: "for topping" },
        ],
        steps: [
          "Brown the butter: melt in a light-colored saucepan over medium heat, swirling constantly. It will foam, then the foam subsides, and golden-brown milk solids appear at the bottom. Smells like hazelnuts. Remove from heat immediately and pour into a large bowl, scraping every bit of the brown bits.",
          "Whisk both sugars into the warm brown butter vigorously for 2 minutes until combined.",
          "Add eggs and yolk one at a time, whisking after each. Add vanilla. The mixture should look thick and ribbon-like.",
          "Fold in flour, baking soda, and salt until just combined. A few streaks of flour are fine.",
          "Fold in chocolate chips. The dough will be very soft.",
          "Chill the dough for at least 30 minutes (or up to 72 hours — longer = better flavor).",
          "Preheat oven to 180C / 350F. Line baking sheets with parchment.",
          "Scoop dough into 50g balls (about 2 tablespoons). Bake 11-13 minutes until edges are set but centers still look underdone. They firm up as they cool.",
          "Immediately sprinkle with flaky sea salt. Cool on pan for 5 minutes before transferring.",
        ],
      },
    ],
  },
  {
    slug: "clafoutis",
    name: "Cherry Clafoutis",
    description: "The French countryside batter pudding. Somewhere between a crepe and a flan. No pitting the cherries — the pits keep them from going mushy and add a subtle almond flavor.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["french", "dessert", "sweet", "baking"],
    servings: 6,
    calories: 240,
    proteinG: 8,
    carbsG: 32,
    fatG: 9,
    fiberG: 1,
    starCount: 892,
    forkCount: 67,
    tweakCount: 12,
    components: [
      {
        name: "clafoutis",
        displayName: "Clafoutis",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Fresh cherries", slug: "fresh-cherries", amount: 500, unit: "g", preparation: "unpitted", calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1 },
          { name: "Whole milk", slug: "whole-milk", amount: 250, unit: "ml", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
          { name: "Heavy cream", slug: "heavy-cream", amount: 100, unit: "ml", calories: 340, protein: 2.1, carbs: 2.8, fat: 36, fiber: 0 },
          { name: "Large eggs", slug: "large-eggs", amount: 3, unit: "whole" },
          { name: "Granulated sugar", slug: "granulated-sugar", amount: 100, unit: "g" },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 60, unit: "g" },
          { name: "Vanilla extract", slug: "vanilla-extract", amount: 1, unit: "tsp" },
          { name: "Kirsch", slug: "kirsch", amount: 2, unit: "tbsp", preparation: "cherry brandy", isOptional: true },
          { name: "Powdered sugar", slug: "powdered-sugar", amount: 2, unit: "tbsp", preparation: "for dusting" },
        ],
        steps: [
          "Preheat oven to 180C / 350F. Butter a 28cm ceramic or cast-iron baking dish generously, then dust with sugar.",
          "Arrange cherries in a single layer across the dish.",
          "Blend milk, cream, eggs, sugar, flour, and vanilla until smooth. Add Kirsch if using. Let batter rest 10 minutes.",
          "Pour batter over cherries. Bake 40-45 minutes until puffed, golden, and the center has only a very slight wobble.",
          "It will deflate as it cools — this is expected. Dust with powdered sugar and serve warm. Warn your guests about the pits.",
        ],
      },
    ],
  },

  // ── kenji_noodles ──────────────────────────────────────────────────────────
  {
    slug: "tonkotsu-ramen",
    name: "Tonkotsu Ramen",
    description: "18-hour pork bone broth. Creamy, rich, cloudy white. This is a weekend project, not a weeknight dinner. Worth every hour.",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    authorKey: "kenji_noodles",
    tags: ["japanese", "ramen", "soup", "pork"],
    servings: 4,
    calories: 720,
    proteinG: 48,
    carbsG: 62,
    fatG: 28,
    fiberG: 2,
    starCount: 5621,
    forkCount: 678,
    tweakCount: 102,
    components: [
      {
        name: "broth",
        displayName: "Tonkotsu Broth",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Pork trotters", slug: "pork-trotters", amount: 1, unit: "kg", preparation: "halved by butcher", calories: 310, protein: 25, carbs: 0, fat: 22, fiber: 0 },
          { name: "Pork neck bones", slug: "pork-neck-bones", amount: 500, unit: "g", calories: 240, protein: 20, carbs: 0, fat: 17, fiber: 0 },
          { name: "Pork back fat", slug: "pork-back-fat", amount: 100, unit: "g", calories: 812, protein: 2.9, carbs: 0, fat: 89, fiber: 0 },
          { name: "Kombu", slug: "kombu", amount: 10, unit: "g", calories: 43, protein: 1.7, carbs: 9.6, fat: 0.6, fiber: 1.3 },
          { name: "Water", slug: "water", amount: 3, unit: "L" },
          { name: "Ginger", slug: "ginger", amount: 1, unit: "thumb", preparation: "sliced" },
          { name: "Spring onions", slug: "spring-onions", amount: 4, unit: "whole" },
          { name: "Garlic", slug: "garlic", amount: 6, unit: "cloves", preparation: "crushed" },
        ],
        steps: [
          "Blanch: Cover bones and trotters with cold water, bring to a boil, boil 10 minutes. Drain. Rinse each bone under cold water, scrubbing off all grey scum and dark bits. This step is critical for a clean-tasting broth.",
          "In a large stockpot, add cleaned bones, back fat, ginger, spring onions, garlic, and kombu. Cover with 3L cold water.",
          "Bring to a roaring boil over high heat. This is different from French stocks — you want the aggressive boil that emulsifies fat into the broth, turning it milky white. Maintain this rolling boil for 2 hours, topping up with boiling water as needed.",
          "Reduce to a vigorous simmer for another 6-8 hours. The broth should be creamy and opaque.",
          "Strain through a fine sieve, pressing on solids. Discard solids. Season with salt.",
        ],
      },
      {
        name: "tare",
        displayName: "Shoyu Tare (Seasoning Sauce)",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Soy sauce", slug: "soy-sauce", amount: 100, unit: "ml", calories: 60, protein: 10, carbs: 5.6, fat: 0.1, fiber: 0.8 },
          { name: "Mirin", slug: "mirin", amount: 50, unit: "ml", calories: 241, protein: 0.3, carbs: 54, fat: 0, fiber: 0 },
          { name: "Sake", slug: "sake", amount: 50, unit: "ml", calories: 134, protein: 0.1, carbs: 3.6, fat: 0, fiber: 0 },
          { name: "Dried shiitake mushrooms", slug: "dried-shiitake", amount: 10, unit: "g", calories: 296, protein: 9.6, carbs: 76, fat: 1, fiber: 11 },
        ],
        steps: [
          "Combine all tare ingredients in a small saucepan. Bring to a gentle simmer for 15 minutes.",
          "Strain and cool. Store in the fridge for up to a month.",
          "Use 2-3 tbsp per bowl of broth. Adjust to taste.",
        ],
      },
      {
        name: "chashu-pork",
        displayName: "Chashu Pork Belly",
        type: "FOLDER",
        order: 2,
        ingredients: [
          { name: "Pork belly", slug: "pork-belly", amount: 500, unit: "g", preparation: "skin-on, rolled and tied", calories: 518, protein: 9.3, carbs: 0, fat: 53, fiber: 0 },
          { name: "Soy sauce", slug: "soy-sauce", amount: 80, unit: "ml" },
          { name: "Mirin", slug: "mirin", amount: 80, unit: "ml" },
          { name: "Sake", slug: "sake", amount: 80, unit: "ml" },
          { name: "Sugar", slug: "granulated-sugar", amount: 2, unit: "tbsp" },
        ],
        steps: [
          "Sear rolled pork belly in an oven-safe pan until browned all over.",
          "Mix soy sauce, mirin, sake, and sugar. Add to pan with pork.",
          "Braise in 160C / 320F oven for 2 hours, turning every 30 minutes.",
          "Cool in braising liquid overnight — this seasons and firms the meat.",
          "Slice into 1cm rounds and sear in a hot pan before serving.",
        ],
      },
      {
        name: "assembly",
        displayName: "Bowl Assembly",
        type: "FOLDER",
        order: 3,
        ingredients: [
          { name: "Fresh ramen noodles", slug: "ramen-noodles", amount: 400, unit: "g", calories: 138, protein: 4.7, carbs: 27, fat: 0.4, fiber: 1.7 },
          { name: "Soft-boiled eggs", slug: "soft-boiled-eggs", amount: 4, unit: "whole", preparation: "marinated in soy-mirin overnight" },
          { name: "Nori sheets", slug: "nori", amount: 4, unit: "sheets", preparation: "halved" },
          { name: "Bean sprouts", slug: "bean-sprouts", amount: 100, unit: "g", preparation: "blanched 30 seconds" },
          { name: "Sesame seeds", slug: "sesame-seeds", amount: 2, unit: "tbsp", preparation: "toasted" },
          { name: "Green onions", slug: "green-onions", amount: 4, unit: "stalks", preparation: "thinly sliced" },
          { name: "Mayu (black garlic oil)", slug: "mayu", amount: 2, unit: "tsp", preparation: "see notes", isOptional: true },
        ],
        steps: [
          "Heat broth to a vigorous boil. Season each bowl with 2-3 tbsp tare.",
          "Cook noodles in a separate pot of boiling water — exactly 90 seconds for fresh noodles.",
          "Drain noodles and add to bowls. Pour 300-350ml broth over each.",
          "Top with 2-3 slices of seared chashu, half a marinated egg, nori, bean sprouts, green onions.",
          "Finish with toasted sesame and a few drops of mayu if using. Serve immediately.",
        ],
      },
    ],
  },
  {
    slug: "gyoza",
    name: "Pork and Cabbage Gyoza",
    description: "Crispy bottom, steamed top, juicy inside. The potsticker technique makes them perfect every time.",
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
    authorKey: "kenji_noodles",
    tags: ["japanese", "pork", "quick"],
    servings: 4,
    calories: 420,
    proteinG: 24,
    carbsG: 44,
    fatG: 16,
    fiberG: 3,
    starCount: 2109,
    forkCount: 234,
    tweakCount: 41,
    components: [
      {
        name: "filling",
        displayName: "Filling",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Ground pork", slug: "ground-pork", amount: 300, unit: "g", calories: 297, protein: 17, carbs: 0, fat: 25, fiber: 0 },
          { name: "Napa cabbage", slug: "napa-cabbage", amount: 200, unit: "g", preparation: "finely shredded, salted and squeezed dry", calories: 16, protein: 1.2, carbs: 2.2, fat: 0.2, fiber: 1.2 },
          { name: "Ginger", slug: "ginger", amount: 1, unit: "tbsp", preparation: "grated" },
          { name: "Garlic", slug: "garlic", amount: 3, unit: "cloves", preparation: "minced" },
          { name: "Soy sauce", slug: "soy-sauce", amount: 2, unit: "tbsp" },
          { name: "Sesame oil", slug: "sesame-oil", amount: 1, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Mirin", slug: "mirin", amount: 1, unit: "tbsp" },
          { name: "White pepper", slug: "white-pepper", amount: 0.5, unit: "tsp" },
        ],
        steps: [
          "Toss cabbage with 1 tsp salt. Leave 15 minutes, then squeeze out as much liquid as possible with your hands. This prevents soggy gyoza.",
          "Mix pork, squeezed cabbage, ginger, garlic, soy sauce, sesame oil, mirin, and white pepper. Mix vigorously in one direction for 2 minutes — this develops the protein and makes the filling cohesive.",
          "Refrigerate filling for 30 minutes.",
        ],
      },
      {
        name: "wrapping",
        displayName: "Wrapping & Cooking",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Gyoza wrappers", slug: "gyoza-wrappers", amount: 40, unit: "pieces", calories: 280, protein: 8.5, carbs: 57, fat: 1, fiber: 2 },
          { name: "Neutral oil", slug: "neutral-oil", amount: 2, unit: "tbsp" },
          { name: "Water", slug: "water", amount: 80, unit: "ml" },
        ],
        steps: [
          "Place 1 tsp filling in center of each wrapper. Wet the edge with water. Pleat one side and press to seal, making 5-6 pleats. Stand them on their flat base.",
          "Heat oil in a non-stick pan over medium-high heat. Add gyoza flat-side down in a single layer. Cook 2-3 minutes until bases are deep golden.",
          "Pour in water carefully (it will splatter). Cover immediately. Steam 3 minutes.",
          "Remove lid, let remaining water evaporate. The bases will crisp up again. Slide onto a plate, crispy side up.",
          "Serve with dipping sauce: 2 tbsp soy sauce, 1 tbsp rice vinegar, chili oil to taste.",
        ],
      },
    ],
  },

  // ── raj_spice ──────────────────────────────────────────────────────────────
  {
    slug: "dal-makhani",
    name: "Dal Makhani",
    description: "The crown jewel of Punjabi cooking. Black lentils slow-cooked overnight with butter, cream, and tomatoes. Do not rush this.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    authorKey: "raj_spice",
    tags: ["indian", "vegetarian", "comfort-food", "dinner", "meal-prep"],
    servings: 6,
    calories: 380,
    proteinG: 18,
    carbsG: 42,
    fatG: 16,
    fiberG: 12,
    starCount: 3401,
    forkCount: 289,
    tweakCount: 56,
    components: [
      {
        name: "dal",
        displayName: "Dal",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Whole black lentils (urad dal)", slug: "urad-dal", amount: 250, unit: "g", preparation: "soaked overnight", calories: 341, protein: 25, carbs: 58, fat: 1.6, fiber: 18 },
          { name: "Kidney beans", slug: "kidney-beans", amount: 50, unit: "g", preparation: "soaked overnight", calories: 333, protein: 24, carbs: 60, fat: 0.5, fiber: 24 },
          { name: "Water", slug: "water", amount: 1.5, unit: "L" },
          { name: "Salt", slug: "fine-salt", amount: 2, unit: "tsp" },
        ],
        steps: [
          "Drain soaked lentils and kidney beans. Pressure cook (or simmer in a pot) with 1.5L water and salt for 45-60 minutes until very soft. The beans should be mashable between your fingers.",
          "Do not discard the cooking liquid — it becomes part of the dal.",
        ],
      },
      {
        name: "makhani-gravy",
        displayName: "Makhani Gravy",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 60, unit: "g" },
          { name: "Yellow onion", slug: "yellow-onion", amount: 2, unit: "medium", preparation: "finely diced" },
          { name: "Garlic", slug: "garlic", amount: 6, unit: "cloves", preparation: "minced" },
          { name: "Ginger", slug: "ginger", amount: 2, unit: "inches", preparation: "grated" },
          { name: "Tomato puree", slug: "tomato-puree", amount: 400, unit: "g", calories: 38, protein: 1.5, carbs: 8, fat: 0.3, fiber: 1.7 },
          { name: "Kashmiri chili powder", slug: "kashmiri-chili", amount: 2, unit: "tsp", calories: 282, protein: 12, carbs: 50, fat: 7.5, fiber: 27 },
          { name: "Ground coriander", slug: "ground-coriander", amount: 1, unit: "tsp" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp" },
          { name: "Garam masala", slug: "garam-masala", amount: 1, unit: "tsp" },
          { name: "Heavy cream", slug: "heavy-cream", amount: 100, unit: "ml" },
          { name: "Fenugreek leaves (kasuri methi)", slug: "kasuri-methi", amount: 1, unit: "tbsp", preparation: "dried, crushed between palms", isOptional: false },
        ],
        steps: [
          "Melt butter in a heavy pot over medium heat. Add onions with a pinch of salt. Cook 20-25 minutes, stirring often, until deep golden and jammy.",
          "Add garlic and ginger, cook 3 minutes.",
          "Add all spices, cook 1 minute in the fat.",
          "Add tomato puree. Cook down until the oil separates from the gravy, about 15 minutes — this bhunao (cooking down) stage is crucial.",
          "Add cooked lentils with their liquid to the gravy. Stir to combine. The consistency should be thick and porridge-like.",
          "Simmer on the lowest possible heat for 2-3 hours, stirring occasionally. The longer, the better. Restaurant dal makhani cooks overnight.",
          "Finish with cream and crushed kasuri methi. Simmer 5 more minutes.",
          "Serve with naan or rice. Top with a knob of butter.",
        ],
      },
    ],
  },
  {
    slug: "chicken-tikka-masala",
    name: "Chicken Tikka Masala",
    description: "Charred marinated chicken in a silky, spiced tomato cream sauce. The tikka and the masala are two separate operations — don't skip the char.",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    authorKey: "raj_spice",
    tags: ["indian", "chicken", "spicy", "dinner"],
    servings: 4,
    calories: 480,
    proteinG: 42,
    carbsG: 18,
    fatG: 26,
    fiberG: 3,
    starCount: 2987,
    forkCount: 356,
    tweakCount: 71,
    components: [
      {
        name: "tikka",
        displayName: "Chicken Tikka (Marinade & Grill)",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Boneless chicken thighs", slug: "chicken-thighs", amount: 800, unit: "g", preparation: "cut into large chunks", calories: 177, protein: 24, carbs: 0, fat: 9, fiber: 0 },
          { name: "Full-fat yogurt", slug: "full-fat-yogurt", amount: 200, unit: "g", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
          { name: "Kashmiri chili powder", slug: "kashmiri-chili", amount: 2, unit: "tbsp" },
          { name: "Garam masala", slug: "garam-masala", amount: 1, unit: "tsp" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp" },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "minced" },
          { name: "Ginger", slug: "ginger", amount: 1, unit: "inch", preparation: "grated" },
          { name: "Lemon juice", slug: "lemon-juice", amount: 2, unit: "tbsp" },
          { name: "Salt", slug: "fine-salt", amount: 1.5, unit: "tsp" },
          { name: "Neutral oil", slug: "neutral-oil", amount: 2, unit: "tbsp" },
        ],
        steps: [
          "Mix all marinade ingredients. Score chicken pieces deeply so marinade penetrates. Coat thoroughly.",
          "Marinate at least 4 hours, ideally overnight in the fridge.",
          "Grill on a very hot grill or under a broiler at maximum heat, turning once. You want deep char marks and some blackened bits — this is the entire point of tikka.",
          "Rest 5 minutes, then cut each piece in half.",
        ],
      },
      {
        name: "masala-sauce",
        displayName: "Masala Sauce",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Neutral oil", slug: "neutral-oil", amount: 3, unit: "tbsp" },
          { name: "Yellow onion", slug: "yellow-onion", amount: 2, unit: "large", preparation: "finely diced" },
          { name: "Garlic", slug: "garlic", amount: 5, unit: "cloves", preparation: "minced" },
          { name: "Ginger", slug: "ginger", amount: 1, unit: "inch", preparation: "grated" },
          { name: "Ground coriander", slug: "ground-coriander", amount: 2, unit: "tsp" },
          { name: "Kashmiri chili powder", slug: "kashmiri-chili", amount: 2, unit: "tsp" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp" },
          { name: "Garam masala", slug: "garam-masala", amount: 1, unit: "tsp" },
          { name: "Canned whole tomatoes", slug: "canned-whole-tomatoes", amount: 400, unit: "g" },
          { name: "Heavy cream", slug: "heavy-cream", amount: 150, unit: "ml" },
          { name: "Kasuri methi", slug: "kasuri-methi", amount: 2, unit: "tsp", preparation: "dried, crushed" },
          { name: "Sugar", slug: "granulated-sugar", amount: 1, unit: "tsp" },
        ],
        steps: [
          "Heat oil in a wide pan. Cook onions until deep golden, 20-25 minutes.",
          "Add garlic and ginger, cook 3 minutes. Add all dry spices, stir 1 minute.",
          "Add tomatoes, crushing them. Add sugar. Simmer 20 minutes until very thick and reduced.",
          "Blend sauce until completely smooth. Return to pan.",
          "Add cream, simmer 5 minutes. Add grilled chicken tikka pieces.",
          "Simmer together 10 minutes. Finish with kasuri methi.",
          "Serve with basmati rice and naan.",
        ],
      },
    ],
  },

  // ── vivi_verde ─────────────────────────────────────────────────────────────
  {
    slug: "mushroom-bourguignon",
    name: "Mushroom Bourguignon",
    description: "All the depth and richness of the classic French braise, made entirely with mushrooms. The wine matters. Use something you would drink.",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["vegan", "french", "comfort-food", "dinner"],
    servings: 4,
    calories: 290,
    proteinG: 9,
    carbsG: 28,
    fatG: 12,
    fiberG: 6,
    starCount: 1892,
    forkCount: 156,
    tweakCount: 28,
    components: [
      {
        name: "bourguignon",
        displayName: "Bourguignon",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Mixed mushrooms", slug: "mixed-mushrooms", amount: 800, unit: "g", preparation: "cremini, shiitake, oyster — quartered or torn", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
          { name: "Pearl onions", slug: "pearl-onions", amount: 200, unit: "g", preparation: "peeled", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Carrots", slug: "carrot", amount: 3, unit: "medium", preparation: "cut in large chunks" },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "crushed" },
          { name: "Dry red wine", slug: "dry-red-wine", amount: 375, unit: "ml", preparation: "half a bottle, Burgundy or Pinot Noir", calories: 85, protein: 0.1, carbs: 2.7, fat: 0, fiber: 0 },
          { name: "Vegetable stock", slug: "vegetable-stock", amount: 400, unit: "ml" },
          { name: "Tomato paste", slug: "tomato-paste", amount: 2, unit: "tbsp", calories: 82, protein: 4.3, carbs: 18.9, fat: 0.5, fiber: 4.2 },
          { name: "Fresh thyme", slug: "fresh-thyme", amount: 6, unit: "sprigs" },
          { name: "Bay leaves", slug: "bay-leaves", amount: 2, unit: "leaves" },
          { name: "Olive oil", slug: "olive-oil", amount: 3, unit: "tbsp" },
          { name: "Cornstarch", slug: "cornstarch", amount: 2, unit: "tbsp", preparation: "mixed with 2 tbsp cold water" },
          { name: "Fresh parsley", slug: "fresh-parsley", amount: 1, unit: "handful", preparation: "chopped, for serving" },
        ],
        steps: [
          "Dry mushrooms thoroughly — moisture is the enemy of a good sear. Heat a large Dutch oven until very hot. Sear mushrooms in batches in olive oil until deeply browned. Don't crowd the pan. Set aside.",
          "In the same pan, sear pearl onions until colored. Add carrots, cook 3 minutes. Add garlic, tomato paste, and cook 2 minutes.",
          "Pour in wine. Bring to a boil and reduce by half — about 10 minutes. This cooks out the alcohol and concentrates the flavor.",
          "Add stock, thyme, and bay leaves. Return mushrooms to the pot.",
          "Simmer covered for 25 minutes, then uncovered for 15 more until sauce is rich and vegetables are tender.",
          "Stir in cornstarch slurry, cook 2 minutes to thicken.",
          "Serve over mashed potatoes, egg-free pasta, or polenta. Garnish with parsley.",
        ],
      },
    ],
  },
  {
    slug: "thai-green-curry",
    name: "Thai Green Curry",
    description: "From-scratch green curry paste makes all the difference. Worth the food processor. Creamy, fresh, herbal, with just enough heat.",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["thai", "vegan", "spicy", "dinner", "quick"],
    servings: 4,
    calories: 340,
    proteinG: 10,
    carbsG: 32,
    fatG: 20,
    fiberG: 4,
    starCount: 2241,
    forkCount: 198,
    tweakCount: 37,
    components: [
      {
        name: "green-curry-paste",
        displayName: "Green Curry Paste",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Green bird eye chilies", slug: "green-bird-eye-chilies", amount: 10, unit: "whole", preparation: "adjust to heat preference", calories: 40, protein: 2, carbs: 9, fat: 0.4, fiber: 1.5 },
          { name: "Lemongrass", slug: "lemongrass", amount: 3, unit: "stalks", preparation: "white part only, sliced" },
          { name: "Galangal", slug: "galangal", amount: 2, unit: "cm", preparation: "peeled and sliced" },
          { name: "Kaffir lime leaves", slug: "kaffir-lime-leaves", amount: 6, unit: "leaves", preparation: "ribs removed" },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves" },
          { name: "Shallots", slug: "shallots", amount: 4, unit: "whole", preparation: "peeled" },
          { name: "Fresh coriander roots and stems", slug: "coriander-roots", amount: 1, unit: "bunch" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp" },
          { name: "Ground coriander", slug: "ground-coriander", amount: 1, unit: "tsp" },
          { name: "White pepper", slug: "white-pepper", amount: 0.5, unit: "tsp" },
        ],
        steps: [
          "Blend all paste ingredients together in a food processor or pound in a mortar until a smooth paste forms. Add a splash of water if needed to get the blades moving.",
          "Paste can be made ahead and stored in the fridge for 1 week or frozen for 3 months.",
        ],
      },
      {
        name: "curry",
        displayName: "Curry",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Full-fat coconut milk", slug: "coconut-milk", amount: 800, unit: "ml", preparation: "2 cans, chilled so cream separates", calories: 230, protein: 2.3, carbs: 5.5, fat: 24, fiber: 2.2 },
          { name: "Tofu", slug: "tofu", amount: 400, unit: "g", preparation: "firm, pressed and cubed" },
          { name: "Zucchini", slug: "zucchini", amount: 2, unit: "medium", preparation: "sliced" },
          { name: "Baby spinach", slug: "baby-spinach", amount: 100, unit: "g" },
          { name: "Fish sauce or soy sauce", slug: "soy-sauce", amount: 3, unit: "tbsp", preparation: "use soy sauce for vegan" },
          { name: "Palm sugar", slug: "palm-sugar", amount: 1, unit: "tbsp" },
          { name: "Kaffir lime leaves", slug: "kaffir-lime-leaves", amount: 4, unit: "leaves", preparation: "torn" },
          { name: "Thai basil", slug: "thai-basil", amount: 1, unit: "handful" },
          { name: "Jasmine rice", slug: "jasmine-rice", amount: 320, unit: "g", preparation: "cooked, for serving" },
        ],
        steps: [
          "Skim thick coconut cream from the top of the chilled cans. Fry the coconut cream in a wok over high heat, stirring, until it 'cracks' — the oil separates and it looks bubbly and slightly oily.",
          "Add 3-4 tbsp green curry paste (or more for heat). Fry in the coconut cream for 3 minutes until fragrant.",
          "Add remaining coconut milk and kaffir lime leaves. Bring to a simmer.",
          "Add tofu and zucchini. Simmer 8-10 minutes.",
          "Season with soy sauce and palm sugar. Taste — it should be savory, slightly sweet, fragrant, and hot.",
          "Turn off heat. Stir in spinach and Thai basil.",
          "Serve with jasmine rice.",
        ],
      },
    ],
  },

  // ── tex_bbq ────────────────────────────────────────────────────────────────
  {
    slug: "texas-brisket",
    name: "Texas Style Brisket",
    description: "Salt, pepper, smoke, time. That's the whole recipe. The rub is 50/50 coarse salt and black pepper. Everything else is cheating.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    authorKey: "tex_bbq",
    tags: ["american", "bbq", "beef", "low-and-slow"],
    servings: 12,
    calories: 520,
    proteinG: 52,
    carbsG: 1,
    fatG: 33,
    fiberG: 0,
    starCount: 4812,
    forkCount: 501,
    tweakCount: 88,
    components: [
      {
        name: "brisket",
        displayName: "Brisket",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Whole packer brisket", slug: "whole-packer-brisket", amount: 6, unit: "kg", preparation: "full packer with point and flat, untrimmed", calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0 },
          { name: "Kosher salt", slug: "kosher-salt", amount: 4, unit: "tbsp" },
          { name: "Coarsely ground black pepper", slug: "black-pepper-coarse", amount: 4, unit: "tbsp" },
          { name: "Oak or post oak wood", slug: "oak-wood", amount: 5, unit: "kg", preparation: "for smoking" },
        ],
        steps: [
          "Trim the fat cap to 1/4 inch. Remove any hard fat deposits. Trim the edges so bark can form evenly. Save all trimmings to render into tallow.",
          "Mix salt and pepper 1:1 by volume. Apply generously to all surfaces of the brisket, pressing into the meat. Don't rub — shake and press. Rest on a rack uncovered in the fridge overnight.",
          "Fire your smoker to 107-110C / 225-230F. Use post oak wood for Central Texas style. Maintain consistent temperature.",
          "Place brisket fat-side up. Insert thermometer probe into the thickest part of the flat.",
          "Smoke until internal temperature hits 74C / 165F — usually 6-8 hours. Spritz with water every hour after the first 3 hours.",
          "Wrap tightly in butcher paper (not foil — foil steams). Return to smoker. Continue cooking.",
          "Start probing for tenderness at 88C / 190F. The probe should slide in with zero resistance, like room-temperature butter, at around 93-96C / 200-205F.",
          "Rest in a cooler (still wrapped) for at least 2 hours. Up to 4 hours is fine. This is not optional.",
          "Slice against the grain. The flat gets 1/4 inch pencil-thin slices. The point is pulled or sliced in chunks. Serve on butcher paper.",
        ],
      },
    ],
  },

  // ── maite_mx ───────────────────────────────────────────────────────────────
  {
    slug: "pozole-rojo",
    name: "Pozole Rojo",
    description: "A Mexican celebration soup: pork, hominy, and a deep red chile broth. Topped at the table with shredded cabbage, radish, lime, and oregano.",
    imageUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80",
    authorKey: "maite_mx",
    tags: ["mexican", "soup", "pork", "comfort-food"],
    servings: 8,
    calories: 420,
    proteinG: 36,
    carbsG: 38,
    fatG: 14,
    fiberG: 8,
    starCount: 1678,
    forkCount: 132,
    tweakCount: 24,
    components: [
      {
        name: "pork-and-hominy",
        displayName: "Pork & Hominy",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Pork shoulder", slug: "pork-shoulder", amount: 1.5, unit: "kg", preparation: "bone-in, cut into large pieces", calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
          { name: "Canned hominy", slug: "hominy", amount: 800, unit: "g", preparation: "drained and rinsed", calories: 119, protein: 2.3, carbs: 26, fat: 1.4, fiber: 4.1 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "halved" },
          { name: "Garlic", slug: "garlic", amount: 6, unit: "cloves" },
          { name: "Bay leaves", slug: "bay-leaves", amount: 3, unit: "leaves" },
          { name: "Dried oregano", slug: "dried-oregano", amount: 1, unit: "tsp", preparation: "Mexican oregano preferred" },
          { name: "Salt", slug: "fine-salt", amount: 2, unit: "tsp" },
        ],
        steps: [
          "Place pork, onion, garlic, bay leaves, oregano, and salt in a large pot. Cover with cold water by 5cm.",
          "Bring to a boil, skim any foam. Reduce heat and simmer 2-2.5 hours until pork is very tender and falls off the bone.",
          "Remove pork, shred the meat, discard bones and fat. Reserve the broth.",
          "Add hominy to the broth. Simmer 30 minutes.",
        ],
      },
      {
        name: "red-chile-sauce",
        displayName: "Red Chile Sauce",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Dried ancho chiles", slug: "ancho-chiles", amount: 6, unit: "whole", preparation: "stemmed and seeded", calories: 281, protein: 11, carbs: 58, fat: 7.5, fiber: 20 },
          { name: "Dried guajillo chiles", slug: "guajillo-chiles", amount: 4, unit: "whole", preparation: "stemmed and seeded", calories: 255, protein: 11, carbs: 55, fat: 5.7, fiber: 19 },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp" },
          { name: "Black pepper", slug: "black-pepper", amount: 0.5, unit: "tsp" },
        ],
        steps: [
          "Toast dried chiles in a dry skillet over medium heat, 30 seconds per side. They should be fragrant and flexible, not scorched.",
          "Soak toasted chiles in boiling water for 20 minutes until soft.",
          "Blend soaked chiles with garlic, cumin, pepper, and 1 cup soaking liquid until smooth.",
          "Strain through a fine sieve, pressing hard on the solids.",
          "Fry the chile sauce in 2 tbsp oil in a large pan over high heat, stirring constantly for 5 minutes — it will darken and become more complex.",
          "Add to the pork-hominy broth. Add shredded pork back in. Simmer 20 more minutes.",
        ],
      },
      {
        name: "garnishes",
        displayName: "Garnishes",
        type: "FOLDER",
        order: 2,
        ingredients: [
          { name: "Green cabbage", slug: "green-cabbage", amount: 0.5, unit: "head", preparation: "finely shredded" },
          { name: "Radishes", slug: "radishes", amount: 10, unit: "whole", preparation: "thinly sliced" },
          { name: "Limes", slug: "limes", amount: 4, unit: "whole", preparation: "quartered" },
          { name: "Dried oregano", slug: "dried-oregano", amount: 2, unit: "tbsp", preparation: "for the table" },
          { name: "Tostadas", slug: "tostadas", amount: 8, unit: "pieces" },
          { name: "Avocado", slug: "avocado", amount: 2, unit: "whole", preparation: "sliced", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
        ],
        steps: [
          "Set all garnishes out on the table in small bowls.",
          "Ladle hot pozole into deep bowls with plenty of hominy and pork.",
          "Each person garnishes their own bowl: cabbage, radish, lime, oregano.",
          "Eat with tostadas on the side.",
        ],
      },
    ],
  },
  {
    slug: "tacos-de-birria",
    name: "Tacos de Birria",
    description: "The quesabirria that took over the internet. Beef braised in a chile-tomato consomme, shredded and griddle-fried in a cheese taco. Dip in the consomme.",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    authorKey: "maite_mx",
    tags: ["mexican", "beef", "spicy", "dinner"],
    servings: 6,
    calories: 580,
    proteinG: 44,
    carbsG: 36,
    fatG: 28,
    fiberG: 4,
    starCount: 3102,
    forkCount: 287,
    tweakCount: 54,
    components: [
      {
        name: "birria",
        displayName: "Birria (Braised Beef)",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Beef chuck", slug: "beef-chuck", amount: 1.5, unit: "kg", preparation: "cut into large pieces", calories: 258, protein: 26, carbs: 0, fat: 16, fiber: 0 },
          { name: "Dried ancho chiles", slug: "ancho-chiles", amount: 4, unit: "whole" },
          { name: "Dried guajillo chiles", slug: "guajillo-chiles", amount: 4, unit: "whole" },
          { name: "Dried chipotle chiles", slug: "chipotle-chiles", amount: 2, unit: "whole", calories: 281, protein: 11, carbs: 57, fat: 6.8, fiber: 22 },
          { name: "Canned whole tomatoes", slug: "canned-whole-tomatoes", amount: 400, unit: "g" },
          { name: "Garlic", slug: "garlic", amount: 8, unit: "cloves" },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "halved" },
          { name: "Ground cumin", slug: "ground-cumin", amount: 2, unit: "tsp" },
          { name: "Dried oregano", slug: "dried-oregano", amount: 1, unit: "tsp" },
          { name: "Apple cider vinegar", slug: "apple-cider-vinegar", amount: 2, unit: "tbsp", calories: 21, protein: 0, carbs: 0.9, fat: 0, fiber: 0 },
          { name: "Beef stock", slug: "beef-stock", amount: 1, unit: "L" },
        ],
        steps: [
          "Toast and soak all dried chiles as in the pozole method above.",
          "Blend chiles with tomatoes, garlic, cumin, oregano, and vinegar until smooth.",
          "Season beef generously with salt. Sear in a Dutch oven until deeply browned.",
          "Pour chile sauce over beef, add stock. Bring to a boil.",
          "Cover and braise at 160C / 320F for 3 hours until beef shreds easily.",
          "Shred beef. Reserve the consomme separately. Degrease the consomme but leave some fat.",
        ],
      },
      {
        name: "tacos",
        displayName: "Taco Assembly",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Corn tortillas", slug: "corn-tortillas", amount: 18, unit: "small", calories: 218, protein: 5.7, carbs: 46, fat: 2.9, fiber: 6.4 },
          { name: "Quesillo or Oaxacan cheese", slug: "oaxacan-cheese", amount: 300, unit: "g", preparation: "shredded", calories: 350, protein: 25, carbs: 1, fat: 27, fiber: 0 },
          { name: "White onion", slug: "white-onion", amount: 1, unit: "small", preparation: "finely diced" },
          { name: "Fresh cilantro", slug: "fresh-cilantro", amount: 1, unit: "bunch", preparation: "roughly chopped" },
          { name: "Limes", slug: "limes", amount: 3, unit: "whole", preparation: "for serving" },
          { name: "Salsa verde", slug: "salsa-verde", amount: 200, unit: "ml", preparation: "for serving" },
        ],
        steps: [
          "Warm consomme in a wide, shallow bowl for dipping.",
          "Dip each tortilla briefly in the consomme fat layer (or brush with oil), then place on a hot griddle.",
          "Add shredded cheese to one half of the tortilla. Add a heap of shredded beef on top.",
          "Fold the tortilla over and press gently. Cook until crispy and cheese is melted, flip, crisp the other side.",
          "Serve immediately with a cup of warm consomme for dipping, topped with onion, cilantro, and lime.",
        ],
      },
    ],
  },

  // ── chef_alex ──────────────────────────────────────────────────────────────
  {
    slug: "french-onion-soup",
    name: "French Onion Soup",
    description: "Five pounds of onions, three hours, one transcendent bowl. The caramelization cannot be rushed. Anyone who says 30 minutes is lying to you.",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    authorKey: "chef_alex",
    tags: ["french", "soup", "beef", "comfort-food"],
    servings: 4,
    calories: 480,
    proteinG: 22,
    carbsG: 44,
    fatG: 22,
    fiberG: 3,
    starCount: 2201,
    forkCount: 178,
    tweakCount: 31,
    components: [
      {
        name: "soup",
        displayName: "Soup",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Yellow onions", slug: "yellow-onion", amount: 2, unit: "kg", preparation: "thinly sliced — yes, 2 kilos", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 60, unit: "g" },
          { name: "Olive oil", slug: "olive-oil", amount: 2, unit: "tbsp" },
          { name: "Dry white wine", slug: "dry-white-wine", amount: 200, unit: "ml", calories: 82, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0 },
          { name: "Dry sherry", slug: "dry-sherry", amount: 100, unit: "ml", calories: 126, protein: 0.1, carbs: 5.7, fat: 0, fiber: 0 },
          { name: "Beef stock", slug: "beef-stock", amount: 1.5, unit: "L" },
          { name: "Fresh thyme", slug: "fresh-thyme", amount: 4, unit: "sprigs" },
          { name: "Bay leaf", slug: "bay-leaves", amount: 1, unit: "leaf" },
          { name: "Worcestershire sauce", slug: "worcestershire-sauce", amount: 1, unit: "tbsp" },
        ],
        steps: [
          "Melt butter and oil together in a heavy-bottomed pot (Dutch oven) over medium heat. Add all the onions with 2 tsp salt.",
          "Cook, stirring every 10-15 minutes, for 60-90 minutes. The onions will first wilt, then steam, then slowly turn golden. If they're sticking, add a splash of water and scrape up the fond.",
          "Continue cooking until they are a deep mahogany color — like expensive caramel. This takes patience. They will reduce to about 1/5 their original volume.",
          "Add white wine and sherry. Boil until nearly evaporated, about 5 minutes.",
          "Add beef stock, thyme, and bay leaf. Simmer 30 minutes. Season, add Worcestershire.",
        ],
      },
      {
        name: "gratin",
        displayName: "Gratin Topping",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Baguette", slug: "baguette", amount: 1, unit: "whole", preparation: "sliced into rounds and toasted" },
          { name: "Gruyere cheese", slug: "gruyere", amount: 200, unit: "g", preparation: "coarsely grated", calories: 413, protein: 29, carbs: 0.4, fat: 32, fiber: 0 },
          { name: "Comte or Emmental", slug: "comte", amount: 50, unit: "g", preparation: "coarsely grated" },
        ],
        steps: [
          "Preheat broiler to maximum.",
          "Ladle soup into oven-safe crocks (ramekins or wide soup bowls). Float 2-3 baguette rounds on top.",
          "Cover generously with grated cheeses. The cheese should reach over the edge of the bowl to prevent burning.",
          "Broil 3-5 minutes until cheese is bubbling, spotted, and beautifully browned.",
          "Careful — the bowls are extremely hot. Let rest 2 minutes before serving.",
        ],
      },
    ],
  },
  {
    slug: "beef-bourguignon",
    name: "Beef Bourguignon",
    description: "The original low-and-slow. Julia Child didn't invent this, she just made it approachable. Two-day version here — day one braise, day two it's perfect.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    authorKey: "chef_alex",
    tags: ["french", "beef", "comfort-food", "dinner", "meal-prep"],
    servings: 6,
    calories: 610,
    proteinG: 48,
    carbsG: 22,
    fatG: 32,
    fiberG: 3,
    starCount: 3102,
    forkCount: 334,
    tweakCount: 61,
    components: [
      {
        name: "braise",
        displayName: "Braise",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Beef chuck", slug: "beef-chuck", amount: 1.5, unit: "kg", preparation: "cut into 5cm cubes, patted dry", calories: 258, protein: 26, carbs: 0, fat: 16, fiber: 0 },
          { name: "Lardons (bacon)", slug: "lardons", amount: 200, unit: "g", preparation: "or thick-cut bacon, cut into strips", calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 2, unit: "medium", preparation: "diced" },
          { name: "Carrots", slug: "carrot", amount: 3, unit: "medium", preparation: "cut in large rounds" },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "minced" },
          { name: "Tomato paste", slug: "tomato-paste", amount: 2, unit: "tbsp" },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 2, unit: "tbsp" },
          { name: "Burgundy or Pinot Noir wine", slug: "dry-red-wine", amount: 750, unit: "ml", preparation: "one full bottle" },
          { name: "Beef stock", slug: "beef-stock", amount: 500, unit: "ml" },
          { name: "Fresh thyme", slug: "fresh-thyme", amount: 4, unit: "sprigs" },
          { name: "Bay leaves", slug: "bay-leaves", amount: 2, unit: "leaves" },
        ],
        steps: [
          "Optional but optimal: marinate the beef in half the wine with thyme, bay, and garlic overnight in the fridge.",
          "Pat beef completely dry. Season generously with salt and pepper. Brown in batches in a heavy Dutch oven over high heat — 2-3 minutes per side, deep mahogany. Set aside.",
          "Render lardons in the same pot until crispy. Remove. Cook onions and carrots in the fat until softened.",
          "Add garlic and tomato paste, cook 2 minutes. Sprinkle flour over and stir 1 minute.",
          "Return beef and lardons. Pour in wine and stock. Add herbs. Liquid should just cover the meat.",
          "Bring to a simmer, cover tightly, place in 160C / 320F oven for 2.5-3 hours until beef is completely tender.",
          "Cool overnight — the flavor improves dramatically.",
          "Next day, skim fat from surface. Reheat gently.",
        ],
      },
      {
        name: "garnish",
        displayName: "Pearl Onions & Mushroom Garnish",
        type: "FOLDER",
        order: 1,
        ingredients: [
          { name: "Pearl onions", slug: "pearl-onions", amount: 200, unit: "g", preparation: "blanched and peeled" },
          { name: "Button mushrooms", slug: "button-mushrooms", amount: 250, unit: "g", preparation: "quartered", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 30, unit: "g" },
          { name: "Fresh parsley", slug: "fresh-parsley", amount: 1, unit: "handful", preparation: "chopped" },
        ],
        steps: [
          "Saute pearl onions in butter until golden all over. Add to the bourguignon in the last 30 minutes of cooking.",
          "Saute mushrooms separately in butter until all moisture has evaporated and they are golden.",
          "Add mushrooms to finished bourguignon just before serving.",
          "Garnish with fresh parsley. Serve with buttered egg noodles, mashed potatoes, or crusty bread.",
        ],
      },
    ],
  },

  // ── marco_cucina new recipes ───────────────────────────────────────────────
  {
    slug: "spaghetti-allamatriciana",
    name: "Spaghetti all'Amatriciana",
    description: "Guanciale, San Marzano tomatoes, Pecorino Romano. Rome's other great pasta. Use bucatini if you can find it.",
    imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",
    authorKey: "marco_cucina",
    tags: ["italian", "pasta", "dinner", "pork"],
    servings: 4,
    calories: 610,
    proteinG: 24,
    carbsG: 78,
    fatG: 22,
    fiberG: 4,
    starCount: 1892,
    forkCount: 167,
    tweakCount: 28,
    components: [
      {
        name: "amatriciana",
        displayName: "Amatriciana",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Bucatini", slug: "bucatini", amount: 400, unit: "g", calories: 131, protein: 5, carbs: 26, fat: 0.5, fiber: 1.8 },
          { name: "Guanciale", slug: "guanciale", amount: 150, unit: "g", preparation: "cut into lardons", calories: 650, protein: 12, carbs: 0, fat: 68, fiber: 0 },
          { name: "San Marzano tomatoes", slug: "san-marzano-tomatoes", amount: 400, unit: "g", preparation: "crushed by hand", calories: 18, protein: 0.9, carbs: 3.5, fat: 0.2, fiber: 1.1 },
          { name: "Pecorino Romano", slug: "pecorino-romano", amount: 80, unit: "g", preparation: "finely grated", calories: 387, protein: 25, carbs: 0, fat: 31, fiber: 0 },
          { name: "Dry white wine", slug: "dry-white-wine", amount: 60, unit: "ml", calories: 80, protein: 0, carbs: 2, fat: 0, fiber: 0 },
          { name: "Dried chili flakes", slug: "dried-chili-flakes", amount: 0.5, unit: "tsp", calories: 6, protein: 0.3, carbs: 1, fat: 0.3, fiber: 0.5 },
        ],
        steps: [
          "Bring a large pot of salted water to boil. Cook bucatini 2 minutes less than package time.",
          "Render guanciale in a cold dry skillet over medium heat. Let the fat render slowly — about 8 minutes. Remove guanciale with a slotted spoon, leaving fat in pan.",
          "Add chili flakes to the fat. Add wine and let it sizzle. Add tomatoes. Simmer 15 minutes until slightly thickened. Season with a little salt.",
          "Return guanciale to sauce. Add drained pasta and a splash of pasta water. Toss over medium heat for 2 minutes.",
          "Remove from heat. Add half the Pecorino and toss. Serve with remaining Pecorino on top.",
        ],
      },
    ],
  },
  {
    slug: "osso-buco-alla-milanese",
    name: "Osso Buco alla Milanese",
    description: "Braised veal shanks with gremolata. One of Italy's greatest dishes. The marrow in the bone is the prize.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    authorKey: "marco_cucina",
    tags: ["italian", "dinner", "comfort-food"],
    servings: 4,
    calories: 520,
    proteinG: 48,
    carbsG: 18,
    fatG: 28,
    fiberG: 3,
    starCount: 2104,
    forkCount: 198,
    tweakCount: 31,
    components: [
      {
        name: "osso-buco",
        displayName: "Osso Buco",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Veal shanks", slug: "veal-shanks", amount: 4, unit: "cross-cut pieces", preparation: "tied with kitchen twine", calories: 170, protein: 26, carbs: 0, fat: 7, fiber: 0 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "large", preparation: "diced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Carrot", slug: "carrot", amount: 2, unit: "medium", preparation: "diced", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
          { name: "Celery", slug: "celery", amount: 2, unit: "stalks", preparation: "diced", calories: 16, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6 },
          { name: "Dry white wine", slug: "dry-white-wine", amount: 250, unit: "ml", calories: 80, protein: 0, carbs: 2, fat: 0, fiber: 0 },
          { name: "Chicken stock", slug: "chicken-stock", amount: 500, unit: "ml", calories: 10, protein: 1.5, carbs: 0.5, fat: 0.2, fiber: 0 },
          { name: "Canned whole tomatoes", slug: "canned-whole-tomatoes", amount: 200, unit: "g", calories: 18, protein: 0.9, carbs: 3.5, fat: 0.2, fiber: 1.1 },
          { name: "Lemon", slug: "lemon", amount: 1, unit: "zest only", calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 },
          { name: "Fresh parsley", slug: "fresh-parsley", amount: 1, unit: "bunch", preparation: "finely chopped", calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3 },
          { name: "Garlic", slug: "garlic", amount: 2, unit: "cloves", preparation: "minced", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 4, unit: "tbsp", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
        ],
        steps: [
          "Pat shanks dry, season generously. Dredge in flour and shake off excess.",
          "Brown shanks in olive oil in a heavy Dutch oven over high heat, 4 min per side. Remove and set aside.",
          "Reduce heat to medium. Cook onion, carrot, and celery until soft, about 10 minutes.",
          "Add wine and scrape up all fond from the bottom. Reduce by half.",
          "Add tomatoes and stock. Nestle shanks back in — they should be mostly submerged. Bring to a simmer.",
          "Cover and cook in a 160C oven for 1.5-2 hours until the meat is falling off the bone.",
          "Make gremolata: mix parsley, lemon zest, and garlic. Scatter over each shank just before serving.",
          "Serve with risotto alla milanese (saffron risotto) or mashed potato.",
        ],
      },
    ],
  },
  {
    slug: "tiramisu",
    name: "Tiramisu",
    description: "The real one. No gelatin, no shortcuts. Zabaglione-based mascarpone cream and good espresso. Makes a 9x13 pan that serves 12.",
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    authorKey: "marco_cucina",
    tags: ["italian", "dessert", "sweet", "baking"],
    servings: 12,
    calories: 380,
    proteinG: 10,
    carbsG: 32,
    fatG: 24,
    fiberG: 0,
    starCount: 3241,
    forkCount: 412,
    tweakCount: 67,
    components: [
      {
        name: "tiramisu",
        displayName: "Tiramisu",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Savoiardi ladyfingers", slug: "savoiardi-ladyfingers", amount: 300, unit: "g", calories: 395, protein: 8, carbs: 71, fat: 8, fiber: 0 },
          { name: "Mascarpone", slug: "mascarpone", amount: 500, unit: "g", calories: 429, protein: 7, carbs: 4, fat: 45, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 6, unit: "large", preparation: "separated", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Caster sugar", slug: "caster-sugar", amount: 120, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Strong espresso", slug: "espresso", amount: 400, unit: "ml", preparation: "cooled", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
          { name: "Dark rum", slug: "dark-rum", amount: 50, unit: "ml", isOptional: true, calories: 231, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Good quality cocoa powder", slug: "cocoa-powder", amount: 3, unit: "tbsp", calories: 229, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 37 },
        ],
        steps: [
          "Whisk egg yolks with sugar until pale and ribbony, about 5 minutes. This is the zabaglione base.",
          "Fold mascarpone into the yolk mixture until smooth. Do not over-mix.",
          "In a clean bowl, whisk egg whites to stiff peaks. Fold into mascarpone mixture in 3 additions.",
          "Mix espresso and rum (if using) in a shallow dish. Dip ladyfingers briefly — 1 second per side. They should be moist but not falling apart.",
          "Arrange a single layer in a 9x13 dish. Spread half the cream. Repeat with another layer of dipped ladyfingers and remaining cream.",
          "Smooth the top. Refrigerate at least 6 hours, preferably overnight.",
          "Dust generously with cocoa just before serving. Cut into squares.",
        ],
      },
    ],
  },

  // ── sarah_bakes new recipes ────────────────────────────────────────────────
  {
    slug: "banana-bread",
    name: "Brown Butter Banana Bread",
    description: "Four overripe bananas and brown butter. The loaf that actually improves every day for three days. Tested 14 times to get the crumb right.",
    imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["baking", "sweet", "breakfast", "quick"],
    servings: 10,
    calories: 295,
    proteinG: 5,
    carbsG: 42,
    fatG: 12,
    fiberG: 2,
    starCount: 4102,
    forkCount: 534,
    tweakCount: 89,
    components: [
      {
        name: "banana-bread",
        displayName: "Banana Bread",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Overripe bananas", slug: "overripe-bananas", amount: 4, unit: "large", preparation: "mashed", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 115, unit: "g", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 210, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Granulated sugar", slug: "granulated-sugar", amount: 150, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Light brown sugar", slug: "light-brown-sugar", amount: 50, unit: "g", calories: 380, protein: 0, carbs: 98, fat: 0, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 2, unit: "large", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Vanilla extract", slug: "vanilla-extract", amount: 1, unit: "tsp", calories: 288, protein: 0.1, carbs: 12.7, fat: 0.1, fiber: 0 },
          { name: "Baking soda", slug: "baking-soda", amount: 1, unit: "tsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Fine sea salt", slug: "fine-sea-salt", amount: 0.5, unit: "tsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Walnuts", slug: "walnuts", amount: 80, unit: "g", preparation: "roughly chopped", isOptional: true, calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
        ],
        steps: [
          "Preheat oven to 175C. Grease a 9x5 loaf pan.",
          "Brown the butter: melt in a light-coloured pan over medium heat, swirling constantly, until it smells nutty and the milk solids turn deep amber. Pour into a bowl and let cool slightly.",
          "Whisk brown butter with both sugars. Add eggs one at a time, then vanilla. Stir in mashed bananas.",
          "Fold in flour, baking soda, and salt just until combined — a few streaks are fine. Overmixing makes it dense.",
          "Fold in walnuts if using. Pour into prepared pan.",
          "Bake 60-70 minutes until a skewer comes out clean. The top should be deep brown and cracked.",
          "Cool in pan 10 minutes, then on a rack for at least 1 hour. Better the next day. Will keep 3 days at room temperature.",
        ],
      },
    ],
  },
  {
    slug: "lemon-tart",
    name: "Classic Lemon Tart",
    description: "Buttery sweet shortcrust shell filled with silky lemon curd. Sharp, bright, and not too sweet. The tart that I made for my pastry school final.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["french", "dessert", "sweet", "baking"],
    servings: 8,
    calories: 420,
    proteinG: 7,
    carbsG: 48,
    fatG: 22,
    fiberG: 1,
    starCount: 2891,
    forkCount: 298,
    tweakCount: 42,
    components: [
      {
        name: "lemon-tart",
        displayName: "Lemon Tart",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 200, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 100, unit: "g", preparation: "cold, cubed", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Icing sugar", slug: "icing-sugar", amount: 40, unit: "g", calories: 389, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 5, unit: "large", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Caster sugar", slug: "caster-sugar", amount: 200, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Lemon", slug: "lemon", amount: 4, unit: "large", preparation: "zested and juiced", calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 },
          { name: "Double cream", slug: "double-cream", amount: 100, unit: "ml", calories: 340, protein: 2.7, carbs: 2.7, fat: 36, fiber: 0 },
        ],
        steps: [
          "Make pastry: pulse flour, butter, and icing sugar in food processor until sandy. Add 1 egg yolk and 2 tbsp ice water. Pulse until dough comes together.",
          "Shape into a disc, wrap, refrigerate 1 hour. Roll to 3mm and line a 23cm tart tin. Refrigerate 30 minutes.",
          "Blind bake: line with parchment and baking beans, 180C for 15 minutes. Remove beans, bake 10 more minutes until golden. Set aside.",
          "Reduce oven to 140C. Whisk 4 eggs, caster sugar, lemon zest and juice. Whisk in cream.",
          "Strain through a fine sieve. Pour into warm tart shell.",
          "Bake 25-30 minutes until the filling is just set — it should wobble like jelly in the centre.",
          "Cool completely before slicing. Dust with icing sugar or serve with creme fraiche.",
        ],
      },
    ],
  },
  {
    slug: "croissants",
    name: "Classic Croissants",
    description: "3-day laminated dough project. 27 layers of butter and dough. Honeycomb crumb. The most technically satisfying bake I know.",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
    authorKey: "sarah_bakes",
    tags: ["french", "baking", "breakfast"],
    servings: 12,
    calories: 290,
    proteinG: 6,
    carbsG: 32,
    fatG: 16,
    fiberG: 1,
    starCount: 3891,
    forkCount: 289,
    tweakCount: 51,
    components: [
      {
        name: "croissants",
        displayName: "Croissants",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Strong white bread flour", slug: "strong-white-bread-flour", amount: 500, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Caster sugar", slug: "caster-sugar", amount: 70, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Fine sea salt", slug: "fine-sea-salt", amount: 10, unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Instant yeast", slug: "instant-yeast", amount: 7, unit: "g", calories: 325, protein: 40, carbs: 41, fat: 7, fiber: 27 },
          { name: "Whole milk", slug: "whole-milk", amount: 300, unit: "ml", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
          { name: "European-style butter", slug: "european-style-butter", amount: 280, unit: "g", preparation: "cold, for lamination", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 2, unit: "large", preparation: "beaten, for egg wash", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
        ],
        steps: [
          "Day 1 - Detrempe: Combine flour, sugar, salt, yeast. Add milk and mix to a shaggy dough. Knead 5 minutes — not smooth yet is fine. Shape into a rectangle, wrap, refrigerate overnight.",
          "Day 1 - Beurrage: Beat cold butter between baking paper into a 19x19cm square. Refrigerate.",
          "Day 2 - First lamination: Roll detrempe into a rectangle twice the size of the butter block. Wrap butter in dough, seal edges. Roll out to a long rectangle. Fold in thirds (letter fold). Wrap, refrigerate 30 min.",
          "Repeat letter fold 2 more times, refrigerating 30 min between each. This creates 27 layers.",
          "Final day: Roll dough to 4mm thick. Cut into tall isoceles triangles. Roll each from base to tip tightly. Curve into crescent shape.",
          "Proof at 24-26C (no hotter) for 2-3 hours until visibly puffed and jiggly.",
          "Egg wash twice. Bake 190C for 18-20 minutes until deep mahogany brown.",
        ],
      },
    ],
  },

  // ── kenji_noodles new recipes ──────────────────────────────────────────────
  {
    slug: "shoyu-ramen",
    name: "Tokyo Shoyu Ramen",
    description: "Clear, amber broth — chicken and dashi base with a shoyu tare made from three soy sauces. The working person's ramen. Doable in 4 hours.",
    imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80",
    authorKey: "kenji_noodles",
    tags: ["japanese", "ramen", "soup", "chicken"],
    servings: 4,
    calories: 520,
    proteinG: 38,
    carbsG: 58,
    fatG: 14,
    fiberG: 2,
    starCount: 2541,
    forkCount: 267,
    tweakCount: 44,
    components: [
      {
        name: "shoyu-ramen",
        displayName: "Shoyu Ramen",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Chicken backs", slug: "chicken-backs", amount: 1.5, unit: "kg", calories: 215, protein: 19, carbs: 0, fat: 15, fiber: 0 },
          { name: "Kombu", slug: "kombu", amount: 20, unit: "g", calories: 45, protein: 1.7, carbs: 9.6, fat: 0.6, fiber: 0.5 },
          { name: "Katsuobushi", slug: "katsuobushi", amount: 30, unit: "g", calories: 335, protein: 77, carbs: 0, fat: 3, fiber: 0 },
          { name: "Japanese soy sauce", slug: "japanese-soy-sauce", amount: 80, unit: "ml", calories: 53, protein: 8.1, carbs: 4.9, fat: 0.6, fiber: 0.9 },
          { name: "Tamari", slug: "tamari", amount: 30, unit: "ml", calories: 60, protein: 10.5, carbs: 5.6, fat: 0, fiber: 0 },
          { name: "Mirin", slug: "mirin", amount: 30, unit: "ml", calories: 231, protein: 0.4, carbs: 46, fat: 0.1, fiber: 0 },
          { name: "Fresh ramen noodles", slug: "fresh-ramen-noodles", amount: 400, unit: "g", calories: 138, protein: 4.3, carbs: 28, fat: 0.4, fiber: 1.1 },
          { name: "Chashu pork belly", slug: "chashu-pork-belly", amount: 200, unit: "g", preparation: "sliced", calories: 518, protein: 9.3, carbs: 0, fat: 53, fiber: 0 },
          { name: "Soft-boiled eggs", slug: "soft-boiled-eggs", amount: 4, preparation: "halved", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Nori", slug: "nori", amount: 4, unit: "sheets", calories: 35, protein: 5.1, carbs: 5.1, fat: 0.3, fiber: 0 },
          { name: "Menma bamboo shoots", slug: "menma", amount: 100, unit: "g", calories: 11, protein: 1, carbs: 1.8, fat: 0.2, fiber: 0.9 },
        ],
        steps: [
          "Blanch chicken backs in boiling water 1 minute, drain, rinse. This removes impurities for a clear broth.",
          "Cold steep: cover kombu in 2L cold water for 30 min. Bring to 60C (do not boil). Remove kombu.",
          "Add blanched chicken to the dashi. Bring to a simmer, never a boil. Skim constantly for 30 minutes.",
          "Reduce heat to low. Simmer uncovered 3 hours. Add katsuobushi and steep 5 minutes. Strain through fine mesh.",
          "Make shoyu tare: combine soy sauce, tamari, and mirin in a small pan. Bring just to a simmer. Cool.",
          "Season broth with tare to taste — start with 3 tbsp per 400ml broth. Adjust.",
          "Cook noodles separately per package. Rinse briefly in cold water to stop cooking.",
          "Warm bowls, add noodles, pour hot broth. Top with chashu, half an egg, nori, and menma.",
        ],
      },
    ],
  },
  {
    slug: "mapo-tofu",
    name: "Mapo Tofu",
    description: "Sichuan mapo tofu: silken tofu in a fiery, numbing sauce of doubanjiang and Sichuan peppercorns. Finished with a cloud of ground pork.",
    imageUrl: "https://images.unsplash.com/photo-1536489885071-8ad6e9a25052?w=800&q=80",
    authorKey: "kenji_noodles",
    tags: ["chinese", "spicy", "quick", "dinner"],
    servings: 3,
    calories: 360,
    proteinG: 22,
    carbsG: 12,
    fatG: 26,
    fiberG: 3,
    starCount: 2891,
    forkCount: 312,
    tweakCount: 48,
    components: [
      {
        name: "mapo-tofu",
        displayName: "Mapo Tofu",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Silken tofu", slug: "silken-tofu", amount: 600, unit: "g", preparation: "cut into 2cm cubes", calories: 62, protein: 6.9, carbs: 1.4, fat: 3.7, fiber: 0.3 },
          { name: "Ground pork", slug: "ground-pork", amount: 150, unit: "g", calories: 263, protein: 18, carbs: 0, fat: 21, fiber: 0 },
          { name: "Doubanjiang", slug: "doubanjiang", amount: 3, unit: "tbsp", calories: 42, protein: 2.8, carbs: 5, fat: 1.5, fiber: 1.3 },
          { name: "Sichuan peppercorns", slug: "sichuan-peppercorns", amount: 1, unit: "tsp", preparation: "toasted and ground", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Fermented black beans", slug: "fermented-black-beans", amount: 2, unit: "tbsp", preparation: "roughly chopped", calories: 290, protein: 25, carbs: 42, fat: 4, fiber: 10 },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "minced", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Fresh ginger", slug: "fresh-ginger", amount: 1, unit: "inch", preparation: "minced", calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
          { name: "Chicken stock", slug: "chicken-stock", amount: 400, unit: "ml", calories: 10, protein: 1.5, carbs: 0.5, fat: 0.2, fiber: 0 },
          { name: "Cornstarch", slug: "cornstarch", amount: 2, unit: "tbsp", preparation: "mixed with 2 tbsp water", calories: 381, protein: 0.3, carbs: 91, fat: 0.1, fiber: 0.9 },
          { name: "Sesame oil", slug: "sesame-oil", amount: 1, unit: "tsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Green onions", slug: "green-onions", amount: 3, unit: "stalks", preparation: "sliced", calories: 32, protein: 1.8, carbs: 7.3, fat: 0.2, fiber: 2.6 },
        ],
        steps: [
          "Slide tofu cubes into a pot of barely simmering salted water for 5 minutes. This firms them slightly. Drain carefully.",
          "Cook ground pork in a wok over high heat until browned. Push to side.",
          "Add doubanjiang to the empty space. Fry in the pork fat for 1 minute — it turns deep red.",
          "Add black beans, garlic, and ginger. Stir everything together for 30 seconds.",
          "Pour in stock. Bring to a simmer. Gently slide in tofu cubes.",
          "Simmer 3 minutes, spooning sauce over tofu constantly. Push the tofu with a spoon, do not stir.",
          "Add cornstarch slurry. Stir gently at the edges until thickened.",
          "Remove from heat. Add sesame oil and ground Sichuan pepper. Scatter green onions on top.",
        ],
      },
    ],
  },
  {
    slug: "katsu-curry",
    name: "Japanese Katsu Curry",
    description: "Tonkatsu on a bed of glossy Japanese curry sauce and steamed rice. The S&B curry roux is non-negotiable.",
    imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
    authorKey: "kenji_noodles",
    tags: ["japanese", "curry", "chicken", "dinner"],
    servings: 4,
    calories: 680,
    proteinG: 35,
    carbsG: 82,
    fatG: 24,
    fiberG: 4,
    starCount: 3102,
    forkCount: 289,
    tweakCount: 52,
    components: [
      {
        name: "katsu-curry",
        displayName: "Katsu Curry",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Chicken breasts", slug: "chicken-breasts", amount: 4, unit: "large", preparation: "butterflied", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
          { name: "Panko breadcrumbs", slug: "panko-breadcrumbs", amount: 150, unit: "g", calories: 396, protein: 12, carbs: 73, fat: 4, fiber: 3.1 },
          { name: "Eggs", slug: "eggs", amount: 2, unit: "large", preparation: "beaten", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Japanese curry roux", slug: "japanese-curry-roux", amount: 200, unit: "g", preparation: "S&B Golden Curry", calories: 450, protein: 9, carbs: 56, fat: 21, fiber: 5 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 2, unit: "medium", preparation: "diced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Carrot", slug: "carrot", amount: 2, unit: "medium", preparation: "diced", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
          { name: "Potato", slug: "potato", amount: 2, unit: "medium", preparation: "diced", calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
          { name: "Vegetable oil", slug: "vegetable-oil", amount: 500, unit: "ml", preparation: "for frying", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Japanese short-grain rice", slug: "japanese-short-grain-rice", amount: 400, unit: "g", preparation: "rinsed and steamed", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
        ],
        steps: [
          "Pound chicken breasts to even thickness. Season. Dredge in flour, dip in egg, coat in panko.",
          "Sweat onions in oil until golden, 15 min. Add carrots and potatoes. Cook 5 minutes.",
          "Add 900ml water. Simmer 15 minutes until vegetables are tender.",
          "Break curry roux into blocks, add to pot. Stir until dissolved. Simmer on low for 10 minutes, stirring often.",
          "Fry breaded chicken at 170C for 6-7 minutes until golden and cooked through. Drain on rack.",
          "Slice chicken diagonally. Serve on rice with a generous ladle of curry sauce.",
        ],
      },
    ],
  },

  // ── raj_spice new recipes ──────────────────────────────────────────────────
  {
    slug: "chicken-biryani",
    name: "Hyderabadi Chicken Biryani",
    description: "Dum-style biryani: marinated chicken layered with saffron rice and slow-cooked under a sealed dough lid. The steam does the work.",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
    authorKey: "raj_spice",
    tags: ["indian", "chicken", "dinner", "high-protein", "spicy"],
    servings: 6,
    calories: 580,
    proteinG: 40,
    carbsG: 68,
    fatG: 16,
    fiberG: 3,
    starCount: 3891,
    forkCount: 445,
    tweakCount: 71,
    components: [
      {
        name: "biryani",
        displayName: "Biryani",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Chicken thighs", slug: "chicken-thighs", amount: 1, unit: "kg", preparation: "bone-in", calories: 177, protein: 18, carbs: 0, fat: 12, fiber: 0 },
          { name: "Basmati rice", slug: "basmati-rice", amount: 400, unit: "g", preparation: "soaked 30 min", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
          { name: "Whole milk yogurt", slug: "whole-milk-yogurt", amount: 200, unit: "g", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 3, unit: "large", preparation: "thinly sliced, fried golden", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Saffron", slug: "saffron", amount: 0.5, unit: "g", preparation: "steeped in 4 tbsp warm milk", calories: 310, protein: 11.4, carbs: 65.4, fat: 5.9, fiber: 3.9 },
          { name: "Ghee", slug: "ghee", amount: 4, unit: "tbsp", calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Whole spices", slug: "whole-spices", amount: 1, unit: "set", preparation: "bay leaf, cardamom, cinnamon, cloves", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Fresh ginger", slug: "fresh-ginger", amount: 2, unit: "inch", preparation: "grated", calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
          { name: "Garlic", slug: "garlic", amount: 8, unit: "cloves", preparation: "grated", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Green chilies", slug: "green-chilies", amount: 3, unit: "slitted lengthwise", calories: 40, protein: 2, carbs: 9, fat: 0.2, fiber: 1.5 },
        ],
        steps: [
          "Marinate chicken in yogurt, ginger-garlic paste, chili powder, garam masala, half the fried onions, and salt. Minimum 4 hours, overnight best.",
          "Parboil rice with whole spices and salt until 70% cooked — grains should have a white core. Drain.",
          "Layer: spread marinated chicken at the bottom of a heavy pot. Add a layer of rice, then saffron milk, ghee, remaining fried onions, and fresh mint.",
          "Seal the pot with dough or foil-tape. Cook on high heat 5 minutes, then on lowest possible heat for 25 minutes (dum cooking).",
          "Rest sealed for 10 minutes. Open and gently fold from the sides, keeping rice layers visible.",
          "Serve with raita and a wedge of lemon.",
        ],
      },
    ],
  },
  {
    slug: "palak-paneer",
    name: "Palak Paneer",
    description: "Silky spinach sauce, golden-fried paneer cubes. The green is preserved by the ice-bath trick. My mother's version, not the restaurant version.",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    authorKey: "raj_spice",
    tags: ["indian", "vegetarian", "spicy", "dinner", "high-protein"],
    servings: 4,
    calories: 380,
    proteinG: 22,
    carbsG: 16,
    fatG: 26,
    fiberG: 5,
    starCount: 2341,
    forkCount: 278,
    tweakCount: 38,
    components: [
      {
        name: "palak-paneer",
        displayName: "Palak Paneer",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Fresh spinach", slug: "fresh-spinach", amount: 500, unit: "g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
          { name: "Paneer", slug: "paneer", amount: 250, unit: "g", preparation: "cut into 2cm cubes", calories: 321, protein: 25, carbs: 3.4, fat: 23, fiber: 0 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 2, unit: "medium", preparation: "roughly chopped", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Garlic", slug: "garlic", amount: 5, unit: "cloves", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Fresh ginger", slug: "fresh-ginger", amount: 1, unit: "inch", calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
          { name: "Ghee", slug: "ghee", amount: 3, unit: "tbsp", calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Whole milk yogurt", slug: "whole-milk-yogurt", amount: 100, unit: "g", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
          { name: "Kashmiri chili powder", slug: "kashmiri-chili-powder", amount: 1, unit: "tsp", calories: 41, protein: 1.5, carbs: 7, fat: 1, fiber: 2 },
          { name: "Garam masala", slug: "garam-masala", amount: 1, unit: "tsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        ],
        steps: [
          "Blanch spinach in boiling salted water 1 minute. Shock immediately in ice water. Drain and squeeze out water.",
          "Blend spinach to a smooth puree. Set aside.",
          "Fry paneer cubes in ghee until golden on all sides. Remove and set aside.",
          "In the same pan, cook onions until golden brown. Add ginger, garlic, and whole spices. Cook 2 minutes.",
          "Add chili powder and cook 1 minute. Add the spinach puree and simmer 5 minutes.",
          "Stir in yogurt off the heat (or it will curdle). Return to low heat. Add fried paneer.",
          "Simmer 5 minutes. Finish with garam masala and a small knob of butter.",
        ],
      },
    ],
  },
  {
    slug: "vegetable-samosa",
    name: "Vegetable Samosas",
    description: "Flaky pastry shells filled with spiced potato and peas. The fold is the hard part. The eating is the reward. Makes 20.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    authorKey: "raj_spice",
    tags: ["indian", "vegetarian", "snack", "spicy"],
    servings: 10,
    calories: 180,
    proteinG: 4,
    carbsG: 24,
    fatG: 8,
    fiberG: 3,
    starCount: 1892,
    forkCount: 201,
    tweakCount: 29,
    components: [
      {
        name: "samosa",
        displayName: "Samosa",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 300, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Potato", slug: "potato", amount: 400, unit: "g", preparation: "boiled and diced", calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
          { name: "Frozen peas", slug: "frozen-peas", amount: 150, unit: "g", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1 },
          { name: "Cumin seeds", slug: "cumin-seeds", amount: 1, unit: "tsp", calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11 },
          { name: "Coriander seeds", slug: "coriander-seeds", amount: 1, unit: "tsp", preparation: "ground", calories: 298, protein: 12.4, carbs: 55, fat: 17.8, fiber: 41.9 },
          { name: "Amchur powder", slug: "amchur-powder", amount: 1, unit: "tsp", preparation: "dried mango powder", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Fresh ginger", slug: "fresh-ginger", amount: 0.5, unit: "inch", preparation: "grated", calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
          { name: "Vegetable oil", slug: "vegetable-oil", amount: 600, unit: "ml", preparation: "for deep frying", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Carom seeds", slug: "carom-seeds", amount: 0.5, unit: "tsp", preparation: "ajwain", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        ],
        steps: [
          "Make pastry: rub oil into flour and carom seeds until breadcrumb-like. Add cold water slowly until a stiff dough forms. Rest 30 minutes.",
          "Filling: heat oil, add cumin seeds until they pop. Add ginger and spices. Add potatoes and peas. Mash slightly. Add amchur and salt. Cool.",
          "Divide dough into 10 balls. Roll each into an oval, cut in half.",
          "Form each half into a cone, seal the seam with water. Fill with 2 tbsp potato mixture. Seal the top.",
          "Deep fry at 160C (not hotter) for 10-12 minutes until golden and pastry is cooked through.",
          "Serve with tamarind chutney and mint-coriander chutney.",
        ],
      },
    ],
  },

  // ── vivi_verde new recipes ─────────────────────────────────────────────────
  {
    slug: "shakshuka",
    name: "Shakshuka",
    description: "North African eggs poached in a spiced tomato and pepper sauce. One pan, twenty minutes, feeds a crowd. My go-to for lazy Sunday brunch.",
    imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["vegetarian", "breakfast", "quick", "mediterranean", "one-pot"],
    servings: 4,
    calories: 270,
    proteinG: 15,
    carbsG: 22,
    fatG: 14,
    fiberG: 5,
    starCount: 3541,
    forkCount: 398,
    tweakCount: 62,
    components: [
      {
        name: "shakshuka",
        displayName: "Shakshuka",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Eggs", slug: "eggs", amount: 6, unit: "large", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Canned whole tomatoes", slug: "canned-whole-tomatoes", amount: 800, unit: "g", calories: 18, protein: 0.9, carbs: 3.5, fat: 0.2, fiber: 1.1 },
          { name: "Red bell pepper", slug: "red-bell-pepper", amount: 2, unit: "large", preparation: "diced", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "large", preparation: "diced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Garlic", slug: "garlic", amount: 5, unit: "cloves", preparation: "sliced", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Smoked paprika", slug: "smoked-paprika", amount: 2, unit: "tsp", calories: 289, protein: 14.8, carbs: 56.6, fat: 12.9, fiber: 34.9 },
          { name: "Ground cumin", slug: "ground-cumin", amount: 1, unit: "tsp", calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11 },
          { name: "Harissa paste", slug: "harissa-paste", amount: 1, unit: "tbsp", calories: 115, protein: 4.5, carbs: 17, fat: 4, fiber: 4 },
          { name: "Olive oil", slug: "olive-oil", amount: 3, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Fresh coriander", slug: "fresh-coriander", amount: 1, unit: "handful", preparation: "chopped", calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
          { name: "Feta cheese", slug: "feta-cheese", amount: 100, unit: "g", preparation: "crumbled", isOptional: true, calories: 264, protein: 14.2, carbs: 4, fat: 21.3, fiber: 0 },
        ],
        steps: [
          "Heat olive oil in a large, wide skillet over medium heat. Cook onions until soft, 8 minutes. Add garlic and peppers, cook 5 more minutes.",
          "Add smoked paprika, cumin, and harissa. Cook spices for 1 minute.",
          "Crush tomatoes into the pan by hand. Season generously with salt. Simmer 15 minutes until sauce is thick.",
          "Make 6 wells in the sauce. Crack an egg into each well.",
          "Cover and cook on low until whites are set but yolks are still runny, 5-8 minutes.",
          "Remove from heat. Scatter feta and fresh coriander over the top. Serve directly from the pan with crusty bread.",
        ],
      },
    ],
  },
  {
    slug: "pad-thai-noodles",
    name: "Pad Thai (Vegan)",
    description: "Street-style pad thai with tofu instead of shrimp, and coconut aminos standing in for fish sauce. Tastes like the real thing, I promise.",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["thai", "vegan", "noodles", "quick", "dinner"],
    servings: 2,
    calories: 490,
    proteinG: 20,
    carbsG: 68,
    fatG: 16,
    fiberG: 4,
    starCount: 2891,
    forkCount: 334,
    tweakCount: 55,
    components: [
      {
        name: "pad-thai",
        displayName: "Pad Thai",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Rice noodles", slug: "rice-noodles", amount: 200, unit: "g", preparation: "soaked in cold water 30 min", calories: 364, protein: 2.7, carbs: 80, fat: 0.6, fiber: 1.8 },
          { name: "Firm tofu", slug: "firm-tofu", amount: 200, unit: "g", preparation: "pressed and cubed", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
          { name: "Bean sprouts", slug: "bean-sprouts", amount: 150, unit: "g", calories: 30, protein: 3, carbs: 5.9, fat: 0.2, fiber: 1.8 },
          { name: "Tamarind paste", slug: "tamarind-paste", amount: 3, unit: "tbsp", calories: 239, protein: 2.8, carbs: 62.5, fat: 0.6, fiber: 5.1 },
          { name: "Coconut aminos", slug: "coconut-aminos", amount: 2, unit: "tbsp", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0 },
          { name: "Palm sugar", slug: "palm-sugar", amount: 2, unit: "tbsp", calories: 375, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Garlic", slug: "garlic", amount: 3, unit: "cloves", preparation: "minced", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Vegetable oil", slug: "vegetable-oil", amount: 3, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Roasted peanuts", slug: "roasted-peanuts", amount: 50, unit: "g", preparation: "roughly chopped", calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
          { name: "Lime", slug: "lime", amount: 2, unit: "wedges per serving", calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8 },
          { name: "Green onions", slug: "green-onions", amount: 3, unit: "stalks", preparation: "sliced", calories: 32, protein: 1.8, carbs: 7.3, fat: 0.2, fiber: 2.6 },
        ],
        steps: [
          "Mix tamarind, coconut aminos, and palm sugar until sugar dissolves. This is the pad thai sauce.",
          "Press and drain tofu well. Fry in 1 tbsp oil over high heat until golden on all sides. Remove.",
          "Add remaining oil to wok over very high heat. Add garlic, cook 30 seconds.",
          "Drain soaked noodles. Add to wok, toss. Add pad thai sauce. Toss until noodles absorb sauce.",
          "Push noodles to one side. Add bean sprouts and tofu to the empty side. Toss everything together.",
          "Serve topped with peanuts, green onions, and lime wedges on the side.",
        ],
      },
    ],
  },
  {
    slug: "roasted-cauliflower-tahini",
    name: "Roasted Cauliflower with Tahini",
    description: "Whole cauliflower roasted in the oven until charred and tender, served over a pool of lemon-tahini. Middle Eastern pantry, zero effort.",
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["vegan", "vegetarian", "mediterranean", "dinner", "quick"],
    servings: 4,
    calories: 290,
    proteinG: 10,
    carbsG: 24,
    fatG: 18,
    fiberG: 7,
    starCount: 2104,
    forkCount: 245,
    tweakCount: 37,
    components: [
      {
        name: "roasted-cauliflower",
        displayName: "Roasted Cauliflower",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Cauliflower", slug: "cauliflower", amount: 1, unit: "large head", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.5 },
          { name: "Olive oil", slug: "olive-oil", amount: 5, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Tahini", slug: "tahini", amount: 120, unit: "g", calories: 595, protein: 17, carbs: 21.2, fat: 53.8, fiber: 9.3 },
          { name: "Lemon", slug: "lemon", amount: 2, unit: "juiced", calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 },
          { name: "Garlic", slug: "garlic", amount: 1, unit: "clove", preparation: "grated", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Smoked paprika", slug: "smoked-paprika", amount: 1, unit: "tsp", calories: 289, protein: 14.8, carbs: 56.6, fat: 12.9, fiber: 34.9 },
          { name: "Pine nuts", slug: "pine-nuts", amount: 30, unit: "g", preparation: "toasted", calories: 673, protein: 13.7, carbs: 13.1, fat: 68.4, fiber: 3.7 },
          { name: "Fresh parsley", slug: "fresh-parsley", amount: 1, unit: "handful", preparation: "chopped", calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3 },
          { name: "Za'atar", slug: "zaatar", amount: 2, unit: "tsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        ],
        steps: [
          "Preheat oven to 210C. Remove outer leaves from cauliflower. Make a few incisions into the core.",
          "Rub cauliflower all over with 3 tbsp olive oil, salt, paprika, and za'atar.",
          "Place in a baking dish, cover with foil. Roast 45 minutes. Remove foil, roast 20-25 more minutes until charred in spots.",
          "Make tahini sauce: whisk tahini, lemon juice, garlic, and enough cold water to reach a pourable consistency. Season.",
          "Pour tahini sauce on a serving platter. Place whole cauliflower on top.",
          "Scatter toasted pine nuts and parsley over. Drizzle remaining olive oil. Serve at the table for people to break into.",
        ],
      },
    ],
  },
  {
    slug: "mujaddara",
    name: "Mujaddara",
    description: "Lebanese lentils and rice with masses of caramelized onions. Humble pantry food that will make you understand why people call it holy.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    authorKey: "vivi_verde",
    tags: ["vegan", "vegetarian", "mediterranean", "dinner", "meal-prep"],
    servings: 6,
    calories: 380,
    proteinG: 16,
    carbsG: 62,
    fatG: 8,
    fiberG: 12,
    starCount: 1891,
    forkCount: 212,
    tweakCount: 31,
    components: [
      {
        name: "mujaddara",
        displayName: "Mujaddara",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Green or brown lentils", slug: "green-lentils", amount: 250, unit: "g", preparation: "rinsed", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
          { name: "Long-grain rice", slug: "long-grain-rice", amount: 200, unit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 4, unit: "large", preparation: "thinly sliced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Olive oil", slug: "olive-oil", amount: 6, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
          { name: "Ground cumin", slug: "ground-cumin", amount: 2, unit: "tsp", calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11 },
          { name: "Ground coriander", slug: "ground-coriander", amount: 1, unit: "tsp", calories: 298, protein: 12.4, carbs: 55, fat: 17.8, fiber: 41.9 },
          { name: "Ground cinnamon", slug: "ground-cinnamon", amount: 0.5, unit: "tsp", calories: 247, protein: 4, carbs: 80.6, fat: 1.2, fiber: 53.1 },
          { name: "Whole milk yogurt", slug: "whole-milk-yogurt", amount: 200, unit: "g", preparation: "to serve", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
        ],
        steps: [
          "Simmer lentils in plenty of water for 20 minutes until just tender. Drain, reserving some liquid.",
          "While lentils cook, heat olive oil in a wide heavy pan. Cook sliced onions over medium-low heat, stirring occasionally, 30-40 minutes until deeply caramelized and jammy.",
          "Remove two-thirds of the onions and set aside for topping.",
          "Add cumin, coriander, and cinnamon to remaining onions. Cook 1 minute.",
          "Add rice to the pan and stir to coat in the spiced oil.",
          "Add cooked lentils and 500ml water (or lentil cooking liquid). Season well. Bring to a boil, cover tightly, reduce to lowest heat. Cook 18 minutes.",
          "Rest covered off heat 5 minutes. Serve topped with the reserved caramelized onions and cold yogurt.",
        ],
      },
    ],
  },

  // ── tex_bbq new recipes ────────────────────────────────────────────────────
  {
    slug: "smoked-pulled-pork",
    name: "Smoked Pulled Pork",
    description: "Boston butt, 12-hour smoke at 225F, apple wood. Bark is mandatory. Internal temp 203F and a rest in butcher paper makes it pull apart perfectly.",
    imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
    authorKey: "tex_bbq",
    tags: ["bbq", "american", "pork", "meal-prep", "dinner"],
    servings: 12,
    calories: 420,
    proteinG: 48,
    carbsG: 8,
    fatG: 22,
    fiberG: 1,
    starCount: 2891,
    forkCount: 312,
    tweakCount: 49,
    components: [
      {
        name: "pulled-pork",
        displayName: "Pulled Pork",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Bone-in pork butt", slug: "bone-in-pork-butt", amount: 4, unit: "kg", calories: 263, protein: 18, carbs: 0, fat: 21, fiber: 0 },
          { name: "Kosher salt", slug: "kosher-salt", amount: 4, unit: "tbsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Black pepper", slug: "black-pepper", amount: 2, unit: "tbsp", preparation: "coarsely ground", calories: 6, protein: 0.2, carbs: 1.5, fat: 0.1, fiber: 0.5 },
          { name: "Brown sugar", slug: "brown-sugar", amount: 2, unit: "tbsp", calories: 380, protein: 0, carbs: 98, fat: 0, fiber: 0 },
          { name: "Smoked paprika", slug: "smoked-paprika", amount: 2, unit: "tbsp", calories: 289, protein: 14.8, carbs: 56.6, fat: 12.9, fiber: 34.9 },
          { name: "Garlic powder", slug: "garlic-powder", amount: 1, unit: "tbsp", calories: 331, protein: 16.6, carbs: 72.7, fat: 0.7, fiber: 9.6 },
          { name: "Cayenne pepper", slug: "cayenne-pepper", amount: 1, unit: "tsp", calories: 318, protein: 12.1, carbs: 56.6, fat: 17.3, fiber: 27.3 },
          { name: "Apple wood chunks", slug: "apple-wood", amount: 4, unit: "chunks", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Apple juice", slug: "apple-juice", amount: 200, unit: "ml", preparation: "for spritzing", calories: 46, protein: 0.1, carbs: 11.4, fat: 0.1, fiber: 0.2 },
        ],
        steps: [
          "Mix rub ingredients. Coat pork butt liberally on all sides. Let sit uncovered in fridge overnight minimum.",
          "Remove from fridge 1 hour before cooking. Set up smoker at 225F with apple wood.",
          "Smoke fat cap up for 6 hours. Spritz with apple juice every 45 minutes after the first 2 hours.",
          "When bark is set and dark mahogany (around internal 165F), wrap tightly in butcher paper.",
          "Continue smoking until internal temperature reaches 203F and a probe slides in with zero resistance, approximately 12 hours total.",
          "Rest wrapped in a cooler for at least 1 hour, up to 4 hours.",
          "Pull by hand or with forks. The bone should slide right out.",
          "Mix in any rendered juices from the paper. Season to taste. Serve on buns with slaw.",
        ],
      },
    ],
  },
  {
    slug: "smoked-mac-and-cheese",
    name: "Smoked Mac and Cheese",
    description: "Competition mac and cheese: velveeta base for the protein strands, sharp cheddar for flavor, 2 hours on the smoker. Gets a crust. Changes people.",
    imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80",
    authorKey: "tex_bbq",
    tags: ["american", "bbq", "comfort-food", "dinner"],
    servings: 8,
    calories: 580,
    proteinG: 26,
    carbsG: 52,
    fatG: 32,
    fiberG: 2,
    starCount: 2341,
    forkCount: 267,
    tweakCount: 38,
    components: [
      {
        name: "smoked-mac",
        displayName: "Smoked Mac and Cheese",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Elbow macaroni", slug: "elbow-macaroni", amount: 450, unit: "g", calories: 131, protein: 5, carbs: 26, fat: 0.5, fiber: 1.8 },
          { name: "Velveeta", slug: "velveeta", amount: 400, unit: "g", preparation: "cubed", calories: 318, protein: 16, carbs: 9, fat: 24, fiber: 0 },
          { name: "Sharp cheddar", slug: "sharp-cheddar", amount: 300, unit: "g", preparation: "grated", calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
          { name: "Smoked gouda", slug: "smoked-gouda", amount: 200, unit: "g", preparation: "grated", calories: 356, protein: 25, carbs: 2.2, fat: 27, fiber: 0 },
          { name: "Whole milk", slug: "whole-milk", amount: 400, unit: "ml", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
          { name: "Heavy cream", slug: "heavy-cream", amount: 200, unit: "ml", calories: 340, protein: 2.7, carbs: 2.7, fat: 36, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 2, unit: "large", preparation: "beaten", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Yellow mustard", slug: "yellow-mustard", amount: 1, unit: "tbsp", calories: 66, protein: 3.7, carbs: 6.7, fat: 3.3, fiber: 2.2 },
          { name: "Hot sauce", slug: "hot-sauce", amount: 1, unit: "tsp", calories: 11, protein: 0.4, carbs: 2.2, fat: 0, fiber: 0.2 },
        ],
        steps: [
          "Cook macaroni to al dente. Drain but do not rinse.",
          "Combine milk, cream, beaten eggs, mustard, and hot sauce in a large cast iron skillet or foil pan.",
          "Add hot macaroni and all cheeses. Stir well — the pasta heat will start melting the cheese.",
          "Set smoker to 250F. Put mac on the smoker uncovered.",
          "After 1 hour, stir gently. After 2 hours, a skin should have formed on top and edges should be bubbly.",
          "Let rest 10 minutes before serving. The texture firms up as it cools slightly.",
        ],
      },
    ],
  },
  {
    slug: "smoked-chicken-thighs",
    name: "Competition Smoked Chicken Thighs",
    description: "Pecan-wood chicken thighs. The Alabama white sauce on the side is not optional. Competition circuit secret: scrape off the rubbery smoked skin and replace with a butter-basted finish.",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80",
    authorKey: "tex_bbq",
    tags: ["bbq", "american", "chicken", "dinner", "high-protein"],
    servings: 8,
    calories: 380,
    proteinG: 42,
    carbsG: 6,
    fatG: 20,
    fiberG: 1,
    starCount: 2104,
    forkCount: 223,
    tweakCount: 34,
    components: [
      {
        name: "smoked-chicken",
        displayName: "Smoked Chicken Thighs",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Bone-in skin-on chicken thighs", slug: "bone-in-chicken-thighs", amount: 8, unit: "pieces", calories: 177, protein: 18, carbs: 0, fat: 12, fiber: 0 },
          { name: "Brown sugar", slug: "brown-sugar", amount: 2, unit: "tbsp", calories: 380, protein: 0, carbs: 98, fat: 0, fiber: 0 },
          { name: "Smoked paprika", slug: "smoked-paprika", amount: 2, unit: "tbsp", calories: 289, protein: 14.8, carbs: 56.6, fat: 12.9, fiber: 34.9 },
          { name: "Garlic powder", slug: "garlic-powder", amount: 1, unit: "tbsp", calories: 331, protein: 16.6, carbs: 72.7, fat: 0.7, fiber: 9.6 },
          { name: "Kosher salt", slug: "kosher-salt", amount: 2, unit: "tbsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Black pepper", slug: "black-pepper", amount: 1, unit: "tbsp", calories: 6, protein: 0.2, carbs: 1.5, fat: 0.1, fiber: 0.5 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 100, unit: "g", preparation: "melted", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Pecan wood chunks", slug: "pecan-wood", amount: 3, unit: "chunks", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Mayonnaise", slug: "mayonnaise", amount: 200, unit: "g", preparation: "for white sauce", calories: 680, protein: 0.9, carbs: 0.6, fat: 75, fiber: 0 },
          { name: "Apple cider vinegar", slug: "apple-cider-vinegar", amount: 3, unit: "tbsp", preparation: "for white sauce", calories: 21, protein: 0, carbs: 0.9, fat: 0, fiber: 0 },
          { name: "Horseradish", slug: "horseradish", amount: 2, unit: "tsp", preparation: "for white sauce", isOptional: false, calories: 48, protein: 1.2, carbs: 11.3, fat: 0.5, fiber: 3.3 },
        ],
        steps: [
          "Mix all dry rub ingredients. Coat chicken thighs generously under and over the skin.",
          "Refrigerate uncovered on a rack overnight.",
          "Set up smoker with pecan wood at 250F.",
          "Smoke chicken thighs skin-side up for 2-2.5 hours until internal temp hits 175F.",
          "Make Alabama white sauce: whisk mayo, apple cider vinegar, horseradish, black pepper, and a pinch of sugar.",
          "For a clean finish: scrape the skin off each thigh, brush the now-naked chicken with melted butter, and return to high heat (direct or 400F oven) for 5 minutes to re-crisp.",
          "Serve with white sauce on the side.",
        ],
      },
    ],
  },
  {
    slug: "st-louis-ribs",
    name: "St. Louis-Style Smoked Ribs",
    description: "3-2-1 method: 3 hours smoke, 2 hours wrapped, 1 hour sauced. Fall-off-the-bone but with bite. Competition ribs don't actually fall off the bone.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    authorKey: "tex_bbq",
    tags: ["bbq", "american", "pork", "dinner"],
    servings: 4,
    calories: 620,
    proteinG: 45,
    carbsG: 18,
    fatG: 40,
    fiberG: 1,
    starCount: 3102,
    forkCount: 334,
    tweakCount: 52,
    components: [
      {
        name: "st-louis-ribs",
        displayName: "St. Louis Ribs",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "St. Louis-style pork ribs", slug: "st-louis-ribs", amount: 2, unit: "racks", calories: 263, protein: 18, carbs: 0, fat: 21, fiber: 0 },
          { name: "Brown sugar", slug: "brown-sugar", amount: 4, unit: "tbsp", calories: 380, protein: 0, carbs: 98, fat: 0, fiber: 0 },
          { name: "Smoked paprika", slug: "smoked-paprika", amount: 2, unit: "tbsp", calories: 289, protein: 14.8, carbs: 56.6, fat: 12.9, fiber: 34.9 },
          { name: "Black pepper", slug: "black-pepper", amount: 1, unit: "tbsp", calories: 6, protein: 0.2, carbs: 1.5, fat: 0.1, fiber: 0.5 },
          { name: "Kosher salt", slug: "kosher-salt", amount: 2, unit: "tbsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Garlic powder", slug: "garlic-powder", amount: 1, unit: "tbsp", calories: 331, protein: 16.6, carbs: 72.7, fat: 0.7, fiber: 9.6 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 60, unit: "g", preparation: "for wrapping stage", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Honey", slug: "honey", amount: 3, unit: "tbsp", calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2 },
          { name: "BBQ sauce", slug: "bbq-sauce", amount: 200, unit: "ml", preparation: "for finishing", calories: 172, protein: 1.2, carbs: 41, fat: 0.5, fiber: 0.5 },
          { name: "Apple cider vinegar", slug: "apple-cider-vinegar", amount: 2, unit: "tbsp", calories: 21, protein: 0, carbs: 0.9, fat: 0, fiber: 0 },
        ],
        steps: [
          "Remove membrane from bone side of ribs. Trim excess fat.",
          "Mix dry rub and coat ribs generously on both sides. Let sit overnight in the fridge.",
          "Smoke at 225F for 3 hours with hickory or cherry wood. Spritz with apple cider vinegar every 45 min.",
          "Wrap in foil with butter, honey, and a splash of vinegar. Return to smoker 2 hours.",
          "Unwrap, brush with BBQ sauce. Return to smoker 1 hour unwrapped to set the glaze.",
          "The bend test: grab one end with tongs. The rack should bend 90 degrees without breaking. If it breaks, it's overcooked.",
        ],
      },
    ],
  },

  // ── maite_mx new recipes ───────────────────────────────────────────────────
  {
    slug: "enchiladas-rojas",
    name: "Enchiladas Rojas",
    description: "Corn tortillas dipped in chile colorado sauce, filled with shredded chicken, topped with crema and queso fresco. Three chiles minimum.",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    authorKey: "maite_mx",
    tags: ["mexican", "chicken", "dinner", "spicy"],
    servings: 4,
    calories: 480,
    proteinG: 28,
    carbsG: 46,
    fatG: 20,
    fiberG: 6,
    starCount: 2341,
    forkCount: 256,
    tweakCount: 38,
    components: [
      {
        name: "enchiladas-rojas",
        displayName: "Enchiladas Rojas",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Corn tortillas", slug: "corn-tortillas", amount: 12, unit: "tortillas", calories: 209, protein: 5.7, carbs: 44, fat: 2.8, fiber: 4 },
          { name: "Chicken thighs", slug: "chicken-thighs", amount: 500, unit: "g", preparation: "poached and shredded", calories: 177, protein: 18, carbs: 0, fat: 12, fiber: 0 },
          { name: "Dried ancho chiles", slug: "dried-ancho-chiles", amount: 4, unit: "dried", preparation: "stems and seeds removed", calories: 282, protein: 10.4, carbs: 61.9, fat: 5.5, fiber: 19.8 },
          { name: "Dried guajillo chiles", slug: "dried-guajillo-chiles", amount: 4, unit: "dried", preparation: "stems and seeds removed", calories: 282, protein: 10.4, carbs: 61.9, fat: 5.5, fiber: 19.8 },
          { name: "Yellow onion", slug: "yellow-onion", amount: 1, unit: "large", preparation: "quartered", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Chicken stock", slug: "chicken-stock", amount: 400, unit: "ml", calories: 10, protein: 1.5, carbs: 0.5, fat: 0.2, fiber: 0 },
          { name: "Mexican crema", slug: "mexican-crema", amount: 150, unit: "ml", calories: 193, protein: 2.4, carbs: 4.3, fat: 19, fiber: 0 },
          { name: "Queso fresco", slug: "queso-fresco", amount: 150, unit: "g", preparation: "crumbled", calories: 298, protein: 22, carbs: 3, fat: 22, fiber: 0 },
          { name: "Vegetable oil", slug: "vegetable-oil", amount: 3, unit: "tbsp", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        ],
        steps: [
          "Toast dried chiles in a dry skillet until fragrant, 30 seconds per side. Soak in boiling water for 20 minutes.",
          "Blend soaked chiles with garlic, onion, stock, and soaking liquid. Strain through a fine mesh.",
          "Fry the sauce in hot oil 3-4 minutes until darkened and aromatic. Season. Add more stock to adjust consistency.",
          "Poach chicken in salted water until cooked through. Shred finely.",
          "Working quickly: dip each tortilla in hot chile sauce for 5 seconds per side. Fill with shredded chicken, fold, and arrange in a baking dish.",
          "Pour remaining sauce over enchiladas. Bake at 180C for 15 minutes.",
          "Serve topped with crema, queso fresco, and thinly sliced white onion.",
        ],
      },
    ],
  },
  {
    slug: "guacamole",
    name: "Guacamole de Molcajete",
    description: "Made in a stone mortar as God intended. The order of addition matters. Lime goes in last.",
    imageUrl: "https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=800&q=80",
    authorKey: "maite_mx",
    tags: ["mexican", "vegan", "quick", "vegetarian"],
    servings: 4,
    calories: 190,
    proteinG: 2,
    carbsG: 12,
    fatG: 16,
    fiberG: 7,
    starCount: 1892,
    forkCount: 201,
    tweakCount: 29,
    components: [
      {
        name: "guacamole",
        displayName: "Guacamole",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Ripe Hass avocados", slug: "ripe-avocados", amount: 3, unit: "large", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
          { name: "White onion", slug: "white-onion", amount: 0.5, unit: "small", preparation: "finely diced", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Jalapeño", slug: "jalapeno", amount: 1, unit: "seeded and minced", calories: 29, protein: 0.9, carbs: 6.5, fat: 0.2, fiber: 2.5 },
          { name: "Serrano chile", slug: "serrano-chile", amount: 1, unit: "minced", calories: 32, protein: 1.8, carbs: 6.7, fat: 0.5, fiber: 3.7 },
          { name: "Fresh coriander", slug: "fresh-coriander", amount: 1, unit: "large handful", preparation: "chopped, stems included", calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
          { name: "Kosher salt", slug: "kosher-salt", amount: 1, unit: "tsp", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          { name: "Lime", slug: "lime", amount: 1, unit: "juiced", calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8 },
        ],
        steps: [
          "In the molcajete, grind onion and serrano with salt to a coarse paste.",
          "Add jalapeño and pound lightly.",
          "Halve avocados, remove pits. Scoop flesh into the molcajete. Mash — some chunks are good.",
          "Add coriander, fold gently.",
          "Add lime juice last, fold once. Taste. The avocado should be the dominant flavor.",
          "Serve immediately or press plastic wrap directly on the surface. Will keep 2 hours in the fridge.",
        ],
      },
    ],
  },
  {
    slug: "chiles-en-nogada",
    name: "Chiles en Nogada",
    description: "Mexico's most spectacular dish. Poblanos stuffed with a picadillo of pork, fruit, and spices. Walnut cream sauce, pomegranate, and parsley. The colors of the flag.",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    authorKey: "maite_mx",
    tags: ["mexican", "pork", "dinner"],
    servings: 6,
    calories: 520,
    proteinG: 24,
    carbsG: 42,
    fatG: 28,
    fiberG: 5,
    starCount: 2891,
    forkCount: 178,
    tweakCount: 24,
    components: [
      {
        name: "chiles-en-nogada",
        displayName: "Chiles en Nogada",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Large poblano chiles", slug: "poblano-chiles", amount: 6, unit: "large", calories: 33, protein: 1.9, carbs: 7.9, fat: 0.2, fiber: 3.2 },
          { name: "Ground pork", slug: "ground-pork", amount: 400, unit: "g", calories: 263, protein: 18, carbs: 0, fat: 21, fiber: 0 },
          { name: "Peaches", slug: "peaches", amount: 2, unit: "diced", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5 },
          { name: "Pears", slug: "pears", amount: 1, unit: "diced", calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1 },
          { name: "Almonds", slug: "almonds", amount: 50, unit: "g", preparation: "slivered", calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9, fiber: 12.5 },
          { name: "Raisins", slug: "raisins", amount: 50, unit: "g", calories: 299, protein: 3.1, carbs: 79.2, fat: 0.5, fiber: 3.7 },
          { name: "Walnut halves", slug: "walnut-halves", amount: 150, unit: "g", calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
          { name: "Sour cream", slug: "sour-cream", amount: 200, unit: "ml", calories: 198, protein: 3.4, carbs: 4.9, fat: 19.4, fiber: 0 },
          { name: "Cream cheese", slug: "cream-cheese", amount: 100, unit: "g", preparation: "softened", calories: 342, protein: 6, carbs: 4.1, fat: 33.8, fiber: 0 },
          { name: "Pomegranate seeds", slug: "pomegranate-seeds", amount: 1, unit: "cup", calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4 },
          { name: "Fresh parsley", slug: "fresh-parsley", amount: 1, unit: "small bunch", preparation: "chopped", calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3 },
        ],
        steps: [
          "Char poblanos directly over gas flame until completely blackened. Place in a plastic bag 15 minutes to steam. Peel, make a slit down one side, remove seeds carefully.",
          "Cook ground pork until browned. Add diced fruit, almonds, raisins, and spices (cinnamon, cloves, black pepper). Cook 10 minutes. Cool completely.",
          "Stuff each chile with picadillo. Close with a toothpick.",
          "Make nogada: blend walnuts, cream cheese, and sour cream until silky smooth. Season with salt and a tiny pinch of cinnamon. Should be thick enough to coat a spoon.",
          "Plate by laying stuffed chile on a white plate. Spoon walnut sauce generously over.",
          "Scatter pomegranate seeds and parsley over the white sauce. The three colors should be vivid.",
          "Serve at room temperature, never hot. The contrast of warm filling and cool sauce is intentional.",
        ],
      },
    ],
  },

  // ── chef_alex new recipes ──────────────────────────────────────────────────
  {
    slug: "coq-au-vin",
    name: "Coq au Vin",
    description: "Chicken braised in an entire bottle of Burgundy. The French answer to boredom. Takes 4 hours and cannot be rushed.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    authorKey: "chef_alex",
    tags: ["french", "chicken", "dinner", "comfort-food"],
    servings: 4,
    calories: 520,
    proteinG: 42,
    carbsG: 18,
    fatG: 24,
    fiberG: 3,
    starCount: 2104,
    forkCount: 234,
    tweakCount: 36,
    components: [
      {
        name: "coq-au-vin",
        displayName: "Coq au Vin",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Whole chicken", slug: "whole-chicken", amount: 1.5, unit: "kg", preparation: "cut into 8 pieces", calories: 215, protein: 18, carbs: 0, fat: 15, fiber: 0 },
          { name: "Red Burgundy wine", slug: "red-burgundy-wine", amount: 750, unit: "ml", preparation: "or any full-bodied Pinot Noir", calories: 85, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0 },
          { name: "Lardons", slug: "lardons", amount: 150, unit: "g", calories: 541, protein: 17, carbs: 0, fat: 52, fiber: 0 },
          { name: "Pearl onions", slug: "pearl-onions", amount: 200, unit: "g", preparation: "peeled", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
          { name: "Button mushrooms", slug: "button-mushrooms", amount: 300, unit: "g", preparation: "halved", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
          { name: "Chicken stock", slug: "chicken-stock", amount: 300, unit: "ml", calories: 10, protein: 1.5, carbs: 0.5, fat: 0.2, fiber: 0 },
          { name: "Garlic", slug: "garlic", amount: 4, unit: "cloves", preparation: "crushed", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
          { name: "Fresh thyme", slug: "fresh-thyme", amount: 4, unit: "sprigs", calories: 101, protein: 5.6, carbs: 24.5, fat: 1.7, fiber: 14 },
          { name: "Bay leaves", slug: "bay-leaves", amount: 2, unit: "leaves", calories: 313, protein: 7.6, carbs: 74.9, fat: 8.4, fiber: 26.3 },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 3, unit: "tbsp", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Tomato paste", slug: "tomato-paste", amount: 2, unit: "tbsp", calories: 82, protein: 4.3, carbs: 18.9, fat: 0.5, fiber: 4.1 },
          { name: "Cognac", slug: "cognac", amount: 60, unit: "ml", isOptional: true, calories: 231, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        ],
        steps: [
          "Marinate chicken pieces in wine with thyme, bay leaves, and garlic overnight in the fridge.",
          "Remove chicken, pat dry, strain marinade and reserve.",
          "Brown lardons until crispy. Remove. Brown chicken pieces in lardon fat, skin side first, until deeply golden. Remove.",
          "Sauté pearl onions until lightly colored. Add mushrooms, cook until dry. Remove.",
          "Add flour to the pan, cook 2 minutes. Add tomato paste and cognac if using — flambé if you dare.",
          "Pour in reserved wine marinade and chicken stock. Bring to a simmer, scraping up any fond.",
          "Return chicken to pot. Cover and braise at 150C for 1.5-2 hours.",
          "Add lardons, pearl onions, and mushrooms for the last 30 minutes.",
          "Taste, adjust seasoning. Sauce should coat the back of a spoon. Serve with buttered egg noodles.",
        ],
      },
    ],
  },
  {
    slug: "creme-brulee",
    name: "Crème Brûlée",
    description: "Vanilla custard, a millimetre of burnt sugar. The ratio is 1:5 yolk to cream. Do not compromise.",
    imageUrl: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80",
    authorKey: "chef_alex",
    tags: ["french", "dessert", "sweet"],
    servings: 6,
    calories: 480,
    proteinG: 8,
    carbsG: 32,
    fatG: 36,
    fiberG: 0,
    starCount: 2891,
    forkCount: 256,
    tweakCount: 41,
    components: [
      {
        name: "creme-brulee",
        displayName: "Crème Brûlée",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Double cream", slug: "double-cream", amount: 600, unit: "ml", calories: 340, protein: 2.7, carbs: 2.7, fat: 36, fiber: 0 },
          { name: "Eggs", slug: "eggs", amount: 6, unit: "yolks only", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
          { name: "Caster sugar", slug: "caster-sugar", amount: 100, unit: "g", preparation: "plus 6 tsp for topping", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Vanilla bean", slug: "vanilla-bean", amount: 1, unit: "scraped", calories: 288, protein: 0.1, carbs: 12.7, fat: 0.1, fiber: 0 },
        ],
        steps: [
          "Preheat oven to 140C.",
          "Heat cream with the vanilla pod and seeds until just below a simmer. Do not boil.",
          "Whisk yolks with sugar until pale and slightly thickened. Whisk in the warm cream very slowly. Strain through a fine sieve.",
          "Pour into 6 ramekins. Place in a bain-marie (deep roasting pan filled with hot water halfway up the ramekins).",
          "Bake 40-45 minutes until the custard is set around the edges but still has a slight wobble in the centre — like set jelly.",
          "Remove from water bath, cool. Refrigerate at least 4 hours, overnight is better.",
          "When ready to serve, scatter 1 tsp caster sugar over each custard. Caramelize with a blowtorch until amber and cracked. Serve within 5 minutes.",
        ],
      },
    ],
  },
  {
    slug: "tarte-tatin",
    name: "Tarte Tatin",
    description: "The upside-down apple tart that was supposedly invented by accident. The caramel is the whole point. Use a proper ovenproof skillet.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
    authorKey: "chef_alex",
    tags: ["french", "dessert", "sweet", "baking"],
    servings: 8,
    calories: 360,
    proteinG: 3,
    carbsG: 52,
    fatG: 16,
    fiberG: 3,
    starCount: 2341,
    forkCount: 212,
    tweakCount: 35,
    components: [
      {
        name: "tarte-tatin",
        displayName: "Tarte Tatin",
        type: "FOLDER",
        order: 0,
        ingredients: [
          { name: "Granny Smith apples", slug: "granny-smith-apples", amount: 8, unit: "medium", preparation: "peeled, cored, halved", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
          { name: "Caster sugar", slug: "caster-sugar", amount: 150, unit: "g", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
          { name: "Unsalted butter", slug: "unsalted-butter", amount: 80, unit: "g", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Vanilla bean", slug: "vanilla-bean", amount: 0.5, unit: "scraped", isOptional: true, calories: 288, protein: 0.1, carbs: 12.7, fat: 0.1, fiber: 0 },
          { name: "All-purpose flour", slug: "all-purpose-flour", amount: 200, unit: "g", calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
          { name: "Cold unsalted butter", slug: "unsalted-butter", amount: 100, unit: "g", preparation: "for pastry, diced cold", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
          { name: "Icing sugar", slug: "icing-sugar", amount: 30, unit: "g", preparation: "for pastry", calories: 389, protein: 0, carbs: 100, fat: 0, fiber: 0 },
        ],
        steps: [
          "Make rough puff or shortcrust: rub cold butter into flour and icing sugar. Add enough cold water to form a dough. Refrigerate 30 minutes.",
          "In a 25cm ovenproof skillet, melt sugar and butter over medium heat without stirring until it reaches an amber caramel.",
          "Arrange apple halves tightly in concentric circles in the caramel, cut side up. They will shrink.",
          "Cook apples in caramel over medium heat 10-15 minutes, basting constantly. They should be tender and coated.",
          "Roll pastry into a circle slightly bigger than your pan. Lay over the apples and tuck edges down the sides.",
          "Bake at 200C for 25-30 minutes until pastry is deep golden.",
          "The critical moment: cool 10 minutes, then flip confidently onto a plate. Do not hesitate.",
          "Serve warm with creme fraiche or vanilla ice cream.",
        ],
      },
    ],
  },
];

// ─── Fork Recipes ─────────────────────────────────────────────────────────────

type ForkDef = {
  sourceSlug: string;
  sourceAuthorKey: string;
  newSlug: string;
  newName: string;
  newDescription: string;
  forkedByKey: string;
  tweakMessage: string;
  tags: string[];
  starCount: number;
  forkCount: number;
  imageUrl?: string;
};

const FORK_RECIPES: ForkDef[] = [
  // Vegan versions
  {
    sourceSlug: "cacio-e-pepe",
    sourceAuthorKey: "marco_cucina",
    newSlug: "vegan-cacio-e-pepe",
    newName: "Vegan Cacio e Pepe",
    newDescription: "Cashew cream and nutritional yeast replace the Pecorino. Skeptical? So was I. Now it's my weeknight go-to.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace dairy cheeses with cashew cream + nutritional yeast blend",
    tags: ["vegan", "pasta", "italian", "quick"],
    starCount: 891,
    forkCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  },
  {
    sourceSlug: "chicken-tikka-masala",
    sourceAuthorKey: "raj_spice",
    newSlug: "paneer-tikka-masala",
    newName: "Paneer Tikka Masala",
    newDescription: "Swap chicken for homemade paneer. Better charring on the tikka, richer sauce that absorbs into the cheese.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Paneer replaces chicken. Added fenugreek seeds to the masala.",
    tags: ["indian", "vegetarian", "spicy", "dinner"],
    starCount: 1204,
    forkCount: 112,
  },
  {
    sourceSlug: "ribollita",
    sourceAuthorKey: "marco_cucina",
    newSlug: "ribollita-with-parmesan",
    newName: "Ribollita (Non-Vegan Version)",
    newDescription: "Keep the Parmesan rind in throughout cooking, and finish each bowl with proper grated Parmesan. How Tuscans actually make it.",
    forkedByKey: "chef_alex",
    tweakMessage: "Add Parmesan rind to broth, finish with grated Parmigiano at the table",
    tags: ["italian", "soup", "vegetarian", "comfort-food"],
    starCount: 678,
    forkCount: 45,
  },
  // Gluten-free versions
  {
    sourceSlug: "brown-butter-chocolate-chip-cookies",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "gf-brown-butter-cookies",
    newName: "GF Brown Butter Chocolate Chip Cookies",
    newDescription: "1:1 gluten-free flour swap plus a splash of almond flour for texture. Undetectable. My celiac husband ate seven of these.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Swap all-purpose flour for GF 1:1 blend + 30g almond flour",
    tags: ["gluten-free", "baking", "sweet", "dessert"],
    starCount: 1102,
    forkCount: 134,
    imageUrl: "https://images.unsplash.com/photo-1605286978633-2dec93ff88a2?w=800&q=80",
  },
  // Spicier versions
  {
    sourceSlug: "dal-makhani",
    sourceAuthorKey: "raj_spice",
    newSlug: "dal-makhani-extra-spicy",
    newName: "Extra Spicy Dal Makhani",
    newDescription: "For those who think the original isn't spicy enough. Green chilies in the tempering plus extra kashmiri chili. Not for the faint-hearted.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Add green bird eye chilis to tadka. Double the kashmiri chili.",
    tags: ["indian", "vegetarian", "spicy", "comfort-food"],
    starCount: 567,
    forkCount: 43,
  },
  // Weeknight/quick versions
  {
    sourceSlug: "tonkotsu-ramen",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "weeknight-chicken-ramen",
    newName: "Weeknight Chicken Ramen",
    newDescription: "2-hour version using chicken backs instead of pork trotters. Still rich, still real. For when you can't do the full 18-hour odyssey.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Chicken backs replace pork trotters. 2-hour broth, shoyu tare unchanged.",
    tags: ["japanese", "ramen", "soup", "chicken", "quick"],
    starCount: 1891,
    forkCount: 201,
    imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
  },
  {
    sourceSlug: "beef-bourguignon",
    sourceAuthorKey: "chef_alex",
    newSlug: "instant-pot-bourguignon",
    newName: "Instant Pot Beef Bourguignon",
    newDescription: "Same wine, same fond, 45 minutes under pressure instead of 3 hours in the oven. Weeknight bourguignon is a thing now.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Instant Pot pressure cook 45 min on high instead of 3hr oven braise",
    tags: ["french", "beef", "comfort-food", "quick", "one-pot"],
    starCount: 2341,
    forkCount: 267,
  },
  {
    sourceSlug: "texas-brisket",
    sourceAuthorKey: "tex_bbq",
    newSlug: "oven-brisket",
    newName: "Oven Brisket (No Smoker Required)",
    newDescription: "No smoker? No problem. Liquid smoke and a very long low oven gets you 80% of the way there. Respectable brisket for apartment dwellers.",
    forkedByKey: "chef_alex",
    tweakMessage: "Replace smoker with oven at 120C + 1 tsp liquid smoke in braising liquid",
    tags: ["american", "beef", "comfort-food", "dinner"],
    starCount: 1456,
    forkCount: 189,
    imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",
  },
  // Korean fusion
  {
    sourceSlug: "gyoza",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "kimchi-mandu",
    newName: "Kimchi Mandu",
    newDescription: "Korean twist on gyoza: kimchi and glass noodles in the filling, no pleating required. Just fold and pinch.",
    forkedByKey: "raj_spice",
    tweakMessage: "Add 100g chopped kimchi and 30g cooked glass noodles to filling. Korean fold instead of Japanese pleat.",
    tags: ["korean", "spicy", "quick"],
    starCount: 892,
    forkCount: 78,
  },
  // BBQ versions
  {
    sourceSlug: "pozole-rojo",
    sourceAuthorKey: "maite_mx",
    newSlug: "pozole-verde",
    newName: "Pozole Verde",
    newDescription: "Green version with tomatillos, pepitas, and chicken. Brighter, more acidic, completely different soul. Serve both at your next gathering.",
    forkedByKey: "maite_mx",
    tweakMessage: "Replace red chile sauce with tomatillo-pepita verde sauce. Swap pork for chicken.",
    tags: ["mexican", "soup", "chicken"],
    starCount: 1201,
    forkCount: 98,
  },
  // French variations
  {
    sourceSlug: "clafoutis",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "blueberry-clafoutis",
    newName: "Blueberry Clafoutis",
    newDescription: "Summer blueberries instead of cherries. No pit concerns. Add a little lemon zest to the batter.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace cherries with fresh blueberries. Add 1 tsp lemon zest to batter.",
    tags: ["french", "dessert", "sweet", "baking"],
    starCount: 654,
    forkCount: 48,
  },
  {
    sourceSlug: "french-onion-soup",
    sourceAuthorKey: "chef_alex",
    newSlug: "french-onion-pasta",
    newName: "French Onion Pasta",
    newDescription: "What if French onion soup was a pasta dish? Caramelized onions, sherry, beef stock, and Gruyere. Goes viral every winter for good reason.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Add 300g pasta to soup, reduce stock by 30%, top with gruyere and broil.",
    tags: ["french", "pasta", "dinner", "comfort-food", "vegetarian"],
    starCount: 4102,
    forkCount: 498,
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
  },
  // Vegan BBQ
  {
    sourceSlug: "texas-brisket",
    sourceAuthorKey: "tex_bbq",
    newSlug: "smoked-jackfruit-brisket",
    newName: "Smoked Jackfruit Brisket",
    newDescription: "Jackfruit smoked with the same SPG rub. The texture is uncanny if you get the bark right. Travis would hate this. That's how you know it's good.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Young green jackfruit replaces brisket. 3-hour smoke at 120C. Same rub.",
    tags: ["vegan", "bbq", "american"],
    starCount: 1892,
    forkCount: 221,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  },
  // High protein
  {
    sourceSlug: "thai-green-curry",
    sourceAuthorKey: "vivi_verde",
    newSlug: "green-curry-chicken",
    newName: "Thai Green Curry with Chicken",
    newDescription: "Same from-scratch paste, chicken thighs instead of tofu. Fish sauce instead of soy. The most ordered Thai dish in the UK for a reason.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Chicken thighs replace tofu. Fish sauce instead of soy sauce. Add bamboo shoots.",
    tags: ["thai", "chicken", "spicy", "dinner", "high-protein"],
    starCount: 2891,
    forkCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
  },
  // Birria variations
  {
    sourceSlug: "tacos-de-birria",
    sourceAuthorKey: "maite_mx",
    newSlug: "lamb-birria",
    newName: "Lamb Birria",
    newDescription: "Lamb shoulder is more traditional than beef in Jalisco. Earthier, gamier, outrageously good. A proper weekend project.",
    forkedByKey: "chef_alex",
    tweakMessage: "Lamb shoulder replaces beef chuck. Add dried chiles de arbol for more heat.",
    tags: ["mexican", "beef", "dinner", "spicy"],
    starCount: 1341,
    forkCount: 134,
  },

  // ── New forks — tiramisu ───────────────────────────────────────────────────
  {
    sourceSlug: "tiramisu",
    sourceAuthorKey: "marco_cucina",
    newSlug: "matcha-tiramisu",
    newName: "Matcha Tiramisu",
    newDescription: "Swapped the espresso for ceremonial matcha and added a pinch of salt to the cream. Cleaner, greener, completely addictive.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Replace espresso with matcha tea concentrate. Add 1/4 tsp matcha to the cream layer.",
    tags: ["japanese", "dessert", "sweet", "baking"],
    starCount: 2104,
    forkCount: 234,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
  },
  {
    sourceSlug: "tiramisu",
    sourceAuthorKey: "marco_cucina",
    newSlug: "limoncello-tiramisu",
    newName: "Limoncello Tiramisu",
    newDescription: "Lemon curd folded into the mascarpone cream, ladyfingers dipped in limoncello syrup. Lighter and brighter than the original.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Add 3 tbsp lemon curd to cream. Dip ladyfingers in limoncello + lemon juice syrup instead of espresso.",
    tags: ["italian", "dessert", "sweet", "baking"],
    starCount: 1892,
    forkCount: 201,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
  },
  {
    sourceSlug: "tiramisu",
    sourceAuthorKey: "marco_cucina",
    newSlug: "vegan-tiramisu",
    newName: "Vegan Tiramisu",
    newDescription: "Cashew cream + coconut cream replaces mascarpone. Aquafaba meringue for the lift. Actually works. I was skeptical. Now I'm a convert.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace mascarpone with blended cashew cream. Aquafaba whipped in place of egg whites.",
    tags: ["vegan", "dessert", "sweet", "italian"],
    starCount: 1456,
    forkCount: 167,
  },

  // ── New forks — banana bread ───────────────────────────────────────────────
  {
    sourceSlug: "banana-bread",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "chocolate-banana-bread",
    newName: "Chocolate Chip Banana Bread",
    newDescription: "Add 200g dark chocolate chips. Swirl 2 tbsp cocoa in the batter before the final fold. The brown butter keeps it from being cloying.",
    forkedByKey: "tex_bbq",
    tweakMessage: "Fold in 200g dark chocolate chips. Swirl 2 tbsp cocoa powder into half the batter.",
    tags: ["baking", "sweet", "breakfast", "dessert"],
    starCount: 3102,
    forkCount: 334,
    imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80",
  },
  {
    sourceSlug: "banana-bread",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "vegan-banana-bread",
    newName: "Vegan Brown Butter-Style Banana Bread",
    newDescription: "Coconut oil toasted until fragrant substitutes for brown butter almost perfectly. Flax eggs do the work. Tested 4 times.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Coconut oil toasted 5 min replaces brown butter. Flax eggs (1 tbsp ground flax + 3 tbsp water each) replace eggs.",
    tags: ["vegan", "baking", "sweet", "breakfast"],
    starCount: 2341,
    forkCount: 267,
  },
  {
    sourceSlug: "banana-bread",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "tahini-banana-bread",
    newName: "Tahini Banana Bread",
    newDescription: "Replace 30g butter with tahini. Swirl more tahini and honey on top before baking. Sesame and banana is an underrated combination.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Sub 30g butter for tahini in batter. Add tahini-honey swirl on top before baking.",
    tags: ["baking", "sweet", "vegetarian"],
    starCount: 1892,
    forkCount: 189,
  },

  // ── New forks — shakshuka ──────────────────────────────────────────────────
  {
    sourceSlug: "shakshuka",
    sourceAuthorKey: "vivi_verde",
    newSlug: "green-shakshuka",
    newName: "Green Shakshuka",
    newDescription: "Tomatillos, green chiles, and spinach replace the tomato base. Topped with avocado and cotija. The verde version has its own identity.",
    forkedByKey: "maite_mx",
    tweakMessage: "Replace red sauce with tomatillos, spinach, and green chiles. Top with avocado and cotija.",
    tags: ["mexican", "vegetarian", "breakfast", "quick"],
    starCount: 2891,
    forkCount: 298,
    imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80",
  },
  {
    sourceSlug: "shakshuka",
    sourceAuthorKey: "vivi_verde",
    newSlug: "shakshuka-with-lamb",
    newName: "Shakshuka with Spiced Lamb",
    newDescription: "Brown 200g ground lamb with ras el hanout before adding the tomato sauce. Poach eggs on top. Serve from the pan.",
    forkedByKey: "raj_spice",
    tweakMessage: "Add 200g spiced ground lamb before the tomato sauce. Double the harissa.",
    tags: ["breakfast", "dinner", "spicy", "high-protein"],
    starCount: 1891,
    forkCount: 201,
  },
  {
    sourceSlug: "shakshuka",
    sourceAuthorKey: "vivi_verde",
    newSlug: "shakshuka-with-halloumi",
    newName: "Shakshuka with Halloumi",
    newDescription: "Pan-fried halloumi cubes instead of eggs. Unexpected, totally vegan-friendly if you want, and much more party-friendly.",
    forkedByKey: "chef_alex",
    tweakMessage: "Replace eggs with pan-fried halloumi cubes. Add a squeeze of lemon at the end.",
    tags: ["vegetarian", "mediterranean", "breakfast", "quick"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — pad thai ───────────────────────────────────────────────────
  {
    sourceSlug: "pad-thai-noodles",
    sourceAuthorKey: "vivi_verde",
    newSlug: "shrimp-pad-thai",
    newName: "Shrimp Pad Thai",
    newDescription: "Replace tofu with shrimp, coconut aminos with fish sauce. Classic. The vegan version is good; this version is the one people order at restaurants.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Replace tofu with shrimp. Use fish sauce instead of coconut aminos. Add 2 eggs scrambled in.",
    tags: ["thai", "seafood", "quick", "dinner", "high-protein"],
    starCount: 3541,
    forkCount: 389,
    imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
  },
  {
    sourceSlug: "pad-thai-noodles",
    sourceAuthorKey: "vivi_verde",
    newSlug: "pad-see-ew",
    newName: "Pad See Ew",
    newDescription: "Big flat wide rice noodles, Chinese broccoli, oyster sauce and dark soy. The wetter, sweeter, more charred cousin of pad thai.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Wide rice noodles, dark soy + oyster sauce replace tamarind sauce. Chinese broccoli instead of bean sprouts.",
    tags: ["thai", "vegan", "noodles", "quick", "dinner"],
    starCount: 2891,
    forkCount: 312,
  },

  // ── New forks — mapo tofu ─────────────────────────────────────────────────
  {
    sourceSlug: "mapo-tofu",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "mapo-tofu-vegan",
    newName: "Vegan Mapo Tofu",
    newDescription: "Shiitake mushrooms replace the pork. Vegetable stock. The doubanjiang and Sichuan peppercorns do all the heavy lifting anyway.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace pork with minced shiitake mushrooms. Use vegetable stock. Everything else unchanged.",
    tags: ["vegan", "spicy", "quick", "dinner"],
    starCount: 2104,
    forkCount: 223,
  },
  {
    sourceSlug: "mapo-tofu",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "mapo-tofu-with-beef",
    newName: "Mapo Tofu with Wagyu Beef",
    newDescription: "Ground wagyu instead of pork. Richer, more luxurious, slightly less traditional. Worth the upgrade for a special occasion.",
    forkedByKey: "chef_alex",
    tweakMessage: "Ground wagyu beef replaces pork. Reduce chili by 25% to let the beef flavor come through.",
    tags: ["beef", "spicy", "quick", "dinner"],
    starCount: 1892,
    forkCount: 189,
  },

  // ── New forks — shoyu ramen ────────────────────────────────────────────────
  {
    sourceSlug: "shoyu-ramen",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "vegan-shoyu-ramen",
    newName: "Vegan Shoyu Ramen",
    newDescription: "Kombu-shiitake broth only — no chicken. Soy tare adjusted for the lighter base. Tofu, roasted king oyster mushrooms on top.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Remove chicken. Triple the kombu and shiitake for depth. Top with roasted king oyster mushrooms.",
    tags: ["japanese", "vegan", "ramen", "soup"],
    starCount: 1892,
    forkCount: 201,
  },
  {
    sourceSlug: "shoyu-ramen",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "yuzu-shoyu-ramen",
    newName: "Yuzu Shoyu Ramen",
    newDescription: "A teaspoon of yuzu juice in each bowl transforms the whole thing. Bright, citrusy, complex. Tokyo ramen shops do this in winter.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Add 1 tsp yuzu juice and a few drops of yuzu kosho to each bowl at service.",
    tags: ["japanese", "ramen", "soup"],
    starCount: 2341,
    forkCount: 267,
  },

  // ── New forks — chicken biryani ────────────────────────────────────────────
  {
    sourceSlug: "chicken-biryani",
    sourceAuthorKey: "raj_spice",
    newSlug: "lamb-biryani",
    newName: "Hyderabadi Lamb Biryani",
    newDescription: "Lamb shoulder marinated 8 hours. Slower dum cook. Deeper, richer, more complex than the chicken version.",
    forkedByKey: "raj_spice",
    tweakMessage: "Lamb shoulder replaces chicken. 8-hour marinade. Extend dum cooking to 35 minutes.",
    tags: ["indian", "dinner", "high-protein", "spicy"],
    starCount: 2891,
    forkCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
  },
  {
    sourceSlug: "chicken-biryani",
    sourceAuthorKey: "raj_spice",
    newSlug: "vegetable-biryani",
    newName: "Vegetable Dum Biryani",
    newDescription: "Seasonal vegetables: cauliflower, potato, peas, and paneer. Same dum technique. Lighter but just as aromatic.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace chicken with cauliflower, potato, peas, and paneer. Adjust spices slightly lighter.",
    tags: ["indian", "vegetarian", "dinner"],
    starCount: 2104,
    forkCount: 234,
  },

  // ── New forks — palak paneer ───────────────────────────────────────────────
  {
    sourceSlug: "palak-paneer",
    sourceAuthorKey: "raj_spice",
    newSlug: "palak-tofu",
    newName: "Palak Tofu",
    newDescription: "Extra-firm tofu pressed and pan-fried replaces paneer. Vegan. The spinach sauce is so good you will not miss anything.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Extra-firm tofu replaces paneer. Use oat cream instead of yogurt for vegan version.",
    tags: ["vegan", "indian", "dinner", "high-protein"],
    starCount: 1892,
    forkCount: 189,
  },
  {
    sourceSlug: "palak-paneer",
    sourceAuthorKey: "raj_spice",
    newSlug: "palak-chicken",
    newName: "Palak Chicken",
    newDescription: "Chicken thighs braised directly in the spinach sauce. Not traditional but absolutely delicious. Better macros than the paneer version.",
    forkedByKey: "tex_bbq",
    tweakMessage: "Marinated chicken thighs braise directly in spinach sauce for 25 minutes instead of paneer.",
    tags: ["indian", "chicken", "dinner", "high-protein", "spicy"],
    starCount: 2341,
    forkCount: 256,
  },

  // ── New forks — osso buco ──────────────────────────────────────────────────
  {
    sourceSlug: "osso-buco-alla-milanese",
    sourceAuthorKey: "marco_cucina",
    newSlug: "osso-buco-lamb",
    newName: "Lamb Osso Buco",
    newDescription: "Lamb shanks take the same treatment. Slower braise. The lamb version is technically Italian too, just less known.",
    forkedByKey: "chef_alex",
    tweakMessage: "Lamb shanks instead of veal. Add a splash of red wine and rosemary. Braise 2.5 hours.",
    tags: ["italian", "dinner", "comfort-food"],
    starCount: 1892,
    forkCount: 189,
  },
  {
    sourceSlug: "osso-buco-alla-milanese",
    sourceAuthorKey: "marco_cucina",
    newSlug: "pork-osso-buco",
    newName: "Pork Osso Buco",
    newDescription: "Thick pork shanks braised in white wine and stock. Cheaper than veal. Nobody is disappointed.",
    forkedByKey: "tex_bbq",
    tweakMessage: "Pork shanks replace veal. Braise at slightly lower temperature. Still serve with gremolata.",
    tags: ["italian", "pork", "dinner", "comfort-food"],
    starCount: 1542,
    forkCount: 156,
  },

  // ── New forks — lemon tart ────────────────────────────────────────────────
  {
    sourceSlug: "lemon-tart",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "lime-tart",
    newName: "Lime and Coconut Tart",
    newDescription: "Lime instead of lemon. Add 50ml coconut milk to the curd. The pastry gets a sprinkle of toasted coconut. Tropical and less sharp.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace lemons with limes. Add 50ml coconut milk to the curd. Finish with toasted coconut.",
    tags: ["french", "dessert", "sweet", "baking", "vegan"],
    starCount: 2104,
    forkCount: 223,
  },
  {
    sourceSlug: "lemon-tart",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "blood-orange-tart",
    newName: "Blood Orange Tart",
    newDescription: "Blood orange juice makes the filling blush pink. Season only — December to February. Worth waiting for.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Blood orange replaces lemon. Reduce quantity slightly as blood orange is less acidic. Same method.",
    tags: ["french", "dessert", "sweet", "baking", "italian"],
    starCount: 1891,
    forkCount: 198,
  },

  // ── New forks — croissants ────────────────────────────────────────────────
  {
    sourceSlug: "croissants",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "pain-au-chocolat",
    newName: "Pain au Chocolat",
    newDescription: "Same dough, two sticks of good dark chocolate rolled inside each. The shape is a rectangle, not a crescent. The soul is the same.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Cut dough into rectangles. Add 2 sticks 70% dark chocolate. Roll up, seal seam-side down.",
    tags: ["french", "baking", "sweet", "breakfast", "dessert"],
    starCount: 3891,
    forkCount: 412,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
  },
  {
    sourceSlug: "croissants",
    sourceAuthorKey: "sarah_bakes",
    newSlug: "almond-croissants",
    newName: "Almond Croissants",
    newDescription: "Day-old croissants filled with frangipane, topped with flaked almonds and icing sugar. The correct use of a croissant that didn't sell.",
    forkedByKey: "chef_alex",
    tweakMessage: "Split day-old croissants, soak in simple syrup, fill with almond cream, top with flaked almonds, bake at 180C 15 min.",
    tags: ["french", "baking", "sweet", "breakfast", "dessert"],
    starCount: 3241,
    forkCount: 367,
  },

  // ── New forks — coq au vin ────────────────────────────────────────────────
  {
    sourceSlug: "coq-au-vin",
    sourceAuthorKey: "chef_alex",
    newSlug: "coq-au-vin-blanc",
    newName: "Coq au Vin Blanc",
    newDescription: "White wine version from Alsace. Riesling, cream, and tarragon instead of Burgundy and thyme. Lighter color, completely different personality.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Replace Burgundy with Riesling. Add 100ml cream at the end. Swap thyme for tarragon.",
    tags: ["french", "chicken", "dinner", "comfort-food"],
    starCount: 1892,
    forkCount: 201,
  },
  {
    sourceSlug: "coq-au-vin",
    sourceAuthorKey: "chef_alex",
    newSlug: "mushroom-coq-au-vin",
    newName: "Vegan Coq au Vin (Mushrooms)",
    newDescription: "Portobello mushrooms and seitan replace the chicken. The wine braise is unchanged. Serve over polenta instead of noodles.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Large portobello caps and seitan replace chicken. Vegetable stock. Polenta as the base.",
    tags: ["vegan", "french", "dinner", "comfort-food"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — creme brulee ───────────────────────────────────────────────
  {
    sourceSlug: "creme-brulee",
    sourceAuthorKey: "chef_alex",
    newSlug: "lavender-creme-brulee",
    newName: "Lavender Crème Brûlée",
    newDescription: "Steep 2 tsp dried culinary lavender in the warm cream. Strain before adding to yolks. Subtle, floral, surprising.",
    forkedByKey: "sarah_bakes",
    tweakMessage: "Infuse 2 tsp dried culinary lavender in warm cream 20 min before straining. Everything else unchanged.",
    tags: ["french", "dessert", "sweet"],
    starCount: 2104,
    forkCount: 234,
  },
  {
    sourceSlug: "creme-brulee",
    sourceAuthorKey: "chef_alex",
    newSlug: "matcha-creme-brulee",
    newName: "Matcha Crème Brûlée",
    newDescription: "Whisk 1.5 tsp ceremonial matcha into the yolk mixture. The green custard under amber sugar is striking.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Whisk 1.5 tsp ceremonial matcha into yolk-sugar mixture. Omit vanilla. Same bake time.",
    tags: ["french", "japanese", "dessert", "sweet"],
    starCount: 2341,
    forkCount: 256,
  },
  {
    sourceSlug: "creme-brulee",
    sourceAuthorKey: "chef_alex",
    newSlug: "coffee-creme-brulee",
    newName: "Espresso Crème Brûlée",
    newDescription: "Two shots of espresso dissolved into the warm cream. For coffee people. The burnt sugar on top tastes like coffee candy.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Dissolve 2 shots espresso into warm cream. Reduce vanilla to a scraping. Same custard ratio.",
    tags: ["french", "dessert", "sweet"],
    starCount: 2891,
    forkCount: 289,
  },

  // ── New forks — guacamole ─────────────────────────────────────────────────
  {
    sourceSlug: "guacamole",
    sourceAuthorKey: "maite_mx",
    newSlug: "guacamole-with-pomegranate",
    newName: "Guacamole with Pomegranate",
    newDescription: "Add a handful of pomegranate seeds right at the end. The crunch and sweetness are the most underrated guacamole upgrade.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Fold in 50g pomegranate seeds and some crumbled cotija at the end.",
    tags: ["mexican", "vegan", "quick", "vegetarian"],
    starCount: 1892,
    forkCount: 201,
  },
  {
    sourceSlug: "guacamole",
    sourceAuthorKey: "maite_mx",
    newSlug: "guacamole-with-roasted-salsa",
    newName: "Guacamole with Salsa Tatemada",
    newDescription: "Fire-roasted tomatillo salsa folded into guacamole. Two sauces become one. Smoky, bright, and spicier.",
    forkedByKey: "maite_mx",
    tweakMessage: "Fold in 3 tbsp fire-roasted tomatillo salsa. Add extra serrano for heat.",
    tags: ["mexican", "vegan", "quick", "vegetarian", "spicy"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — enchiladas rojas ──────────────────────────────────────────
  {
    sourceSlug: "enchiladas-rojas",
    sourceAuthorKey: "maite_mx",
    newSlug: "enchiladas-verdes",
    newName: "Enchiladas Verdes",
    newDescription: "Tomatillo-serrano salsa verde instead of chile colorado. Chicken filling unchanged. Top with crema, queso, and pickled jalapeño.",
    forkedByKey: "maite_mx",
    tweakMessage: "Replace ancho-guajillo chile sauce with tomatillo-serrano salsa verde. Same chicken filling.",
    tags: ["mexican", "chicken", "dinner", "spicy"],
    starCount: 2341,
    forkCount: 256,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  },
  {
    sourceSlug: "enchiladas-rojas",
    sourceAuthorKey: "maite_mx",
    newSlug: "vegan-enchiladas",
    newName: "Vegan Enchiladas with Jackfruit",
    newDescription: "Young jackfruit shredded in the chile colorado sauce. Fill with jackfruit, black beans, and roasted pepper. No crema, extra avocado.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Jackfruit + black beans replace chicken. Use coconut crema or omit. Extra avocado on top.",
    tags: ["mexican", "vegan", "dinner"],
    starCount: 1891,
    forkCount: 198,
  },

  // ── New forks — katsu curry ───────────────────────────────────────────────
  {
    sourceSlug: "katsu-curry",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "eggplant-katsu-curry",
    newName: "Eggplant Katsu Curry",
    newDescription: "Thick eggplant rounds breaded and fried. The texture is extraordinary — crispy outside, silky inside. Vegan and honestly better than chicken.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Thick eggplant rounds replace chicken. Slightly longer fry time at lower temperature.",
    tags: ["japanese", "vegan", "vegetarian", "dinner"],
    starCount: 2104,
    forkCount: 223,
  },
  {
    sourceSlug: "katsu-curry",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "homemade-katsu-curry-roux",
    newName: "Katsu Curry with Homemade Roux",
    newDescription: "Make the roux from scratch — toast curry powder, add fat, onion, apple, and stock. Eliminates the S&B block and is significantly better.",
    forkedByKey: "chef_alex",
    tweakMessage: "From-scratch curry sauce: caramelized onion + grated apple + homemade curry spice blend + chicken stock reduction.",
    tags: ["japanese", "chicken", "dinner"],
    starCount: 2891,
    forkCount: 312,
  },

  // ── New forks — mujaddara ─────────────────────────────────────────────────
  {
    sourceSlug: "mujaddara",
    sourceAuthorKey: "vivi_verde",
    newSlug: "mujaddara-with-bulgur",
    newName: "Mujaddara with Bulgur",
    newDescription: "Coarse bulgur wheat instead of rice. Nuttier, more textured, slightly lower GI. Lebanese grandmothers often make it this way.",
    forkedByKey: "raj_spice",
    tweakMessage: "Replace rice with coarse bulgur wheat. Adjust water and cooking time accordingly.",
    tags: ["vegan", "vegetarian", "mediterranean", "dinner"],
    starCount: 1542,
    forkCount: 167,
  },
  {
    sourceSlug: "mujaddara",
    sourceAuthorKey: "vivi_verde",
    newSlug: "mujaddara-with-crispy-onions",
    newName: "Mujaddara with Extra Crispy Onions",
    newDescription: "Deep-fry the onions instead of caramelizing. Totally different texture — shatteringly crispy rather than jammy. Both are correct.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Deep-fry onion at 180C until golden. Everything else unchanged. The crispy onions go on top right before serving.",
    tags: ["vegan", "vegetarian", "mediterranean", "dinner"],
    starCount: 1892,
    forkCount: 189,
  },

  // ── New forks — smoked pulled pork ────────────────────────────────────────
  {
    sourceSlug: "smoked-pulled-pork",
    sourceAuthorKey: "tex_bbq",
    newSlug: "oven-pulled-pork",
    newName: "Oven Pulled Pork (No Smoker)",
    newDescription: "Liquid smoke in the rub, very low oven, overnight cook. Gets you to 80% of the real thing. For apartment cooks who want to try.",
    forkedByKey: "chef_alex",
    tweakMessage: "Add 1 tsp liquid smoke to rub. 130C oven overnight instead of smoker. Foil-wrapped after 8 hours.",
    tags: ["american", "pork", "dinner", "meal-prep"],
    starCount: 2341,
    forkCount: 267,
  },
  {
    sourceSlug: "smoked-pulled-pork",
    sourceAuthorKey: "tex_bbq",
    newSlug: "korean-pulled-pork",
    newName: "Korean-Style Pulled Pork",
    newDescription: "Gochujang and sesame in the rub, kimchi slaw instead of coleslaw. The same smoking technique with a Korean BBQ finish.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Replace BBQ rub with gochujang-soy-sesame paste. Serve with kimchi slaw and rice instead of buns.",
    tags: ["korean", "pork", "dinner", "spicy"],
    starCount: 2891,
    forkCount: 312,
  },

  // ── New forks — tarte tatin ───────────────────────────────────────────────
  {
    sourceSlug: "tarte-tatin",
    sourceAuthorKey: "chef_alex",
    newSlug: "pear-tarte-tatin",
    newName: "Pear Tarte Tatin",
    newDescription: "Comice pears instead of apples. More delicate, less acidic, pairs beautifully with blue cheese cream or Roquefort.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Comice pears replace apples. Caramel cooked slightly darker. Serve with Roquefort cream.",
    tags: ["french", "dessert", "sweet", "baking"],
    starCount: 2104,
    forkCount: 223,
  },
  {
    sourceSlug: "tarte-tatin",
    sourceAuthorKey: "chef_alex",
    newSlug: "tomato-tarte-tatin",
    newName: "Savoury Tomato Tarte Tatin",
    newDescription: "Roasted cherry tomatoes in a thyme and balsamic caramel. Gruyere in the pastry. Not dessert.",
    forkedByKey: "chef_alex",
    tweakMessage: "Cherry tomatoes replace apples. Savory caramel with balsamic and thyme. Gruyere folded into the pastry.",
    tags: ["french", "vegetarian", "dinner"],
    starCount: 1891,
    forkCount: 198,
  },

  // ── New forks — cauliflower tahini ────────────────────────────────────────
  {
    sourceSlug: "roasted-cauliflower-tahini",
    sourceAuthorKey: "vivi_verde",
    newSlug: "roasted-cauliflower-with-harissa",
    newName: "Roasted Cauliflower with Harissa Butter",
    newDescription: "Harissa and brown butter replace tahini. More heat, more richness, more depth. Still roasted whole.",
    forkedByKey: "raj_spice",
    tweakMessage: "Replace tahini sauce with harissa compound butter spooned over the hot cauliflower. Add preserved lemon.",
    tags: ["vegetarian", "mediterranean", "dinner", "spicy"],
    starCount: 1892,
    forkCount: 189,
  },
  {
    sourceSlug: "roasted-cauliflower-tahini",
    sourceAuthorKey: "vivi_verde",
    newSlug: "roasted-cauliflower-with-chaat",
    newName: "Roasted Cauliflower with Chaat Masala",
    newDescription: "Indian chaat masala replaces za'atar. Tamarind chutney and mint instead of tahini. Completely different but equally correct.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Replace za'atar with chaat masala. Tamarind chutney and mint chutney instead of tahini sauce.",
    tags: ["vegan", "indian", "vegetarian", "dinner"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — spaghetti all'amatriciana ─────────────────────────────────
  {
    sourceSlug: "spaghetti-allamatriciana",
    sourceAuthorKey: "marco_cucina",
    newSlug: "amatriciana-with-pancetta",
    newName: "Amatriciana with Pancetta",
    newDescription: "Pancetta instead of guanciale. Easier to find, slightly more smoky. Not traditional but honest.",
    forkedByKey: "chef_alex",
    tweakMessage: "Pancetta replaces guanciale. Reduce rendered fat slightly as pancetta is leaner.",
    tags: ["italian", "pasta", "dinner", "pork"],
    starCount: 1542,
    forkCount: 156,
  },
  {
    sourceSlug: "spaghetti-allamatriciana",
    sourceAuthorKey: "marco_cucina",
    newSlug: "amatriciana-nduja",
    newName: "Amatriciana with 'Nduja",
    newDescription: "Replace half the guanciale with 'nduja, the spreadable Calabrian pork sausage. The sauce turns orange-red and deeply spicy.",
    forkedByKey: "raj_spice",
    tweakMessage: "Add 50g 'nduja alongside guanciale. No additional chili needed — nduja brings its own heat.",
    tags: ["italian", "pasta", "dinner", "pork", "spicy"],
    starCount: 1891,
    forkCount: 198,
  },

  // ── New forks — vegetable samosa ──────────────────────────────────────────
  {
    sourceSlug: "vegetable-samosa",
    sourceAuthorKey: "raj_spice",
    newSlug: "baked-samosa",
    newName: "Baked Samosas",
    newDescription: "Brush with oil and bake at 200C until golden. 40% less fat. Surprisingly good. The pastry doesn't quite blister the same way but it works.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Brush with oil instead of deep frying. Bake at 200C 25 min, flipping halfway. Same filling.",
    tags: ["indian", "vegetarian", "snack", "vegan"],
    starCount: 1892,
    forkCount: 201,
  },
  {
    sourceSlug: "vegetable-samosa",
    sourceAuthorKey: "raj_spice",
    newSlug: "keema-samosa",
    newName: "Keema Samosa",
    newDescription: "Spiced minced lamb filling instead of potato-peas. The original meat version from Lucknow. Better for non-vegetarians.",
    forkedByKey: "raj_spice",
    tweakMessage: "Replace potato-pea filling with spiced minced lamb (keema) cooked with onion and whole spices.",
    tags: ["indian", "snack", "spicy"],
    starCount: 2104,
    forkCount: 223,
  },

  // ── New forks — chiles en nogada ──────────────────────────────────────────
  {
    sourceSlug: "chiles-en-nogada",
    sourceAuthorKey: "maite_mx",
    newSlug: "chiles-en-nogada-vegetarian",
    newName: "Vegetarian Chiles en Nogada",
    newDescription: "Replace the pork with mushrooms, black beans, and amaranth. The picadillo needs more seasoning. Worth the effort.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Mushrooms + black beans + amaranth replace ground pork. Add extra cinnamon and cloves to compensate.",
    tags: ["mexican", "vegetarian", "dinner"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — ribollita ─────────────────────────────────────────────────
  {
    sourceSlug: "ribollita",
    sourceAuthorKey: "marco_cucina",
    newSlug: "ribollita-with-kale",
    newName: "Ribollita with Tuscan Kale",
    newDescription: "American cavolo nero substitute: curly kale works well. Remove the tough centre ribs and add 5 minutes of extra cooking.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Curly kale replaces cavolo nero. Remove centre stems. Add 5 extra minutes simmering.",
    tags: ["italian", "soup", "vegan", "comfort-food"],
    starCount: 1102,
    forkCount: 112,
  },
  {
    sourceSlug: "ribollita",
    sourceAuthorKey: "marco_cucina",
    newSlug: "ribollita-with-sausage",
    newName: "Ribollita with Italian Sausage",
    newDescription: "Not traditional, but very satisfying: Italian sausage crumbled into the soffritto. Makes it a full meal.",
    forkedByKey: "tex_bbq",
    tweakMessage: "Add 200g crumbled Italian sausage, browned in the soffritto before the tomatoes.",
    tags: ["italian", "soup", "pork", "comfort-food"],
    starCount: 1341,
    forkCount: 134,
  },

  // ── New forks — cacio e pepe ──────────────────────────────────────────────
  {
    sourceSlug: "cacio-e-pepe",
    sourceAuthorKey: "marco_cucina",
    newSlug: "cacio-e-pepe-with-egg-yolk",
    newName: "Cacio e Pepe with Egg Yolk",
    newDescription: "One egg yolk added per serving makes the sauce richer and helps with emulsification. Somewhere between carbonara and cacio e pepe.",
    forkedByKey: "chef_alex",
    tweakMessage: "Add 1 egg yolk per serving when adding cheese. Whisk yolk into the pasta water before adding cheese.",
    tags: ["italian", "pasta", "quick", "vegetarian"],
    starCount: 2104,
    forkCount: 234,
  },
  {
    sourceSlug: "cacio-e-pepe",
    sourceAuthorKey: "marco_cucina",
    newSlug: "cacio-e-pepe-risotto",
    newName: "Cacio e Pepe Risotto",
    newDescription: "Same flavor profile, different format. The risotto amplifies the pepper and the starch helps create an even silkier sauce.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Substitute spaghetti for risotto technique with arborio rice. Toast pepper in butter, not dry. Finish with cheeses off heat.",
    tags: ["italian", "vegetarian", "dinner"],
    starCount: 2341,
    forkCount: 267,
  },

  // ── New forks — st louis ribs ─────────────────────────────────────────────
  {
    sourceSlug: "st-louis-ribs",
    sourceAuthorKey: "tex_bbq",
    newSlug: "korean-bbq-ribs",
    newName: "Korean BBQ-Style St. Louis Ribs",
    newDescription: "Gochujang and soy sauce glaze replaces BBQ sauce in the final phase. Serve with pickled daikon and steamed rice.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Replace BBQ sauce with gochujang-soy-mirin-sesame glaze in the final hour. Garnish with sesame and scallions.",
    tags: ["korean", "bbq", "pork", "dinner", "spicy"],
    starCount: 2891,
    forkCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  },
  {
    sourceSlug: "st-louis-ribs",
    sourceAuthorKey: "tex_bbq",
    newSlug: "memphis-dry-rub-ribs",
    newName: "Memphis Dry Rub Ribs",
    newDescription: "No sauce. Heavier on the paprika and cayenne in the rub. Memphis style is smoke and spice without glaze.",
    forkedByKey: "tex_bbq",
    tweakMessage: "Skip the BBQ sauce finish. Double the rub. Add more cayenne and paprika. Smoke 6 hours total without wrapping.",
    tags: ["bbq", "american", "pork", "dinner"],
    starCount: 2104,
    forkCount: 223,
  },

  // ── New forks — smoked mac and cheese ────────────────────────────────────
  {
    sourceSlug: "smoked-mac-and-cheese",
    sourceAuthorKey: "tex_bbq",
    newSlug: "lobster-mac-and-cheese",
    newName: "Lobster Mac and Cheese",
    newDescription: "One lobster tail per pan. Keep it cold-smoked or just stir it in at the end. The decadent version.",
    forkedByKey: "chef_alex",
    tweakMessage: "Stir poached lobster tail pieces into the mac at the 1-hour mark. Use gruyere instead of gouda.",
    tags: ["american", "seafood", "dinner", "comfort-food"],
    starCount: 2341,
    forkCount: 256,
  },

  // ── New forks — french onion soup ─────────────────────────────────────────
  {
    sourceSlug: "french-onion-soup",
    sourceAuthorKey: "chef_alex",
    newSlug: "vegan-french-onion-soup",
    newName: "Vegan French Onion Soup",
    newDescription: "Dark beer and mushroom stock replace beef stock. Vegan Gruyere on top still works. The onions are the whole point anyway.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Mushroom + dark beer stock replaces beef stock. Vegan cheese for the gratin. Rest unchanged.",
    tags: ["french", "vegan", "soup", "dinner"],
    starCount: 1892,
    forkCount: 201,
  },

  // ── New forks — dal makhani ───────────────────────────────────────────────
  {
    sourceSlug: "dal-makhani",
    sourceAuthorKey: "raj_spice",
    newSlug: "dal-makhani-vegan",
    newName: "Vegan Dal Makhani",
    newDescription: "Coconut cream replaces the heavy cream, vegan butter for the tadka. Casein-free. The lentils are the star anyway.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Coconut cream replaces heavy cream. Vegan butter for all cooking. 100% plant-based.",
    tags: ["indian", "vegan", "comfort-food"],
    starCount: 1891,
    forkCount: 198,
  },
  {
    sourceSlug: "dal-makhani",
    sourceAuthorKey: "raj_spice",
    newSlug: "dal-makhani-with-tadka",
    newName: "Dal Makhani with Crispy Tadka",
    newDescription: "Add a separate tadka (tempering) of whole spices and dried chiles fried in ghee, poured at the table. Drama and flavor.",
    forkedByKey: "raj_spice",
    tweakMessage: "Add a second tadka at serving: whole dried red chiles, cumin, hing, and garlic fried in 3 tbsp hot ghee, poured over.",
    tags: ["indian", "vegetarian", "comfort-food", "spicy"],
    starCount: 2341,
    forkCount: 256,
  },

  // ── New forks — gyoza ─────────────────────────────────────────────────────
  {
    sourceSlug: "gyoza",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "shrimp-gyoza",
    newName: "Shrimp Gyoza",
    newDescription: "Minced shrimp filling with ginger and chives. Pan-fried and steamed the same way. More delicate than pork, quicker to cook.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Minced shrimp replaces pork in filling. Add more ginger. Cook time reduced to 4 minutes steaming.",
    tags: ["japanese", "seafood", "quick"],
    starCount: 2104,
    forkCount: 223,
  },
  {
    sourceSlug: "gyoza",
    sourceAuthorKey: "kenji_noodles",
    newSlug: "mushroom-gyoza",
    newName: "Mushroom and Tofu Gyoza",
    newDescription: "Finely chopped shiitake and oyster mushrooms with pressed tofu and chives. Squeeze out all the moisture — this is the critical step.",
    forkedByKey: "vivi_verde",
    tweakMessage: "Replace pork with pressed tofu and finely minced mushrooms. Squeeze moisture out aggressively before filling.",
    tags: ["japanese", "vegan", "vegetarian", "quick"],
    starCount: 1892,
    forkCount: 189,
  },

  // ── New forks — chicken tikka masala ──────────────────────────────────────
  {
    sourceSlug: "chicken-tikka-masala",
    sourceAuthorKey: "raj_spice",
    newSlug: "lamb-tikka-masala",
    newName: "Lamb Tikka Masala",
    newDescription: "Cubed lamb shoulder marinated and grilled. The same masala sauce but richer. Better the next day.",
    forkedByKey: "chef_alex",
    tweakMessage: "Lamb shoulder cubes replace chicken. Marinate 6 hours. Grill or broil same as tikka. Add to sauce.",
    tags: ["indian", "dinner", "high-protein", "spicy"],
    starCount: 2341,
    forkCount: 256,
  },

  // ── New forks — texas brisket ─────────────────────────────────────────────
  {
    sourceSlug: "texas-brisket",
    sourceAuthorKey: "tex_bbq",
    newSlug: "pastrami-brisket",
    newName: "Smoked Pastrami Brisket",
    newDescription: "Wet-cure the flat for 7 days in a coriander-pepper-sugar brine, then smoke. The best of both worlds.",
    forkedByKey: "kenji_noodles",
    tweakMessage: "Cure brisket flat 7 days in a coriander-pepper brine. Pat dry, apply rub heavy on coriander, smoke at 225F.",
    tags: ["american", "beef", "dinner"],
    starCount: 2104,
    forkCount: 223,
  },

  // ── New forks — beef bourguignon ──────────────────────────────────────────
  {
    sourceSlug: "beef-bourguignon",
    sourceAuthorKey: "chef_alex",
    newSlug: "short-rib-bourguignon",
    newName: "Short Rib Bourguignon",
    newDescription: "Bone-in short ribs instead of chuck. The collagen melt is unreal. Serve the bone-in ribs in the bowl.",
    forkedByKey: "marco_cucina",
    tweakMessage: "Bone-in short ribs replace beef chuck. Extend braise to 3.5 hours. Serve bone-in.",
    tags: ["french", "beef", "dinner", "comfort-food"],
    starCount: 2891,
    forkCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
  },
  {
    sourceSlug: "beef-bourguignon",
    sourceAuthorKey: "chef_alex",
    newSlug: "boeuf-en-daube",
    newName: "Boeuf en Daube Provencale",
    newDescription: "The Provencal cousin: add green olives, orange peel, and anchovy. Less Burgundy, more sun.",
    forkedByKey: "chef_alex",
    tweakMessage: "Add green olives, strip of orange peel, and 2 anchovy fillets. Use rosemary instead of thyme.",
    tags: ["french", "beef", "dinner", "mediterranean"],
    starCount: 2341,
    forkCount: 256,
  },

  // ── New forks — thai green curry ──────────────────────────────────────────
  {
    sourceSlug: "thai-green-curry",
    sourceAuthorKey: "vivi_verde",
    newSlug: "thai-green-curry-salmon",
    newName: "Thai Green Curry with Salmon",
    newDescription: "Add salmon fillets in the last 8 minutes of simmering. Fish sauce restores the depth that soy sauce can't quite replicate.",
    forkedByKey: "chef_alex",
    tweakMessage: "Add salmon fillets last 8 minutes. Replace soy sauce with fish sauce. Add lemongrass to paste.",
    tags: ["thai", "seafood", "dinner", "high-protein"],
    starCount: 2891,
    forkCount: 298,
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
  },

  // ── New forks — mushroom bourguignon ──────────────────────────────────────
  {
    sourceSlug: "mushroom-bourguignon",
    sourceAuthorKey: "vivi_verde",
    newSlug: "mushroom-bourguignon-with-lentils",
    newName: "Mushroom and Lentil Bourguignon",
    newDescription: "Add Puy lentils for protein. They absorb the wine and become outrageously good. The most filling version.",
    forkedByKey: "raj_spice",
    tweakMessage: "Add 200g Puy lentils to the braise. They need 25 extra minutes. Adjust stock quantity.",
    tags: ["vegan", "french", "dinner", "comfort-food", "high-protein"],
    starCount: 1892,
    forkCount: 201,
  },

  // ── New forks — pozole rojo ───────────────────────────────────────────────
  {
    sourceSlug: "pozole-rojo",
    sourceAuthorKey: "maite_mx",
    newSlug: "vegan-pozole",
    newName: "Vegan Pozole Rojo",
    newDescription: "King oyster mushrooms replace the pork. They hold up to the long simmer and have a similar pull when shredded.",
    forkedByKey: "vivi_verde",
    tweakMessage: "King oyster mushrooms replace pork. Vegetable stock. Rest is unchanged.",
    tags: ["mexican", "vegan", "soup", "dinner"],
    starCount: 1542,
    forkCount: 167,
  },

  // ── New forks — smoked chicken thighs ────────────────────────────────────
  {
    sourceSlug: "smoked-chicken-thighs",
    sourceAuthorKey: "tex_bbq",
    newSlug: "smoked-chicken-thighs-buffalo",
    newName: "Smoked Buffalo Chicken Thighs",
    newDescription: "Finish smoked thighs with a hot sauce and butter glaze instead of the white sauce. Best of both worlds.",
    forkedByKey: "chef_alex",
    tweakMessage: "Replace white sauce with Frank's Red Hot + butter glaze. Toss thighs in sauce at the end.",
    tags: ["american", "bbq", "chicken", "dinner", "spicy"],
    starCount: 2341,
    forkCount: 256,
  },
];

// ─── Cookbooks ────────────────────────────────────────────────────────────────

const COOKBOOKS = [
  { ownerKey: "marco_cucina", slug: "sunday-italian", name: "Sunday Italian", description: "Recipes for long Sunday afternoons. Nothing quick. Everything worth it." },
  { ownerKey: "sarah_bakes", slug: "weekend-baking", name: "Weekend Baking", description: "Projects that take all day and are never a waste of time." },
  { ownerKey: "kenji_noodles", slug: "ramen-deep-dive", name: "Ramen Deep Dive", description: "Every bowl tells a different story. This is chapter one." },
  { ownerKey: "raj_spice", slug: "spice-box", name: "The Spice Box", description: "Indian cooking organized by the spices that define it." },
  { ownerKey: "vivi_verde", slug: "plant-based-classics", name: "Plant-Based Classics", description: "Every French and Italian classic, made plant-based without apology." },
  { ownerKey: "tex_bbq", slug: "low-and-slow", name: "Low & Slow", description: "Everything worth eating takes time. This is the book for patient people." },
  { ownerKey: "maite_mx", slug: "oaxacan-sundays", name: "Oaxacan Sundays", description: "The recipes my grandmother made every Sunday in Oaxaca City." },
  { ownerKey: "chef_alex", slug: "french-fundamentals", name: "French Fundamentals", description: "Master these 8 recipes and you can cook anything." },
];

// ─── Star assignments ─────────────────────────────────────────────────────────

const STAR_PAIRS: [string, string, string][] = [
  // [starrerKey, authorKey, recipeSlug]
  ["vivi_verde", "marco_cucina", "cacio-e-pepe"],
  ["vivi_verde", "marco_cucina", "ribollita"],
  ["sarah_bakes", "marco_cucina", "cacio-e-pepe"],
  ["kenji_noodles", "marco_cucina", "cacio-e-pepe"],
  ["raj_spice", "marco_cucina", "ribollita"],
  ["tex_bbq", "sarah_bakes", "brown-butter-chocolate-chip-cookies"],
  ["kenji_noodles", "sarah_bakes", "sourdough-country-loaf"],
  ["vivi_verde", "sarah_bakes", "brown-butter-chocolate-chip-cookies"],
  ["marco_cucina", "kenji_noodles", "tonkotsu-ramen"],
  ["sarah_bakes", "kenji_noodles", "gyoza"],
  ["raj_spice", "kenji_noodles", "tonkotsu-ramen"],
  ["vivi_verde", "raj_spice", "dal-makhani"],
  ["kenji_noodles", "raj_spice", "chicken-tikka-masala"],
  ["chef_alex", "raj_spice", "dal-makhani"],
  ["marco_cucina", "vivi_verde", "mushroom-bourguignon"],
  ["sarah_bakes", "vivi_verde", "thai-green-curry"],
  ["raj_spice", "vivi_verde", "thai-green-curry"],
  ["kenji_noodles", "tex_bbq", "texas-brisket"],
  ["chef_alex", "tex_bbq", "texas-brisket"],
  ["marco_cucina", "maite_mx", "tacos-de-birria"],
  ["kenji_noodles", "maite_mx", "pozole-rojo"],
  ["raj_spice", "maite_mx", "tacos-de-birria"],
  ["sarah_bakes", "chef_alex", "french-onion-soup"],
  ["vivi_verde", "chef_alex", "beef-bourguignon"],
  ["marco_cucina", "chef_alex", "french-onion-soup"],
  // new recipe stars
  ["kenji_noodles", "marco_cucina", "tiramisu"],
  ["sarah_bakes", "marco_cucina", "tiramisu"],
  ["chef_alex", "marco_cucina", "osso-buco-alla-milanese"],
  ["vivi_verde", "marco_cucina", "tiramisu"],
  ["raj_spice", "marco_cucina", "spaghetti-allamatriciana"],
  ["kenji_noodles", "marco_cucina", "spaghetti-allamatriciana"],
  ["vivi_verde", "sarah_bakes", "banana-bread"],
  ["tex_bbq", "sarah_bakes", "banana-bread"],
  ["raj_spice", "sarah_bakes", "lemon-tart"],
  ["chef_alex", "sarah_bakes", "lemon-tart"],
  ["marco_cucina", "sarah_bakes", "croissants"],
  ["vivi_verde", "sarah_bakes", "croissants"],
  ["kenji_noodles", "sarah_bakes", "croissants"],
  ["chef_alex", "sarah_bakes", "croissants"],
  ["marco_cucina", "kenji_noodles", "shoyu-ramen"],
  ["sarah_bakes", "kenji_noodles", "shoyu-ramen"],
  ["raj_spice", "kenji_noodles", "mapo-tofu"],
  ["vivi_verde", "kenji_noodles", "mapo-tofu"],
  ["chef_alex", "kenji_noodles", "katsu-curry"],
  ["tex_bbq", "kenji_noodles", "katsu-curry"],
  ["kenji_noodles", "raj_spice", "chicken-biryani"],
  ["chef_alex", "raj_spice", "chicken-biryani"],
  ["marco_cucina", "raj_spice", "chicken-biryani"],
  ["vivi_verde", "raj_spice", "palak-paneer"],
  ["sarah_bakes", "raj_spice", "palak-paneer"],
  ["tex_bbq", "vivi_verde", "shakshuka"],
  ["kenji_noodles", "vivi_verde", "shakshuka"],
  ["raj_spice", "vivi_verde", "shakshuka"],
  ["kenji_noodles", "vivi_verde", "pad-thai-noodles"],
  ["marco_cucina", "vivi_verde", "mujaddara"],
  ["raj_spice", "vivi_verde", "mujaddara"],
  ["chef_alex", "tex_bbq", "smoked-pulled-pork"],
  ["kenji_noodles", "tex_bbq", "smoked-pulled-pork"],
  ["marco_cucina", "tex_bbq", "st-louis-ribs"],
  ["raj_spice", "tex_bbq", "st-louis-ribs"],
  ["vivi_verde", "tex_bbq", "smoked-mac-and-cheese"],
  ["sarah_bakes", "maite_mx", "enchiladas-rojas"],
  ["kenji_noodles", "maite_mx", "chiles-en-nogada"],
  ["chef_alex", "maite_mx", "chiles-en-nogada"],
  ["marco_cucina", "maite_mx", "guacamole"],
  ["vivi_verde", "chef_alex", "coq-au-vin"],
  ["marco_cucina", "chef_alex", "coq-au-vin"],
  ["sarah_bakes", "chef_alex", "creme-brulee"],
  ["kenji_noodles", "chef_alex", "creme-brulee"],
  ["raj_spice", "chef_alex", "tarte-tatin"],
  ["marco_cucina", "chef_alex", "tarte-tatin"],
];

// ─── Follow relationships ─────────────────────────────────────────────────────

const FOLLOWS: [string, string][] = [
  // [followerKey, followingKey]
  ["vivi_verde", "marco_cucina"],
  ["sarah_bakes", "marco_cucina"],
  ["kenji_noodles", "marco_cucina"],
  ["chef_alex", "marco_cucina"],
  ["marco_cucina", "sarah_bakes"],
  ["kenji_noodles", "sarah_bakes"],
  ["vivi_verde", "sarah_bakes"],
  ["tex_bbq", "sarah_bakes"],
  ["marco_cucina", "kenji_noodles"],
  ["raj_spice", "kenji_noodles"],
  ["vivi_verde", "kenji_noodles"],
  ["kenji_noodles", "raj_spice"],
  ["chef_alex", "raj_spice"],
  ["marco_cucina", "vivi_verde"],
  ["sarah_bakes", "vivi_verde"],
  ["raj_spice", "vivi_verde"],
  ["kenji_noodles", "tex_bbq"],
  ["chef_alex", "tex_bbq"],
  ["marco_cucina", "maite_mx"],
  ["vivi_verde", "maite_mx"],
  ["sarah_bakes", "chef_alex"],
  ["marco_cucina", "chef_alex"],
  ["vivi_verde", "chef_alex"],
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Forkable seed starting...\n");

  // 1. Clear everything in FK-safe order
  console.log("Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.tasteTest.deleteMany();
  await prisma.cookbookRecipe.deleteMany();
  await prisma.cookbook.deleteMany();
  await prisma.star.deleteMany();
  await prisma.fork.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.recipeVersion.deleteMany();
  await prisma.componentIngredient.deleteMany();
  await prisma.step.deleteMany();
  await prisma.component.deleteMany();
  await prisma.recipeTag.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Cleared.\n");

  // 2. Users
  const devPassword = await bcrypt.hash("devpassword123", 12);
  const userIds: Record<string, string> = {};

  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        passwordHash: devPassword,
        avatarUrl: u.avatarUrl,
        bannerUrl: u.bannerUrl,
        bio: u.bio,
        location: u.location,
        cuisineTags: u.cuisineTags,
        styleTags: u.styleTags,
      },
    });
    userIds[u.username] = user.id;
    console.log(`  User @${u.username}`);
  }

  // 3. Tags
  const tagIds: Record<string, string> = {};
  for (const t of TAGS) {
    const tag = await prisma.tag.create({
      data: { name: t.name, label: t.label, isGlobal: true },
    });
    tagIds[t.name] = tag.id;
  }
  console.log(`\n  ${TAGS.length} tags created`);

  // 4. Ingredient catalog (collect all unique slugs first)
  const ingredientCatalog: Map<string, IngredientEntry> = new Map();
  for (const r of RECIPES) {
    for (const c of r.components) {
      for (const ing of c.ingredients) {
        if (!ingredientCatalog.has(ing.slug)) {
          ingredientCatalog.set(ing.slug, ing);
        }
      }
    }
  }
  const ingredientIds: Record<string, string> = {};
  for (const [slug, ing] of ingredientCatalog) {
    const ingredient = await prisma.ingredient.create({
      data: {
        slug,
        name: ing.name,
        calories: ing.calories,
        protein: ing.protein,
        carbs: ing.carbs,
        fat: ing.fat,
        fiber: ing.fiber,
        macroSource: ing.calories ? "ESTIMATED" : "MANUAL",
      },
    });
    ingredientIds[slug] = ingredient.id;
  }
  console.log(`  ${ingredientCatalog.size} ingredients created`);

  // 5. Base recipes
  console.log("\n  Creating base recipes...");
  const recipeIds: Record<string, string> = {}; // key: "authorKey/slug"

  for (const r of RECIPES) {
    const authorId = userIds[r.authorKey];
    const recipe = await prisma.recipe.create({
      data: {
        slug: r.slug,
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        authorId,
        starCount: r.starCount,
        forkCount: r.forkCount,
        tweakCount: r.tweakCount,
        servings: r.servings,
        calories: r.calories,
        proteinG: r.proteinG,
        carbsG: r.carbsG,
        fatG: r.fatG,
        fiberG: r.fiberG,
        tags: {
          create: r.tags
            .filter((t) => tagIds[t])
            .map((t) => ({ tagId: tagIds[t] })),
        },
      },
    });
    recipeIds[`${r.authorKey}/${r.slug}`] = recipe.id;

    // Components + steps + ingredients
    for (const c of r.components) {
      const component = await prisma.component.create({
        data: {
          recipeId: recipe.id,
          name: c.name,
          displayName: c.displayName,
          type: c.type,
          order: c.order,
        },
      });

      // Steps
      for (let i = 0; i < c.steps.length; i++) {
        await prisma.step.create({
          data: { componentId: component.id, order: i, content: c.steps[i] },
        });
      }

      // Ingredients
      for (let i = 0; i < c.ingredients.length; i++) {
        const ing = c.ingredients[i];
        if (ingredientIds[ing.slug]) {
          await prisma.componentIngredient.create({
            data: {
              componentId: component.id,
              ingredientId: ingredientIds[ing.slug],
              amount: ing.amount,
              unit: ing.unit,
              preparation: ing.preparation,
              order: i,
              isOptional: (ing as { isOptional?: boolean }).isOptional ?? false,
            },
          });
        }
      }
    }

    // Initial version
    await prisma.recipeVersion.create({
      data: {
        recipeId: recipe.id,
        authorId,
        message: "Initial commit",
        additions: r.components.reduce((s, c) => s + c.steps.length, 0),
      },
    });

    console.log(`    ${r.name}`);
  }

  // 6. Fork recipes
  console.log("\n  Creating fork recipes...");
  for (const f of FORK_RECIPES) {
    const sourceId = recipeIds[`${f.sourceAuthorKey}/${f.sourceSlug}`];
    if (!sourceId) {
      console.log(`    SKIPPING fork — source not found: ${f.sourceSlug}`);
      continue;
    }
    const authorId = userIds[f.forkedByKey];

    // Create the forked recipe (simplified: same structure but new description)
    const sourceRecipeDef = RECIPES.find(
      (r) => r.slug === f.sourceSlug && r.authorKey === f.sourceAuthorKey
    );

    const forkedRecipe = await prisma.recipe.create({
      data: {
        slug: f.newSlug,
        name: f.newName,
        description: f.newDescription,
        imageUrl: f.imageUrl ?? sourceRecipeDef?.imageUrl,
        authorId,
        forkedFromId: sourceId,
        starCount: f.starCount,
        forkCount: f.forkCount,
        tweakCount: 0,
        servings: sourceRecipeDef?.servings ?? 4,
        calories: sourceRecipeDef?.calories,
        proteinG: sourceRecipeDef?.proteinG,
        carbsG: sourceRecipeDef?.carbsG,
        fatG: sourceRecipeDef?.fatG,
        fiberG: sourceRecipeDef?.fiberG,
        tags: {
          create: f.tags
            .filter((t) => tagIds[t])
            .map((t) => ({ tagId: tagIds[t] })),
        },
      },
    });

    // Copy components from source
    if (sourceRecipeDef) {
      for (const c of sourceRecipeDef.components) {
        const component = await prisma.component.create({
          data: {
            recipeId: forkedRecipe.id,
            name: c.name,
            displayName: c.displayName,
            type: c.type,
            order: c.order,
          },
        });
        for (let i = 0; i < c.steps.length; i++) {
          await prisma.step.create({
            data: { componentId: component.id, order: i, content: c.steps[i] },
          });
        }
        for (let i = 0; i < c.ingredients.length; i++) {
          const ing = c.ingredients[i];
          if (ingredientIds[ing.slug]) {
            await prisma.componentIngredient.create({
              data: {
                componentId: component.id,
                ingredientId: ingredientIds[ing.slug],
                amount: ing.amount,
                unit: ing.unit,
                preparation: ing.preparation,
                order: i,
                isOptional: (ing as { isOptional?: boolean }).isOptional ?? false,
              },
            });
          }
        }
      }
    }

    // Fork record + version
    await prisma.fork.create({
      data: { userId: authorId, recipeId: forkedRecipe.id, sourceId },
    });
    await prisma.recipeVersion.create({
      data: {
        recipeId: forkedRecipe.id,
        authorId,
        message: f.tweakMessage,
        additions: 2,
        deletions: 1,
      },
    });

    recipeIds[`${f.forkedByKey}/${f.newSlug}`] = forkedRecipe.id;
    console.log(`    ${f.newName} (fork of ${f.sourceSlug})`);
  }

  // 7. Cookbooks
  console.log("\n  Creating cookbooks...");
  const cookbookIds: Record<string, string> = {};
  for (const cb of COOKBOOKS) {
    const cookbook = await prisma.cookbook.create({
      data: {
        slug: cb.slug,
        name: cb.name,
        description: cb.description,
        ownerId: userIds[cb.ownerKey],
      },
    });
    cookbookIds[`${cb.ownerKey}/${cb.slug}`] = cookbook.id;
    console.log(`    ${cb.name}`);
  }

  // Add recipes to cookbooks
  const cookbookAssignments: [string, string, string, string][] = [
    // [ownerKey, cookbookSlug, authorKey, recipeSlug]
    ["marco_cucina", "sunday-italian", "marco_cucina", "cacio-e-pepe"],
    ["marco_cucina", "sunday-italian", "marco_cucina", "ribollita"],
    ["marco_cucina", "sunday-italian", "chef_alex", "beef-bourguignon"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "sourdough-country-loaf"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "brown-butter-chocolate-chip-cookies"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "clafoutis"],
    ["kenji_noodles", "ramen-deep-dive", "kenji_noodles", "tonkotsu-ramen"],
    ["raj_spice", "spice-box", "raj_spice", "dal-makhani"],
    ["raj_spice", "spice-box", "raj_spice", "chicken-tikka-masala"],
    ["vivi_verde", "plant-based-classics", "vivi_verde", "mushroom-bourguignon"],
    ["vivi_verde", "plant-based-classics", "vivi_verde", "thai-green-curry"],
    ["tex_bbq", "low-and-slow", "tex_bbq", "texas-brisket"],
    ["maite_mx", "oaxacan-sundays", "maite_mx", "pozole-rojo"],
    ["maite_mx", "oaxacan-sundays", "maite_mx", "tacos-de-birria"],
    ["chef_alex", "french-fundamentals", "chef_alex", "french-onion-soup"],
    ["chef_alex", "french-fundamentals", "chef_alex", "beef-bourguignon"],
    ["chef_alex", "french-fundamentals", "chef_alex", "clafoutis"],
    ["marco_cucina", "sunday-italian", "marco_cucina", "spaghetti-allamatriciana"],
    ["marco_cucina", "sunday-italian", "marco_cucina", "osso-buco-alla-milanese"],
    ["marco_cucina", "sunday-italian", "marco_cucina", "tiramisu"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "banana-bread"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "lemon-tart"],
    ["sarah_bakes", "weekend-baking", "sarah_bakes", "croissants"],
    ["kenji_noodles", "ramen-deep-dive", "kenji_noodles", "shoyu-ramen"],
    ["kenji_noodles", "ramen-deep-dive", "kenji_noodles", "mapo-tofu"],
    ["raj_spice", "spice-box", "raj_spice", "chicken-biryani"],
    ["raj_spice", "spice-box", "raj_spice", "palak-paneer"],
    ["raj_spice", "spice-box", "raj_spice", "vegetable-samosa"],
    ["vivi_verde", "plant-based-classics", "vivi_verde", "shakshuka"],
    ["vivi_verde", "plant-based-classics", "vivi_verde", "pad-thai-noodles"],
    ["vivi_verde", "plant-based-classics", "vivi_verde", "mujaddara"],
    ["tex_bbq", "low-and-slow", "tex_bbq", "smoked-pulled-pork"],
    ["tex_bbq", "low-and-slow", "tex_bbq", "st-louis-ribs"],
    ["tex_bbq", "low-and-slow", "tex_bbq", "smoked-mac-and-cheese"],
    ["maite_mx", "oaxacan-sundays", "maite_mx", "enchiladas-rojas"],
    ["maite_mx", "oaxacan-sundays", "maite_mx", "chiles-en-nogada"],
    ["chef_alex", "french-fundamentals", "chef_alex", "coq-au-vin"],
    ["chef_alex", "french-fundamentals", "chef_alex", "creme-brulee"],
    ["chef_alex", "french-fundamentals", "chef_alex", "tarte-tatin"],
  ];

  for (const [ownerKey, cbSlug, authorKey, recipeSlug] of cookbookAssignments) {
    const cookbookId = cookbookIds[`${ownerKey}/${cbSlug}`];
    const recipeId = recipeIds[`${authorKey}/${recipeSlug}`];
    if (cookbookId && recipeId) {
      await prisma.cookbookRecipe.create({
        data: { cookbookId, recipeId },
      });
    }
  }

  // 8. Stars
  console.log("\n  Creating stars...");
  for (const [starrerKey, authorKey, recipeSlug] of STAR_PAIRS) {
    const userId = userIds[starrerKey];
    const recipeId = recipeIds[`${authorKey}/${recipeSlug}`];
    if (userId && recipeId) {
      await prisma.star.create({ data: { userId, recipeId } });
    }
  }
  console.log(`    ${STAR_PAIRS.length} stars`);

  // 9. Follows
  console.log("\n  Creating follows...");
  for (const [followerKey, followingKey] of FOLLOWS) {
    const followerId = userIds[followerKey];
    const followingId = userIds[followingKey];
    if (followerId && followingId) {
      await prisma.follow.create({ data: { followerId, followingId } });
    }
  }
  console.log(`    ${FOLLOWS.length} follows`);

  // 10. Sample taste tests
  console.log("\n  Creating taste tests...");
  const sampleTasteTests = [
    {
      recipeId: recipeIds["marco_cucina/cacio-e-pepe"],
      authorId: userIds["sarah_bakes"],
      type: "COMMENT" as const,
      body: "Made this three times this week. The pasta water temperature really matters — I let mine get too cold once and it seized. Keep the heat low when you add the cheese.",
      rating: 5,
    },
    {
      recipeId: recipeIds["kenji_noodles/tonkotsu-ramen"],
      authorId: userIds["marco_cucina"],
      type: "COMMENT" as const,
      body: "The blanching step is genuinely non-negotiable. I tried skipping it once. Never again. The broth was murky and had an off smell for hours.",
      rating: 5,
    },
    {
      recipeId: recipeIds["sarah_bakes/brown-butter-chocolate-chip-cookies"],
      authorId: userIds["tex_bbq"],
      type: "COMMENT" as const,
      body: "Made these for a BBQ competition dessert table. Disappeared in 8 minutes. People thought they were from a bakery.",
      rating: 5,
    },
    {
      recipeId: recipeIds["raj_spice/dal-makhani"],
      authorId: userIds["vivi_verde"],
      type: "COMMENT" as const,
      body: "I replaced the butter with vegan butter and the cream with cashew cream. Results are in my fork. Zero sacrifice in richness.",
      rating: 4,
    },
  ];

  const moreTasteTests = [
    // marco recipes
    { recipeKey: "marco_cucina/spaghetti-allamatriciana", authorKey: "chef_alex", body: "Found guanciale at a specialty shop after this recipe convinced me it was worth hunting down. The difference from pancetta is not subtle. It's completely different.", rating: 5 },
    { recipeKey: "marco_cucina/spaghetti-allamatriciana", authorKey: "kenji_noodles", body: "I burn it every time trying to render the fat because I'm impatient. Eighth attempt I finally went low and slow. That's when I understood why.", rating: 5 },
    { recipeKey: "marco_cucina/spaghetti-allamatriciana", authorKey: "sarah_bakes", body: "The white wine deglaze after the guanciale is the step I kept skipping. Don't skip it. The fond matters.", rating: 4 },
    { recipeKey: "marco_cucina/osso-buco-alla-milanese", authorKey: "vivi_verde", body: "Made this for a dinner party. Everyone asked for the recipe. The gremolata at the end smells like winter in a good way.", rating: 5 },
    { recipeKey: "marco_cucina/osso-buco-alla-milanese", authorKey: "chef_alex", body: "The twine is not optional. I skipped it once and the meat fell apart before it should have. Tie the shanks.", rating: 5 },
    { recipeKey: "marco_cucina/osso-buco-alla-milanese", authorKey: "raj_spice", body: "Served with saffron risotto as suggested. The pairing is genuinely one of the great combinations in cooking.", rating: 5 },
    { recipeKey: "marco_cucina/tiramisu", authorKey: "sarah_bakes", body: "The zabaglione base is what makes this different from every other tiramisu recipe online. It's properly cooked, stable, and has that custard depth.", rating: 5 },
    { recipeKey: "marco_cucina/tiramisu", authorKey: "kenji_noodles", body: "I've been making tiramisu for ten years the other way. This one has a noticeably better texture. The extra step is worth it.", rating: 5 },
    { recipeKey: "marco_cucina/tiramisu", authorKey: "maite_mx", body: "Made this for a birthday instead of a cake. Nobody missed the cake.", rating: 5 },
    { recipeKey: "marco_cucina/cacio-e-pepe", authorKey: "maite_mx", body: "Third time I finally got a sauce instead of scrambled cheesy pasta. The key is removing from heat before adding the cheese. I know that now.", rating: 4 },
    { recipeKey: "marco_cucina/ribollita", authorKey: "kenji_noodles", body: "Day two ribollita is a revelation. I made a big batch specifically to have the next-day version. The re-boiling creates a completely different texture.", rating: 5 },

    // sarah recipes
    { recipeKey: "sarah_bakes/banana-bread", authorKey: "tex_bbq", body: "I smoke bananas first. 30 minutes at 200F before mashing. The smokiness and banana is a combination I did not expect to work as well as it does.", rating: 5 },
    { recipeKey: "sarah_bakes/banana-bread", authorKey: "marco_cucina", body: "The browned butter smell while this bakes is almost better than eating it. I make this every time I have overripe bananas, which is now intentional.", rating: 5 },
    { recipeKey: "sarah_bakes/banana-bread", authorKey: "raj_spice", body: "Added cardamom to mine. One teaspoon ground cardamom. It works with the banana better than I expected.", rating: 4 },
    { recipeKey: "sarah_bakes/lemon-tart", authorKey: "marco_cucina", body: "The 140C oven temperature is what makes this work. Every other recipe I've seen uses 160C or higher and the curd bubbles and breaks.", rating: 5 },
    { recipeKey: "sarah_bakes/lemon-tart", authorKey: "chef_alex", body: "Pastry school flashback. This is exactly how we made it. The double cream in the curd is the professional technique that home recipes always leave out.", rating: 5 },
    { recipeKey: "sarah_bakes/lemon-tart", authorKey: "vivi_verde", body: "I used oat cream instead of double cream for a lighter version and it still set perfectly. The lemon is sharp enough to carry it.", rating: 4 },
    { recipeKey: "sarah_bakes/croissants", authorKey: "chef_alex", body: "The 24-26C proofing temperature note is critical. My first attempt proofed at 28C and the butter melted into the dough. The layers were gone.", rating: 5 },
    { recipeKey: "sarah_bakes/croissants", authorKey: "marco_cucina", body: "Three days of work for 12 croissants. Worth every hour. The honeycomb crumb on the first perfect batch made me emotional.", rating: 5 },
    { recipeKey: "sarah_bakes/sourdough-country-loaf", authorKey: "raj_spice", body: "My starter is named after Gerald now. I told it a story about wheat fields before bed to maintain the routine.", rating: 5 },
    { recipeKey: "sarah_bakes/brown-butter-chocolate-chip-cookies", authorKey: "marco_cucina", body: "The cold dough resting step is doing more work than people realize. The 48-hour rest produces a noticeably more complex flavor.", rating: 5 },

    // kenji recipes
    { recipeKey: "kenji_noodles/shoyu-ramen", authorKey: "marco_cucina", body: "The cold kombu steep followed by gentle heating is a technique I now use for everything. No bitterness, pure clean dashi flavor.", rating: 5 },
    { recipeKey: "kenji_noodles/shoyu-ramen", authorKey: "sarah_bakes", body: "The three-soy-sauce tare sounds overcomplicated until you taste it. Each soy adds something different. This is not the same as single soy sauce.", rating: 5 },
    { recipeKey: "kenji_noodles/shoyu-ramen", authorKey: "raj_spice", body: "Blanching the chicken first is the same principle as skimming dal for a clear broth. Both traditions figured this out independently.", rating: 4 },
    { recipeKey: "kenji_noodles/mapo-tofu", authorKey: "vivi_verde", body: "The vegan version in my fork is genuinely very good. But I made the original for a friend and the pork adds something the mushrooms can't quite replicate. Both are worth knowing.", rating: 4 },
    { recipeKey: "kenji_noodles/mapo-tofu", authorKey: "raj_spice", body: "Sichuan peppercorns and doubanjiang is a flavor combination that changes how you think about heat. It's not just spicy. It's numbing in a way that makes you want more.", rating: 5 },
    { recipeKey: "kenji_noodles/mapo-tofu", authorKey: "chef_alex", body: "The cornstarch thickening at the end is a Chinese technique I'd dismissed as a shortcut. It's not a shortcut here — it integrates the sauce and creates the right coating on the tofu.", rating: 5 },
    { recipeKey: "kenji_noodles/katsu-curry", authorKey: "sarah_bakes", body: "The S&B roux note is accurate. I've tried three homemade versions. They're good but different. The S&B has a specific sweetness that's its own thing.", rating: 4 },
    { recipeKey: "kenji_noodles/katsu-curry", authorKey: "tex_bbq", body: "Reminded me that Japanese comfort food is just as good as Texas comfort food. Different techniques, same result: you feel full and happy.", rating: 5 },
    { recipeKey: "kenji_noodles/tonkotsu-ramen", authorKey: "chef_alex", body: "The 18-hour broth is a commitment but not a difficult one. The hardest part is resisting the urge to taste it before it's done. Made it on a Sunday. Ate the next day.", rating: 5 },

    // raj recipes
    { recipeKey: "raj_spice/chicken-biryani", authorKey: "kenji_noodles", body: "The dum cooking concept — sealed steaming — is the same principle as Japanese steaming techniques. No steam escapes. Everything concentrates.", rating: 5 },
    { recipeKey: "raj_spice/chicken-biryani", authorKey: "chef_alex", body: "Made this for a dinner party. The reveal when you unseal the pot is theatre. The room smelled incredible before anyone had eaten a bite.", rating: 5 },
    { recipeKey: "raj_spice/chicken-biryani", authorKey: "marco_cucina", body: "The fried onion is doing more work than I expected. They're a seasoning and a texture element simultaneously. Half in the marinade, half on top — that structure matters.", rating: 4 },
    { recipeKey: "raj_spice/palak-paneer", authorKey: "vivi_verde", body: "The ice-bath shock for the spinach is the step that makes the difference between green and grey. I've been making this wrong for years.", rating: 5 },
    { recipeKey: "raj_spice/palak-paneer", authorKey: "kenji_noodles", body: "Pan-frying the paneer until golden changes its texture completely. The texture contrast with the silky spinach sauce is the dish.", rating: 5 },
    { recipeKey: "raj_spice/dal-makhani", authorKey: "tex_bbq", body: "The overnight simmer is the same principle as low-and-slow BBQ. Time and low heat do the work that shortcuts can't.", rating: 5 },
    { recipeKey: "raj_spice/chicken-tikka-masala", authorKey: "sarah_bakes", body: "The charred yogurt-marinated chicken pieces make or break this. I've had versions where the tikka was just simmered in the sauce. Not the same dish.", rating: 4 },

    // vivi recipes
    { recipeKey: "vivi_verde/shakshuka", authorKey: "kenji_noodles", body: "Added harissa and it moved from brunch to weeknight dinner. The eggs need to be just set at the edge and liquid in the yolk. That window is about 2 minutes.", rating: 5 },
    { recipeKey: "vivi_verde/shakshuka", authorKey: "tex_bbq", body: "Served this at a barbecue as a side dish. People were not expecting it. They went back for thirds.", rating: 4 },
    { recipeKey: "vivi_verde/shakshuka", authorKey: "raj_spice", body: "The sauce is very similar to a shakshuka base I know from Bombay Irani cafes. The Sephardic and Persian influences must have crossed at some point.", rating: 5 },
    { recipeKey: "vivi_verde/pad-thai-noodles", authorKey: "kenji_noodles", body: "The coconut aminos actually work better than I expected for a vegan sub. The umami is different from fish sauce but it has its own depth.", rating: 4 },
    { recipeKey: "vivi_verde/pad-thai-noodles", authorKey: "maite_mx", body: "I did not believe this would taste right without fish sauce. I was wrong. The tamarind is doing more work than I gave it credit for.", rating: 4 },
    { recipeKey: "vivi_verde/roasted-cauliflower-tahini", authorKey: "raj_spice", body: "Roasting a whole cauliflower sounds dramatic. It takes 65 minutes unattended. The result looks impressive. This is low-effort food with high-effort presentation.", rating: 5 },
    { recipeKey: "vivi_verde/thai-green-curry", authorKey: "marco_cucina", body: "The from-scratch paste is a different food than jarred paste. I spent 15 minutes making it and it changed every Thai dish I make.", rating: 5 },
    { recipeKey: "vivi_verde/mujaddara", authorKey: "chef_alex", body: "The 40 minutes of caramelizing onions is not a suggestion. 20 minutes produces a pale imitation. The patience is the whole recipe.", rating: 5 },
    { recipeKey: "vivi_verde/mushroom-bourguignon", authorKey: "marco_cucina", body: "I made this to try before making it for a vegetarian guest. I didn't need to make the beef version that weekend. This was the dinner.", rating: 5 },

    // tex recipes
    { recipeKey: "tex_bbq/smoked-pulled-pork", authorKey: "kenji_noodles", body: "The butcher paper wrap at 165F is exactly the same principle as the Japanese technique of resting meat tightly wrapped. The steam redistributes everything.", rating: 5 },
    { recipeKey: "tex_bbq/smoked-pulled-pork", authorKey: "chef_alex", body: "First time I made this I pulled at 195F because I was impatient. The difference between 195F and 203F is not subtle. Wait for 203.", rating: 5 },
    { recipeKey: "tex_bbq/texas-brisket", authorKey: "chef_alex", body: "The SPG rub simplicity was hard for me to accept as a trained cook. There's nothing else. The brisket and smoke do the work.", rating: 5 },
    { recipeKey: "tex_bbq/st-louis-ribs", authorKey: "marco_cucina", body: "The 3-2-1 method makes this reliable. I've had inconsistent ribs for years. This structure eliminated the guesswork entirely.", rating: 5 },
    { recipeKey: "tex_bbq/smoked-mac-and-cheese", authorKey: "sarah_bakes", body: "The velveeta admission initially put me off. Then I ate it. Now I understand why it's there. The protein strands are real.", rating: 4 },
    { recipeKey: "tex_bbq/smoked-chicken-thighs", authorKey: "kenji_noodles", body: "The Alabama white sauce seems like a condiment. It is not a condiment. It is half the dish.", rating: 5 },

    // maite recipes
    { recipeKey: "maite_mx/tacos-de-birria", authorKey: "chef_alex", body: "The consome dip is what elevates this from tacos to an experience. Double the consome recipe and use it for a soup the next day.", rating: 5 },
    { recipeKey: "maite_mx/pozole-rojo", authorKey: "kenji_noodles", body: "Pozole is to Mexico what ramen is to Japan. A regional dish that everyone has strong opinions about and nobody makes the same way.", rating: 5 },
    { recipeKey: "maite_mx/enchiladas-rojas", authorKey: "vivi_verde", body: "Made the jackfruit version from my fork alongside this original for a dinner. Having both showed how different the experience is. Both are worth making.", rating: 4 },
    { recipeKey: "maite_mx/guacamole", authorKey: "chef_alex", body: "The order of addition really does matter. Onion and chile first, then avocado, then coriander, then lime. The salt goes in with the onion and stays balanced.", rating: 5 },
    { recipeKey: "maite_mx/chiles-en-nogada", authorKey: "chef_alex", body: "This is one of those dishes where the effort matches the complexity of the result. I made it for Día de la Independencia and it was the right choice.", rating: 5 },

    // chef alex recipes
    { recipeKey: "chef_alex/coq-au-vin", authorKey: "marco_cucina", body: "Overnight wine marinade is the detail that separates this from a quick braise. The chicken absorbs the wine before cooking, not just during.", rating: 5 },
    { recipeKey: "chef_alex/coq-au-vin", authorKey: "sarah_bakes", body: "Served with buttered egg noodles as suggested. That's the correct pairing. Don't serve it with pasta. Egg noodles.", rating: 5 },
    { recipeKey: "chef_alex/creme-brulee", authorKey: "sarah_bakes", body: "The 1:5 yolk to cream ratio note is the important one. Most recipes go 1:4. The extra cream makes the custard silkier without being eggy.", rating: 5 },
    { recipeKey: "chef_alex/creme-brulee", authorKey: "kenji_noodles", body: "The wobble test is more accurate than a thermometer here. When the center wobbles like jello, it's done. Overcooking makes it grainy.", rating: 5 },
    { recipeKey: "chef_alex/tarte-tatin", authorKey: "marco_cucina", body: "The flip is terrifying every time. Use a larger plate than you think you need. Do it confidently and quickly or it falls apart.", rating: 5 },
    { recipeKey: "chef_alex/beef-bourguignon", authorKey: "raj_spice", body: "The French use wine in braises the same way I use yogurt in Indian cooking. A souring, tenderizing, flavoring element that changes everything in the long cook.", rating: 5 },
    { recipeKey: "chef_alex/french-onion-soup", authorKey: "vivi_verde", body: "The caramelized onions take 90 minutes done properly. Every recipe that claims 30 minutes is producing lightly browned onions, not caramelized ones.", rating: 5 },
  ];

  for (const tt of [...sampleTasteTests, ...moreTasteTests.map(t => ({
    recipeId: recipeIds[t.recipeKey],
    authorId: userIds[t.authorKey],
    type: "COMMENT" as const,
    body: t.body,
    rating: t.rating,
  }))]) {
    if (tt.recipeId && tt.authorId) {
      await prisma.tasteTest.create({ data: tt });
    }
  }
  console.log(`    ${4 + moreTasteTests.length} taste tests`);

  // 11. Correct denormalized counts to match actual data
  console.log("\n  Correcting denormalized counts...");
  const allRecipes = await prisma.recipe.findMany({ select: { id: true } });
  for (const r of allRecipes) {
    const [forkCount, tweakCount, tasteTestCount, starCount] = await Promise.all([
      prisma.fork.count({ where: { sourceId: r.id } }),
      prisma.recipeVersion.count({ where: { recipeId: r.id } }),
      prisma.tasteTest.count({ where: { recipeId: r.id } }),
      prisma.star.count({ where: { recipeId: r.id } }),
    ]);
    await prisma.recipe.update({
      where: { id: r.id },
      data: { forkCount, tweakCount, tasteTestCount, starCount },
    });
  }
  console.log(`    Updated ${allRecipes.length} recipe counts`);

  console.log("\nSeed complete!\n");
  console.log("Dev accounts (all use password: devpassword123):");
  for (const u of USERS) {
    console.log(`  ${u.email}`);
  }
  console.log(`\n  ${RECIPES.length} base recipes`);
  console.log(`  ${FORK_RECIPES.length} forked recipes`);
  console.log(`  ${COOKBOOKS.length} cookbooks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
