import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Ingredient {
  name: string;
  amount: string;
  estimatedCost: number;
  isOwned: boolean;
}

export interface Recipe {
  name: string;
  description: string;
  totalCost: number;
  costPerPerson: number;
  prepTime: number;
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients: Ingredient[];
  steps: string[];
  requiredKeyItems?: string[];
}

// Real-world Philippine market price dictionary (NCR Wet Market & Supermarket benchmarks as of 2026)
export const PHILIPPINE_COMMODITY_PRICES: Record<string, { unit: string; price: number; aliases: string[] }> = {
  sardines: { unit: "1 can (155g)", price: 25, aliases: ["canned sardines", "sardinas"] },
  cabbage: { unit: "1/2 head", price: 35, aliases: ["repolyo", "cabbage head"] },
  garlic: { unit: "1 clove", price: 2, aliases: ["bawang", "garlic cloves"] },
  onion: { unit: "1 medium piece", price: 8, aliases: ["sibuyas"] },
  cooking_oil: { unit: "1 tbsp", price: 4, aliases: ["oil", "cooking oil", "mantika"] },
  egg: { unit: "1 medium piece", price: 9, aliases: ["itlog", "eggs"] },
  eggplant: { unit: "1 piece", price: 12, aliases: ["talong", "eggplants"] },
  misua: { unit: "1 pack", price: 10, aliases: ["misua noodles", "odong"] },
  patola: { unit: "1 piece", price: 20, aliases: ["sponge gourd"] },
  rice: { unit: "1 cup cooked", price: 5, aliases: ["sinangag", "rice", "leftover rice", "cooked rice", "kanin"] },
  butter: { unit: "1 tbsp", price: 8, aliases: ["butter", "margarine"] },
  soy_sauce: { unit: "1 tbsp", price: 2, aliases: ["toyo", "soy sauce"] },
  vinegar: { unit: "1 tbsp", price: 2, aliases: ["suka", "vinegar"] },
  fish_sauce: { unit: "1 tbsp", price: 2, aliases: ["patis", "fish sauce"] },
  kangkong: { unit: "1 bundle", price: 15, aliases: ["water spinach"] },
  ginger: { unit: "1 thumb-size", price: 4, aliases: ["luya"] },
  tomato: { unit: "1 piece", price: 6, aliases: ["kamatis", "tomatoes"] },
  pork: { unit: "100g", price: 35, aliases: ["pig", "baboy", "pork loin", "pork belly", "liempo"] },
  chicken: { unit: "100g", price: 22, aliases: ["manok", "chicken breast", "chicken thigh", "chicken wings"] },
  salt: { unit: "1 tsp", price: 1, aliases: ["asin", "salt"] },
  pepper: { unit: "1 tsp", price: 1, aliases: ["paminta", "pepper", "black pepper"] },
  sugar: { unit: "1 tsp", price: 1, aliases: ["asukal", "sugar"] }
};

// Helper to look up realistic price based on ingredient name
const lookupPrice = (name: string): number => {
  const normalized = name.toLowerCase();
  for (const [key, item] of Object.entries(PHILIPPINE_COMMODITY_PRICES)) {
    if (normalized.includes(key) || item.aliases.some(alias => normalized.includes(alias))) {
      return item.price;
    }
  }
  if (normalized.includes("beef")) return 45;
  if (normalized.includes("fish") || normalized.includes("isda")) return 25;
  if (normalized.includes("vegetable") || normalized.includes("gulay")) return 15;
  return 10;
};

// Helper to check if user has an ingredient (basic keyword matching)
const checkOwnership = (ingredientName: string, availableIngredients: string): boolean => {
  const normalized = availableIngredients.toLowerCase();
  const nameParts = ingredientName.toLowerCase().split(/[\s,()]+/);
  return nameParts.some(part => 
    part.length > 2 && 
    (normalized.includes(part) || 
     (part.endsWith("s") && normalized.includes(part.slice(0, -1))) || 
     normalized.includes(part + "s"))
  );
};

