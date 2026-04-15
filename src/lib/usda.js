import axios from "axios";

const BASE = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.USDA_API_KEY;

/**
 * Search USDA FoodData Central for a food and return the best match.
 */
export async function searchFood(query) {
  const url = `${BASE}/foods/search`;
  const { data } = await axios.get(url, {
    params: {
      api_key: KEY,
      query,
      pageSize: 5,
      dataType: "Survey (FNDDS),SR Legacy,Foundation,Branded",
    },
  });
  const food = data?.foods?.[0];
  if (!food) return null;

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
}

const GRAM_EQUIVALENTS = {
  bowl: 250,
  cup: 240,
  plate: 300,
  piece: 80,
  roti: 40,
  chapati: 40,
  slice: 30,
  item: 80,
  serving: 150,
  tbsp: 15,
  tsp: 5,
  oz: 28.35,
};

/**
 * Parse a free-form portion string into grams.
 * Supports: "150g", "2 rotis", "1 bowl rice", "1.5 cups"
 */
export function portionToGrams(portion) {
  if (!portion) return null;
  const s = portion.toLowerCase().trim();

  const gramMatch = s.match(/^([\d.]+)\s*(g|grams?)$/);
  if (gramMatch) return parseFloat(gramMatch[1]);

  const mlMatch = s.match(/^([\d.]+)\s*(ml|milliliters?)$/);
  if (mlMatch) return parseFloat(mlMatch[1]); // assume density ~1

  const unitMatch = s.match(/^([\d.]+)\s*([a-z]+)/);
  if (unitMatch) {
    const qty = parseFloat(unitMatch[1]);
    const unit = unitMatch[2].replace(/s$/, "");
    if (GRAM_EQUIVALENTS[unit]) return qty * GRAM_EQUIVALENTS[unit];
  }

  const numOnly = s.match(/^([\d.]+)$/);
  if (numOnly) return parseFloat(numOnly[1]) * 80; // assume "items" of ~80g

  return null;
}

/**
 * Lookup a food and compute nutrition for the given portion.
 */
export async function nutritionForPortion(foodName, portion) {
  const grams = portionToGrams(portion);
  const match = await searchFood(foodName);
  if (!match || !grams) {
    return {
      foodName,
      portion,
      grams,
      calories: 0,
      matched: match,
      error: !match ? "no_usda_match" : "invalid_portion",
    };
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
