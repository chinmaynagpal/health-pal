import axios from "axios";

const BASE = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.USDA_API_KEY;

/**
 * Search USDA FoodData Central for a food and return the best match.
 */
export async function searchFood(query) {
  if (!KEY) {
    console.error("[usda] USDA_API_KEY is not set");
    return null;
  }
  try {
    const url = `${BASE}/foods/search`;
    const { data } = await axios.get(url, {
      params: {
        api_key: KEY,
        query,
        pageSize: 5,
        dataType: "Survey (FNDDS),SR Legacy,Foundation,Branded",
      },
      timeout: 10000,
    });
    const food = data?.foods?.[0];
    if (!food) {
      console.warn(`[usda] No match for "${query}"`);
      return null;
    }

    const nutrients = {};
    for (const n of food.foodNutrients || []) {
      const nm = (n.nutrientName || "").toLowerCase();
      if (nm.includes("energy") && (n.unitName || "").toLowerCase() === "kcal") {
        nutrients.kcalPer100g = n.value;
      } else if (nm === "protein") nutrients.proteinPer100g = n.value;
      else if (nm.includes("total lipid")) nutrients.fatPer100g = n.value;
      else if (nm.includes("carbohydrate")) nutrients.carbsPer100g = n.value;
    }

    return {
      fdcId: food.fdcId,
      description: food.description,
      brand: food.brandOwner || null,
      ...nutrients,
    };
  } catch (e) {
    console.error(`[usda] Search failed for "${query}":`, e.message);
    return null;
  }
}

const GRAM_EQUIVALENTS = {
  bowl: 250,
  cup: 240,
  plate: 300,
  piece: 80,
  piece_large: 120,
  piece_small: 50,
  roti: 40,
  chapati: 40,
  naan: 90,
  paratha: 80,
  dosa: 100,
  idli: 40,
  slice: 30,
  item: 80,
  serving: 150,
  tbsp: 15,
  tablespoon: 15,
  tsp: 5,
  teaspoon: 5,
  oz: 28.35,
  ounce: 28.35,
  glass: 250,
  handful: 30,
  scoop: 30,
  fillet: 170,
  breast: 170,
  thigh: 110,
  drumstick: 75,
  egg: 50,
  banana: 120,
  apple: 180,
  orange: 130,
};

// Size multipliers
const SIZE_MULTIPLIERS = {
  small: 0.7,
  medium: 1.0,
  large: 1.4,
  extra: 1.6,
  half: 0.5,
  quarter: 0.25,
  double: 2.0,
};

/**
 * Parse a free-form portion string into grams.
 * Handles: "150g", "2 rotis", "1 bowl", "1.5 cups", "large piece",
 *          "half bowl", "a cup", "medium", "1/2 cup", etc.
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

  // Replace "a " / "an " with "1 "
  s = s.replace(/^an?\s+/, "1 ");

  // Handle fractions: "1/2" → 0.5, "3/4" → 0.75
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => (parseInt(a) / parseInt(b)).toString());

  // Try to extract: [size] [quantity] [unit] [extra words]
  // e.g. "large piece", "2 small bowls", "half cup rice"
  let qty = 1;
  let sizeMultiplier = 1;
  let unit = null;

  // Extract size modifier
  for (const [word, mult] of Object.entries(SIZE_MULTIPLIERS)) {
    if (s.includes(word)) {
      sizeMultiplier = mult;
      s = s.replace(new RegExp(`\\b${word}\\b`), "").trim();
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
    // Strip trailing 's' for plurals, and extra descriptor words
    const words = s.split(/\s+/);
    const unitCandidate = words[0].replace(/s$/, "");
    if (GRAM_EQUIVALENTS[unitCandidate]) {
      unit = unitCandidate;
    } else if (GRAM_EQUIVALENTS[s.replace(/s$/, "")]) {
      unit = s.replace(/s$/, "");
    }
  }

  if (unit) {
    return qty * GRAM_EQUIVALENTS[unit] * sizeMultiplier;
  }

  // Number only: "2" → assume 2 items of ~80g
  if (qty > 0 && !s) {
    return qty * 80 * sizeMultiplier;
  }

  // Check if the whole string (without number) is a known food unit
  const wholeUnit = s.replace(/s$/, "");
  if (GRAM_EQUIVALENTS[wholeUnit]) {
    return qty * GRAM_EQUIVALENTS[wholeUnit] * sizeMultiplier;
  }

  // Last resort: assume a standard serving of 150g
  console.warn(`[usda] Could not parse portion "${portion}", defaulting to 150g`);
  return 150;
}

/**
 * Lookup a food and compute nutrition for the given portion.
 */
export async function nutritionForPortion(foodName, portion) {
  const grams = portionToGrams(portion);
  const match = await searchFood(foodName);

  if (!match) {
    console.warn(`[usda] No USDA match for "${foodName}"`);
    return {
      foodName,
      portion,
      grams,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      matched: null,
      error: "no_usda_match",
    };
  }

  if (!grams || grams <= 0) {
    console.warn(`[usda] Invalid portion "${portion}" for "${foodName}"`);
    return {
      foodName,
      portion,
      grams: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fdcId: match.fdcId,
      matched: match.description,
      error: "invalid_portion",
    };
  }

  if (!match.kcalPer100g && match.kcalPer100g !== 0) {
    console.warn(`[usda] No calorie data for "${foodName}" (fdcId: ${match.fdcId})`);
  }

  const factor = grams / 100;
  return {
    foodName,
    portion,
    grams,
    matched: match.description,
    fdcId: match.fdcId,
    calories: Math.round((match.kcalPer100g || 0) * factor),
    protein: +((match.proteinPer100g || 0) * factor).toFixed(1),
    carbs: +((match.carbsPer100g || 0) * factor).toFixed(1),
    fat: +((match.fatPer100g || 0) * factor).toFixed(1),
  };
}
