import foodData from "@/data/indianFoods.json";

const foods = foodData.foods;

// Build lookup maps once at load time
const nameMap = new Map();
const aliasMap = new Map();

for (const food of foods) {
  nameMap.set(food.name.toLowerCase(), food);
  for (const alias of food.aliases) {
    aliasMap.set(alias.toLowerCase(), food);
  }
}

/**
 * Match user input against the Indian food database.
 * Checks exact name, then aliases, then partial matches.
 */
export function matchIndianFood(input) {
  if (!input) return null;
  const q = input.toLowerCase().trim();

  // Exact name match
  if (nameMap.has(q)) return nameMap.get(q);

  // Exact alias match
  if (aliasMap.has(q)) return aliasMap.get(q);

  // Partial: input contains a food name or vice versa
  for (const food of foods) {
    if (q.includes(food.name) || food.name.includes(q)) return food;
    for (const alias of food.aliases) {
      if (q.includes(alias) || alias.includes(q)) return food;
    }
  }

  return null;
}

/**
 * Parse portion string and calculate grams using the food's default_weight.
 * Supports: "2 roti", "150g", "1 bowl", "3", etc.
 */
export function parsePortionGrams(portion, food) {
  if (!portion) return food.default_weight;
  const s = portion.toLowerCase().trim();

  // Exact grams: "150g", "200 grams"
  const gramMatch = s.match(/^([\d.]+)\s*(g|grams?)$/);
  if (gramMatch) return parseFloat(gramMatch[1]);

  // Leading quantity: "2 roti", "3 pieces", "2"
  const numMatch = s.match(/^([\d.]+)/);
  const qty = numMatch ? parseFloat(numMatch[1]) : 1;

  return qty * food.default_weight;
}

/**
 * Calculate full nutrition for a food item using Indian DB.
 * Returns null if food not found.
 */
export function calculateFromIndianDb(foodName, portion) {
  const food = matchIndianFood(foodName);
  if (!food) return null;

  const grams = parsePortionGrams(portion, food);
  const factor = grams / 100;

  return {
    foodName,
    portion,
    grams: Math.round(grams),
    calories: Math.round(food.calories_per_100g * factor),
    protein: +(food.protein_per_100g * factor).toFixed(1),
    carbs: +(food.carbs_per_100g * factor).toFixed(1),
    fat: +(food.fat_per_100g * factor).toFixed(1),
    matched: food.name,
    source: "indian_db",
  };
}

/**
 * Get all food names for autocomplete/search suggestions.
 */
export function getAllFoodNames() {
  const names = [];
  for (const food of foods) {
    names.push(food.name);
    for (const alias of food.aliases) {
      names.push(alias);
    }
  }
  return names;
}

/**
 * Search foods by partial name (for autocomplete).
 */
export function searchFoods(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = [];
  for (const food of foods) {
    if (food.name.includes(q)) {
      results.push(food);
      continue;
    }
    for (const alias of food.aliases) {
      if (alias.includes(q)) {
        results.push(food);
        break;
      }
    }
  }
  return results;
}