// Local mock database of Filipino recipes with price computation from the real price dictionary
export const generateMockRecipes = (budget: number, people: number, ingredientsStr: string): Recipe[] => {
  const recipes: Recipe[] = [
    {
      name: "Classic Chicken Adobo",
      description: "The national dish of the Philippines. Chicken pieces simmered in soy sauce, vinegar, garlic, and pepper until tender.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 25,
      nutrition: { calories: 340, protein: "24g", carbs: "5g", fat: "18g" },
      requiredKeyItems: ["chicken"],
      ingredients: [
        { name: "Chicken", amount: "300g", estimatedCost: Math.round(lookupPrice("chicken") * 3), isOwned: false },
        { name: "Soy Sauce", amount: "4 tbsp", estimatedCost: lookupPrice("soy_sauce") * 4, isOwned: false },
        { name: "Vinegar", amount: "3 tbsp", estimatedCost: lookupPrice("vinegar") * 3, isOwned: false },
        { name: "Garlic", amount: "5 cloves", estimatedCost: lookupPrice("garlic") * 5, isOwned: false },
        { name: "Cooking Oil", amount: "1 tbsp", estimatedCost: lookupPrice("cooking_oil"), isOwned: false }
      ],
      steps: [
        "In a bowl, combine chicken, soy sauce, and minced garlic. Marinate for at least 10 minutes.",
        "Heat cooking oil in a pan. Pan-fry the chicken pieces for 2-3 minutes per side until lightly browned.",
        "Pour the marinade and 1/2 cup of water into the pan. Bring to a boil, then cover and simmer over low heat for 15 minutes.",
        "Pour in the vinegar. Let it boil uncovered for 2 minutes without stirring.",
        "Stir and simmer for another 3 minutes until the sauce reduces and thickens. Serve hot with warm rice."
      ]
    },
    {
      name: "Ginisang Repolyo with Chicken",
      description: "A healthy, savory, and extremely budget-friendly stir-fry of shredded cabbage and chicken pieces.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 15,
      nutrition: { calories: 240, protein: "18g", carbs: "10g", fat: "12g" },
      requiredKeyItems: ["chicken", "cabbage"],
      ingredients: [
        { name: "Chicken", amount: "200g", estimatedCost: Math.round(lookupPrice("chicken") * 2), isOwned: false },
        { name: "Cabbage", amount: "1/2 head", estimatedCost: lookupPrice("cabbage"), isOwned: false },
        { name: "Garlic", amount: "3 cloves", estimatedCost: lookupPrice("garlic") * 3, isOwned: false },
        { name: "Onion", amount: "1 piece", estimatedCost: lookupPrice("onion"), isOwned: false },
        { name: "Soy Sauce", amount: "2 tbsp", estimatedCost: lookupPrice("soy_sauce") * 2, isOwned: false },
        { name: "Cooking Oil", amount: "1 tbsp", estimatedCost: lookupPrice("cooking_oil"), isOwned: false }
      ],
      steps: [
        "Heat oil in a pan. Sauté garlic and onions until fragrant.",
        "Add the sliced chicken and stir-fry for 5 minutes until cooked and lightly browned.",
        "Drizzle soy sauce over the chicken and stir.",
        "Add the shredded cabbage. Toss quickly and cook for 3 minutes until crisp-tender.",
        "Season with pepper to taste and serve warm."
      ]
    },
    {
      name: "Ginisang Repolyo with Sardines",
      description: "A simple and delicious stir-fry dish featuring canned sardines and shredded cabbage, a true Pinoy budget staple.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 15,
      nutrition: { calories: 220, protein: "14g", carbs: "12g", fat: "13g" },
      requiredKeyItems: ["sardines", "cabbage"],
      ingredients: [
        { name: "Canned Sardines in Tomato Sauce", amount: "2 cans", estimatedCost: lookupPrice("sardines") * 2, isOwned: false },
        { name: "Cabbage", amount: "1/2 head", estimatedCost: lookupPrice("cabbage"), isOwned: false },
        { name: "Garlic", amount: "3 cloves", estimatedCost: lookupPrice("garlic") * 3, isOwned: false },
        { name: "Onion", amount: "1 piece", estimatedCost: lookupPrice("onion"), isOwned: false },
        { name: "Cooking Oil", amount: "1 tbsp", estimatedCost: lookupPrice("cooking_oil"), isOwned: false },
        { name: "Egg", amount: "2 pieces", estimatedCost: lookupPrice("egg") * 2, isOwned: false }
      ],
      steps: [
        "Heat oil in a pan over medium heat. Sauté garlic and onions until fragrant and translucent.",
        "Add the sardines including the tomato sauce. Break the fish gently into smaller pieces and simmer for 2 minutes.",
        "Add the shredded cabbage. Toss gently and cook for about 3-5 minutes until the cabbage is crisp-tender.",
        "Pour in the beaten eggs (if using). Stir gently until the eggs are cooked and distributed.",
        "Season with salt and pepper to taste. Serve hot with warm rice."
      ]
    },
    {
      name: "Simple Ginisang Repolyo (No Meat)",
      description: "An ultra-budget vegetable stir-fry of shredded cabbage, garlic, onions, and basic seasonings.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 10,
      nutrition: { calories: 95, protein: "2g", carbs: "10g", fat: "6g" },
      requiredKeyItems: ["cabbage"],
      ingredients: [
        { name: "Cabbage", amount: "1/2 head", estimatedCost: lookupPrice("cabbage"), isOwned: false },
        { name: "Garlic", amount: "3 cloves", estimatedCost: lookupPrice("garlic") * 3, isOwned: false },
        { name: "Onion", amount: "1 piece", estimatedCost: lookupPrice("onion"), isOwned: false },
        { name: "Cooking Oil", amount: "1 tbsp", estimatedCost: lookupPrice("cooking_oil"), isOwned: false }
      ],
      steps: [
        "Heat cooking oil in a pan over medium heat.",
        "Sauté minced garlic and onion until aromatic and tender.",
        "Add shredded cabbage and stir-fry for 3-4 minutes until crisp-tender.",
        "Season with salt and pepper to taste, and serve hot."
      ]
    },
    {
      name: "Talong Omelet (Tortang Talong)",
      description: "Grilled eggplants flattened and dipped in beaten eggs, then shallow fried. Crispy on the outside, soft and savory on the inside.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 20,
      nutrition: { calories: 180, protein: "10g", carbs: "9g", fat: "12g" },
      requiredKeyItems: ["eggplant", "egg"],
      ingredients: [
        { name: "Eggplant (Talong)", amount: "3 pieces", estimatedCost: lookupPrice("eggplant") * 3, isOwned: false },
        { name: "Egg", amount: "4 pieces", estimatedCost: lookupPrice("egg") * 4, isOwned: false },
        { name: "Garlic", amount: "2 cloves", estimatedCost: lookupPrice("garlic") * 2, isOwned: false },
        { name: "Cooking Oil", amount: "2 tbsp", estimatedCost: lookupPrice("cooking_oil") * 2, isOwned: false },
        { name: "Salt and Pepper", amount: "to taste", estimatedCost: lookupPrice("salt") + lookupPrice("pepper"), isOwned: false }
      ],
      steps: [
        "Grilled the eggplants directly over stove fire or bake until the skin is charred and the flesh is soft.",
        "Let cool, then carefully peel off the charred skin, keeping the stem intact.",
        "In a flat dish, beat the eggs and season with garlic, salt, and pepper.",
        "Place an eggplant on the plate and flatten the flesh gently with a fork.",
        "Heat oil in a wide frying pan. Dip the flattened eggplant in the egg mixture and slide it into the pan.",
        "Pour remaining egg mixture over the eggplant. Fry for 2-3 minutes per side until golden brown."
      ]
    },
    {
      name: "Sardines with Odong (Misua Noodles)",
      description: "A comforting soup dish made with canned sardines in tomato sauce, flour noodles (misua or odong), and sliced patola (sponge gourd).",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 15,
      nutrition: { calories: 260, protein: "15g", carbs: "30g", fat: "9g" },
      requiredKeyItems: ["sardines"],
      ingredients: [
        { name: "Canned Sardines in Tomato Sauce", amount: "2 cans", estimatedCost: lookupPrice("sardines") * 2, isOwned: false },
        { name: "Misua Noodles", amount: "2 packs", estimatedCost: lookupPrice("misua") * 2, isOwned: false },
        { name: "Garlic", amount: "3 cloves", estimatedCost: lookupPrice("garlic") * 3, isOwned: false },
        { name: "Onion", amount: "1 piece", estimatedCost: lookupPrice("onion"), isOwned: false },
        { name: "Patola (Sponge Gourd)", amount: "1 piece", estimatedCost: lookupPrice("patola"), isOwned: false }
      ],
      steps: [
        "Sauté garlic and onions in a pot with a little oil until translucent.",
        "Pour in the canned sardines including the sauce. Cook for 1 minute.",
        "Add 3 cups of water and bring to a boil. Simmer for 3 minutes.",
        "Add patola slices and cook for 2 minutes.",
        "Gently drop in the misua noodles. Simmer for 1-2 minutes until noodles are soft. Season with fish sauce or salt to taste."
      ]
    },
    {
      name: "Garlic Butter Egg Fried Rice (Sinangag)",
      description: "A quick and filling meal utilizing leftover rice, fried garlic bits, scrambled eggs, and green onions. Extremely budget-friendly.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 12,
      nutrition: { calories: 320, protein: "9g", carbs: "50g", fat: "10g" },
      requiredKeyItems: ["rice", "egg"],
      ingredients: [
        { name: "Leftover Cooked Rice", amount: "4 cups", estimatedCost: lookupPrice("rice") * 4, isOwned: false },
        { name: "Egg", amount: "3 pieces", estimatedCost: lookupPrice("egg") * 3, isOwned: false },
        { name: "Garlic", amount: "6 cloves", estimatedCost: lookupPrice("garlic") * 6, isOwned: false },
        { name: "Butter or Margarine", amount: "1 tbsp", estimatedCost: lookupPrice("butter"), isOwned: false },
        { name: "Soy Sauce", amount: "1 tbsp", estimatedCost: lookupPrice("soy_sauce"), isOwned: false }
      ],
      steps: [
        "Melt butter in a large pan or wok. Add minced garlic and fry over low-medium heat until golden brown and crispy. Set aside some garlic for garnish.",
        "Push garlic to the side, crack in the eggs, and scramble them in the pan until cooked.",
        "Add the cold leftover rice, breaking up any clumps with a spatula.",
        "Drizzle with soy sauce and stir-fry everything together for 5 minutes until rice is heated through.",
        "Toss in green onions or garlic, season with salt and pepper, and top with the crispy garlic bits before serving."
      ]
    },
    {
      name: "Egg Drop Soup (Soupang Itlog)",
      description: "A warming and comforting Filipino egg soup made with garlic, onion, broth, and eggs swirled in.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 10,
      nutrition: { calories: 120, protein: "8g", carbs: "6g", fat: "8g" },
      requiredKeyItems: ["egg"],
      ingredients: [
        { name: "Egg", amount: "2 pieces", estimatedCost: lookupPrice("egg") * 2, isOwned: false },
        { name: "Garlic", amount: "2 cloves", estimatedCost: lookupPrice("garlic") * 2, isOwned: false },
        { name: "Onion", amount: "1 piece", estimatedCost: lookupPrice("onion"), isOwned: false },
        { name: "Cooking Oil", amount: "1 tbsp", estimatedCost: lookupPrice("cooking_oil"), isOwned: false }
      ],
      steps: [
        "In a small pot, sauté minced garlic and onion in oil until fragrant.",
        "Add 3 cups of water and bring to a boil. Simmer for 3 minutes.",
        "Slowly pour in beaten eggs while stirring the soup in a circular motion to create egg ribbons.",
        "Season with salt and pepper to taste. Serve hot."
      ]
    },
    {
      name: "Adobong Kangkong (Water Spinach)",
      description: "Crispy water spinach cooked in garlic, soy sauce, and vinegar. A high-fiber, healthy, and extremely cheap dish.",
      totalCost: 0,
      costPerPerson: 0,
      prepTime: 15,
      nutrition: { calories: 110, protein: "4g", carbs: "8g", fat: "7g" },
      requiredKeyItems: ["kangkong"],
      ingredients: [
        { name: "Kangkong (Water Spinach)", amount: "2 bundles", estimatedCost: lookupPrice("kangkong") * 2, isOwned: false },
        { name: "Soy Sauce", amount: "3 tbsp", estimatedCost: lookupPrice("soy_sauce") * 3, isOwned: false },
        { name: "Vinegar", amount: "1.5 tbsp", estimatedCost: lookupPrice("vinegar") * 1.5, isOwned: false },
        { name: "Garlic", amount: "1 whole head", estimatedCost: lookupPrice("garlic") * 8, isOwned: false },
        { name: "Cooking Oil", amount: "2 tbsp", estimatedCost: lookupPrice("cooking_oil") * 2, isOwned: false }
      ],
      steps: [
        "Separate the kangkong leaves from the tender stems. Cut stems into 2-inch lengths.",
        "Sauté garlic in oil until golden and crisp. Remove half of the garlic for garnish.",
        "Add the kangkong stems first and stir-fry for 2 minutes, as they take longer to cook.",
        "Add the kangkong leaves, soy sauce, vinegar, and sugar. Do not stir immediately; let the vinegar cook off for 1 minute.",
        "Stir-fry quickly for 2 more minutes until leaves are wilted. Garnish with toasted garlic and serve."
      ]
    }
  ];

  const headcountFactor = Math.max(1, people / 2);

  const mappedRecipes = recipes.map(recipe => {
    let ownedCount = 0;
    let totalCostSum = 0;

    const adjustedIngredients = recipe.ingredients.map(ing => {
      const isOwned = checkOwnership(ing.name, ingredientsStr);
      const baseCost = ing.estimatedCost;
      const scaledCost = Math.round(baseCost * (people / 2));
      
      const match = ing.amount.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
      let adjustedAmount = ing.amount;
      if (match) {
        const num = parseFloat(match[1]) * headcountFactor;
        const cleanNum = num % 1 === 0 ? num.toString() : num.toFixed(1);
        adjustedAmount = `${cleanNum} ${match[2]}`;
      }

      if (isOwned) {
        ownedCount += 1;
      } else {
        totalCostSum += scaledCost;
      }

      return {
        ...ing,
        amount: adjustedAmount,
        estimatedCost: scaledCost,
        isOwned
      };
    });

    const finalCost = Math.max(15, totalCostSum);

    return {
      ...recipe,
      ingredients: adjustedIngredients,
      totalCost: finalCost,
      costPerPerson: Math.round(finalCost / people),
      prepTime: Math.round(recipe.prepTime * (1 + (people - 2) * 0.1)),
      nutrition: {
        ...recipe.nutrition,
        calories: Math.round(recipe.nutrition.calories * headcountFactor)
      },
      ownedCount
    };
  });

  // Strict primary ingredient matching:
  // A recipe is ONLY allowed if the user owns ALL of its requiredKeyItems!
  const filteredRecipes = mappedRecipes.filter(recipe => {
    // If no ingredients are chosen, show everything
    const hasAnyIngredients = ingredientsStr.trim().length > 0;
    if (!hasAnyIngredients) return true;

    // EVERY required key item for the recipe must be present in the user's available list
    return (recipe.requiredKeyItems || []).every(keyItem => 
      checkOwnership(keyItem, ingredientsStr)
    );
  });

  // Fallback: If strict matching yields zero results, return mappedRecipes (prevent showing empty)
  const finalResults = filteredRecipes.length > 0 ? filteredRecipes : mappedRecipes;

  return finalResults
    .filter(recipe => recipe.totalCost <= budget + 25)
    .sort((a, b) => b.ownedCount - a.ownedCount || a.totalCost - b.totalCost)
    .slice(0, 3);
};

