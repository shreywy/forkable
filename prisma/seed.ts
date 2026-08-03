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
    imageUrl: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80",
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
              isOptional: (ing as any).isOptional ?? false,
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
                isOptional: (ing as any).isOptional ?? false,
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

  for (const tt of sampleTasteTests) {
    if (tt.recipeId && tt.authorId) {
      await prisma.tasteTest.create({ data: tt });
    }
  }
  console.log("    4 taste tests");

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
