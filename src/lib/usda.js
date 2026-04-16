import axios from "axios";

const BASE = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.USDA_API_KEY;

// ── Food name normalization ──────────────────────────────────────────
const NOISE_WORDS = [
  "homemade", "fresh", "organic", "raw", "cooked", "boiled", "fried",
  "grilled", "baked", "steamed", "roasted", "frozen", "canned",
  "with", "and", "in", "style", "type", "indian", "american",
  "chinese", "italian", "mexican", "thai",
];

function normalizeQuery(name) {
  let q = name.toLowerCase().trim();
  // Remove parenthetical info
  q = q.replace(/\(.*?\)/g, "").trim();
  // Remove noise words for cleaner USDA match
  const words = q.split(/\s+/).filter((w) => !NOISE_WORDS.includes(w));
  return words.join(" ").trim() || q;
}

// Simplify further for retry: keep only first 2 meaningful words
function simplifyQuery(name) {
  const words = normalizeQuery(name).split(/\s+/);
  return words.slice(0, 2).join(" ");
}

// ── USDA search with tiered strategy ─────────────────────────────────

// Priority order: Foundation and SR Legacy are lab-measured, most accurate
const PREFERRED_TYPES = ["Foundation", "SR Legacy", "Survey (FNDDS)"];

function extractNutrients(food) {
  const nutrients = { kcalPer100g: null, proteinPer100g: null, fatPer100g: null, carbsPer100g: null };
  for (const n of food.foodNutrients || []) {
    const nm = (n.nutrientName || "").toLowerCase();
    const unit = (n.unitName || "").toLowerCase();
    if (nm.includes("energy") && unit === "kcal") {
      nutrients.kcalPer100g = n.value;
    } else if (nm === "protein") {
      nutrients.proteinPer100g = n.value;
    } else if (nm.includes("total lipid")) {
      nutrients.fatPer100g = n.value;
    } else if (nm.includes("carbohydrate")) {
      nutrients.carbsPer100g = n.value;
    }
  }
  return nutrients;
}

function scoreResult(food, query) {
  let score = 0;
  const desc = (food.description || "").toLowerCase();
  const qLower = query.toLowerCase();

  // Exact description match
  if (desc === qLower) score += 100;
  // Description starts with query
  else if (desc.startsWith(qLower)) score += 60;
  // Description contains query
  else if (desc.includes(qLower)) score += 30;

  // Each query word found in description
  const qWords = qLower.split(/\s+/);
  for (const w of qWords) {
    if (desc.includes(w)) score += 10;
  }

  // Prefer data types with lab-measured data
  const typeIdx = PREFERRED_TYPES.indexOf(food.dataType);
  if (typeIdx >= 0) score += (PREFERRED_TYPES.length - typeIdx) * 15;

  // Has calorie data
  const nuts = extractNutrients(food);
  if (nuts.kcalPer100g != null && nuts.kcalPer100g > 0) score += 20;

  return score;
}

async function usdaSearch(query, dataTypes, pageSize = 8) {
  const { data } = await axios.get(`${BASE}/foods/search`, {
    params: {
      api_key: KEY,
      query,
      pageSize,
      dataType: dataTypes,
    },
    timeout: 10000,
  });
  return data?.foods || [];
}

/**
 * Search USDA with tiered strategy:
 * 1. Foundation + SR Legacy (most accurate)
 * 2. Survey (FNDDS) — prepared foods
 * 3. All types including Branded
 * Pick best match by relevance score.
 */
export async function searchFood(query) {
  if (!KEY) {
    console.error("[usda] USDA_API_KEY is not set");
    return null;
  }

  const normalized = normalizeQuery(query);
  console.log(`[usda] Searching: "${query}" → normalized: "${normalized}"`);

  try {
    // Tier 1: Foundation + SR Legacy
    let results = await usdaSearch(normalized, "Foundation,SR Legacy");

    // Tier 2: Add Survey if no good results
    if (results.length < 2) {
      const more = await usdaSearch(normalized, "Survey (FNDDS)");
      results = [...results, ...more];
    }

    // Tier 3: Try Branded + all if still nothing
    if (!results.length) {
      results = await usdaSearch(normalized, "Foundation,SR Legacy,Survey (FNDDS),Branded");
    }

    // Tier 4: Retry with simplified query
    if (!results.length) {
      const simple = simplifyQuery(query);
      if (simple !== normalized) {
        console.log(`[usda] Retrying with simplified: "${simple}"`);
        results = await usdaSearch(simple, "Foundation,SR Legacy,Survey (FNDDS),Branded");
      }
    }

    if (!results.length) {
      console.warn(`[usda] No results for "${query}"`);
      return null;
    }

    // Score and pick best
    const scored = results.map((f) => ({ food: f, score: scoreResult(f, normalized) }));
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0].food;
    const nutrients = extractNutrients(best);

    console.log(`[usda] Best match: "${best.description}" (${best.dataType}, fdcId: ${best.fdcId}, score: ${scored[0].score}, kcal/100g: ${nutrients.kcalPer100g})`);

    if (nutrients.kcalPer100g == null) {
      // Try next result that has calorie data
      for (let i = 1; i < scored.length; i++) {
        const altNuts = extractNutrients(scored[i].food);
        if (altNuts.kcalPer100g != null && altNuts.kcalPer100g > 0) {
          const alt = scored[i].food;
          console.log(`[usda] Switched to "${alt.description}" (has kcal data: ${altNuts.kcalPer100g})`);
          return {
            fdcId: alt.fdcId,
            description: alt.description,
            dataType: alt.dataType,
            ...altNuts,
          };
        }
      }
    }

    return {
      fdcId: best.fdcId,
      description: best.description,
      dataType: best.dataType,
      ...nutrients,
    };
  } catch (e) {
    console.error(`[usda] Search failed for "${query}":`, e.message);
    return null;
  }
}