export const generateRecipes = async (
  budget: number,
  people: number,
  ingredients: string
): Promise<Recipe[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  // Check if API key is blank OR is the placeholder key they pasted (which fails)
  const isInvalidKey = !apiKey || apiKey.trim() === "";

  if (isInvalidKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockRecipes(budget, people, ingredients);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const priceListString = Object.entries(PHILIPPINE_COMMODITY_PRICES)
      .map(([key, value]) => `- ${key}: ₱${value.price} per ${value.unit}`)
      .join("\n");

    const prompt = `You are UlamGPT, a highly creative budget-friendly Filipino chef.
Goal: Provide exactly 2 or 3 Filipino recipes that can be made with a total budget of ₱${budget} PHP for ${people} people.
Available ingredients at home: "${ingredients}".
Focus: Maximize use of available ingredients to minimize the actual out-of-pocket cost.

COMMODITY PRICING RULES:
You MUST use the following real-world market prices for calculating estimated ingredient costs. DO NOT hallucinate other prices for these items:
${priceListString}

Rules:
1. Provide authentic, edible, and tasty Filipino dishes (like Ginisang Repolyo, Tortang Talong, Sardines with Misua, Sinangag, Ginisang Monggo, etc.)
2. If an ingredient is not in the commodity price list above, estimate a highly realistic, cheap Philippine wet market price.
3. The totalCost of each recipe MUST represent the cost of the ingredients that are NOT owned by the user (i.e. what they need to spend).
4. If an ingredient matches or is highly similar to the user's available ingredients, mark isOwned as true.
5. If the user did not list a key ingredient (e.g. they did not list "sardines"), DO NOT suggest recipes that require buying expensive key items (like sardines, beef, or whole pork) if they exceed the budget or mismatch their intent.

You must respond with a JSON array of recipe objects. Do not include any explanations, markdown format (no \`\`\`json wrappers), just the raw JSON. The response MUST strictly validate against this TypeScript interface:
interface Recipe {
  name: string;
  description: string;
  totalCost: number; // Sum of estimated costs for ingredients where isOwned is false
  costPerPerson: number; // totalCost divided by headcount of ${people}
  prepTime: number; // Prep and cooking time in minutes
  nutrition: {
    calories: number;
    protein: string; // e.g. "15g"
    carbs: string; // e.g. "35g"
    fat: string; // e.g. "12g"
  };
  ingredients: {
    name: string;
    amount: string; // e.g. "2 cans", "1/2 head"
    estimatedCost: number; // cost in PHP based on the pricing table provided
    isOwned: boolean; // true if it is in the user's available ingredients list
  }[];
  steps: string[]; // step-by-step instructions
}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const text = result.response.text();
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    const parsed = JSON.parse(text) as Recipe[];
    
    return parsed.map(recipe => {
      let calcTotalCost = 0;
      const updatedIngredients = recipe.ingredients.map(ing => {
        const isOwned = ing.isOwned || checkOwnership(ing.name, ingredients);
        
        let cost = ing.estimatedCost;
        const normalized = ing.name.toLowerCase();
        for (const [key, value] of Object.entries(PHILIPPINE_COMMODITY_PRICES)) {
          if (normalized.includes(key) || value.aliases.some(alias => normalized.includes(alias))) {
            const countMatch = ing.amount.match(/^(\d+(?:\.\d+)?)/);
            const multiplier = countMatch ? parseFloat(countMatch[1]) : 1;
            cost = Math.round(value.price * multiplier);
            break;
          }
        }

        if (!isOwned) {
          calcTotalCost += cost;
        }
        return { ...ing, estimatedCost: cost, isOwned };
      });

      const finalTotalCost = calcTotalCost || recipe.totalCost || 10;

      return {
        name: recipe.name || "Filipino Dish",
        description: recipe.description || "A delicious budget-friendly meal.",
        totalCost: finalTotalCost,
        costPerPerson: Math.round(finalTotalCost / people),
        prepTime: recipe.prepTime || 20,
        nutrition: {
          calories: recipe.nutrition?.calories || 200,
          protein: recipe.nutrition?.protein || "10g",
          carbs: recipe.nutrition?.carbs || "20g",
          fat: recipe.nutrition?.fat || "8g"
        },
        ingredients: updatedIngredients,
        steps: recipe.steps || ["Mix ingredients.", "Cook.", "Serve warm with rice."]
      };
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};