// ── Portion → grams conversion ───────────────────────────────────────

const GRAM_EQUIVALENTS = {
  bowl: 250, cup: 240, plate: 300, piece: 80,
  roti: 40, chapati: 40, naan: 90, paratha: 80,
  dosa: 100, idli: 40, vada: 60, samosa: 60,
  slice: 30, item: 80, serving: 150,
  tbsp: 15, tablespoon: 15, tsp: 5, teaspoon: 5,
  oz: 28.35, ounce: 28.35, lb: 454, pound: 454,
  glass: 250, handful: 30, scoop: 30,
  fillet: 170, breast: 170, thigh: 110, drumstick: 75, wing: 35,
  egg: 50, banana: 120, apple: 180, orange: 130,
  cookie: 30, biscuit: 20, sandwich: 200, burger: 200,
  pizza: 107, wrap: 150, taco: 80, roll: 60,
};

const SIZE_MULTIPLIERS = {
  small: 0.65, medium: 1.0, large: 1.5, "extra large": 1.8,
  half: 0.5, quarter: 0.25, double: 2.0, triple: 3.0,
};

/**
 * Parse a free-form portion string into grams.
 */
export function portionToGrams(portion) {
  if (!portion) return null;
  let s = portion.toLowerCase().trim();

  // Exact grams: "150g", "200 grams"
  const gramMatch = s.match(/^([\d.]+)\s*(g|grams?)$/);
  if (gramMatch) return parseFloat(gramMatch[1]);

  // ML: "200ml"
  const mlMatch = s.match(/^([\d.]+)\s*(ml|milliliters?)$/);
  if (mlMatch) return parseFloat(mlMatch[1]);

  // kg
  const kgMatch = s.match(/^([\d.]+)\s*(kg|kilograms?)$/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 1000;

  // Replace "a " / "an " with "1 "
  s = s.replace(/^an?\s+/, "1 ");

  // Handle fractions: "1/2" → 0.5
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => (parseInt(a) / parseInt(b)).toString());

  let qty = 1;
  let sizeMultiplier = 1;

  // Extract multi-word size modifiers first ("extra large" before "large")
  const sortedSizes = Object.entries(SIZE_MULTIPLIERS).sort((a, b) => b[0].length - a[0].length);
  for (const [word, mult] of sortedSizes) {
    if (s.includes(word)) {
      sizeMultiplier = mult;
      s = s.replace(word, "").trim();
      break;
    }
  }

  // Extract leading number
  const numMatch = s.match(/^([\d.]+)\s*(.*)/);
  if (numMatch) {
    qty = parseFloat(numMatch[1]) || 1;
    s = numMatch[2].trim();
  }

  // Try to match remaining text to a unit
  if (s) {
    const words = s.split(/\s+/);
    // Try first word (singular)
    const w1 = words[0].replace(/s$/, "").replace(/ies$/, "y");
    if (GRAM_EQUIVALENTS[w1]) {
      return qty * GRAM_EQUIVALENTS[w1] * sizeMultiplier;
    }
    // Try full remaining string
    const full = s.replace(/s$/, "");
    if (GRAM_EQUIVALENTS[full]) {
      return qty * GRAM_EQUIVALENTS[full] * sizeMultiplier;
    }
  }

  // Number only: "2" → assume 2 items
  if (qty > 0 && !s) {
    return qty * 80 * sizeMultiplier;
  }

  // Last resort: standard serving
  console.warn(`[usda] Could not parse portion "${portion}", defaulting to 150g`);
  return 150;
}

// ── Main nutrition pipeline ──────────────────────────────────────────

/**
 * Lookup a food and compute nutrition for the given portion.
 * Formula: calories = (kcal_per_100g / 100) × grams
 */
export async function nutritionForPortion(foodName, portion) {
  const grams = portionToGrams(portion);

  // Search with retry
  let match = await searchFood(foodName);
  if (!match) {
    // One retry with simplified name
    const simple = simplifyQuery(foodName);
    if (simple !== normalizeQuery(foodName)) {
      console.log(`[usda] Retrying nutritionForPortion with: "${simple}"`);
      match = await searchFood(simple);
    }
  }

  if (!match) {
    console.warn(`[usda] No USDA match for "${foodName}" after retry`);
    return {
      foodName, portion, grams: grams || 0,
      calories: 0, protein: 0, carbs: 0, fat: 0,
      matched: null, error: "no_usda_match",
    };
  }

  if (!grams || grams <= 0) {
    console.warn(`[usda] Invalid portion "${portion}" for "${foodName}"`);
    return {
      foodName, portion, grams: 0,
      calories: 0, protein: 0, carbs: 0, fat: 0,
      fdcId: match.fdcId, matched: match.description,
      error: "invalid_portion",
    };
  }

  const kcal = match.kcalPer100g;
  if (kcal == null) {
    console.warn(`[usda] No kcal data for "${match.description}" (fdcId: ${match.fdcId})`);
  }

  const factor = grams / 100;
  const result = {
    foodName, portion, grams,
    matched: match.description,
    fdcId: match.fdcId,
    kcalPer100g: kcal || 0,
    calories: Math.round((kcal || 0) * factor),
    protein: +((match.proteinPer100g || 0) * factor).toFixed(1),
    carbs: +((match.carbsPer100g || 0) * factor).toFixed(1),
    fat: +((match.fatPer100g || 0) * factor).toFixed(1),
  };

  console.log(`[usda] ✓ ${foodName} → "${match.description}" | ${grams}g × ${kcal || 0} kcal/100g = ${result.calories} kcal`);
  return result;
}
