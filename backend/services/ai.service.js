const axios = require("axios");

// Helper to query Groq LLM with fallback models
async function queryGroqChat(messages, options = {}) {
  const models = [
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "llama-3.1-8b-instant",
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.max_tokens ?? 500,
          response_format: options.response_format,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 7000,
        }
      );
      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      }
    } catch (err) {
      // try next model
      continue;
    }
  }
  throw new Error("Groq API unavailable");
}

// 1. Dish Description Generator (Groq LLM + Intelligent Fallback)
exports.generateDishDescription = async ({
  name,
  category = "Veg",
  spiceLevel = "Medium",
  price = 150,
}) => {
  const prompt = `
You are an expert culinary AI for Food Genie.
Generate ONLY valid JSON. No markdown backticks. No extra text.
Dish Name: ${name}
Category: ${category}
Spice Level: ${spiceLevel}
Price: ₹${price}

JSON format:
{
  "description": "Appetizing 2-sentence description of the dish",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "allergens": ["Allergen1"],
  "serves": "1-2 persons",
  "bestFor": ["Lunch", "Dinner"]
}
`;

  try {
    const rawContent = await queryGroqChat(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, response_format: { type: "json_object" } }
    );
    return JSON.parse(rawContent);
  } catch (error) {
    // Deterministic culinary fallback
    const isSweet = /dessert|ice cream|gulab|cake|sweet|kheer|halwa/i.test(name);
    const isPaneer = /paneer/i.test(name);
    const isBiryani = /biryani/i.test(name);
    const isPizza = /pizza/i.test(name);
    const isBurger = /burger/i.test(name);

    let desc = `Delectable and freshly prepared ${name}, crafted with authentic ingredients, aromatic spices, and cooked to culinary perfection.`;
    if (isPaneer) desc = `Soft, succulent paneer cubes simmered in a fragrant aromatic sauce seasoned with traditional house spices.`;
    else if (isBiryani) desc = `Slow-cooked layered basmati rice infused with rich spices, saffron, and tender savory delights.`;
    else if (isPizza) desc = `Fresh stone-baked crust layered with rich herb tomato concasse and generous melted mozzarella.`;
    else if (isBurger) desc = `Juicy seasoned patty nested between toasted brioche buns with crisp lettuce and chef signature dressing.`;
    else if (isSweet) desc = `Traditional sweet indulgence made with pure ingredients and subtle hints of cardamom and dry fruits.`;

    const tags = [category || "Specialty"];
    if (isPaneer) tags.push("North Indian", "Chef's Special");
    else if (isBiryani) tags.push("Hyderabadi", "Signature Dish");
    else if (isPizza) tags.push("Italian", "Cheesy");
    else tags.push("Popular", "Freshly Made");

    return {
      description: desc,
      tags: tags,
      allergens: isSweet || isPaneer || isPizza ? ["Dairy"] : ["Gluten-free option"],
      serves: "1-2 persons",
      bestFor: isSweet ? ["Dessert", "Snacks"] : ["Lunch", "Dinner"],
    };
  }
};

// 2. Smart Food Recommender
exports.recommendDishesWithAI = async ({ mood, diet, budget, craving, availableItems = [] }) => {
  const itemsSummary = availableItems.slice(0, 30).map((item) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    restaurant: item.restaurant?.name || "Restaurant",
  }));

  const prompt = `
You are Food Genie AI Recommender.
A customer is asking for food recommendations based on:
- Mood: ${mood || "any"}
- Diet: ${diet || "any"}
- Maximum Budget: ₹${budget || 500}
- Craving: ${craving || "tasty comfort food"}

Here is our menu list:
${JSON.stringify(itemsSummary)}

Select up to 4 best matching dishes within the budget.
Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "name": "Dish Name",
      "matchedReason": "Why this matches their mood and budget",
      "estimatedCalories": "Approx calories (e.g. 350 kcal)"
    }
  ],
  "genieMessage": "Friendly warm 1-sentence tip from Genie"
}
`;

  try {
    const rawContent = await queryGroqChat(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, response_format: { type: "json_object" } }
    );
    const parsed = JSON.parse(rawContent);
    return parsed;
  } catch (error) {
    // Intelligent matching fallback
    const maxB = Number(budget) || 500;
    const isVegReq = /veg/i.test(diet);

    const matches = availableItems
      .filter((it) => it.price <= maxB)
      .slice(0, 3)
      .map((it) => ({
        id: it._id,
        name: it.name,
        price: it.price,
        matchedReason: `Fits your ₹${maxB} budget and satisfies your ${craving || mood || "taste"} craving perfectly!`,
        estimatedCalories: "380 kcal",
      }));

    return {
      recommendations: matches.length > 0 ? matches : [
        {
          name: "Paneer Butter Masala",
          matchedReason: `Comforting rich gravy dish well within your ₹${maxB} budget.`,
          estimatedCalories: "420 kcal",
        },
        {
          name: "Veggie Delight Bowl",
          matchedReason: `Fresh, wholesome and tailored to your mood!`,
          estimatedCalories: "310 kcal",
        },
      ],
      genieMessage: `Genie selected these top picks matching your ${mood || "happy"} vibe and ₹${maxB} budget! ✨`,
    };
  }
};

// 3. Natural Language Search Parser
exports.parseNaturalLanguageSearch = async (query) => {
  const prompt = `
You are a search query parser for Food Genie food delivery app.
Convert the user's natural language request into structured search filters.
Query: "${query}"

Return ONLY valid JSON:
{
  "isVeg": boolean or null (true if user specifies veg/vegetarian, false if non-veg, null if not mentioned),
  "maxPrice": number or null (e.g. 200, 300, 500 if mentioned),
  "minRating": number or null (e.g. 4 if they say good rating or top rated),
  "keywords": "main food dish or cuisine keyword",
  "summary": "Short 1-line interpretation like 'Showing pure veg items under ₹300 with 4+ stars'"
}
`;

  try {
    const rawContent = await queryGroqChat(
      [{ role: "user", content: prompt }],
      { temperature: 0.2, response_format: { type: "json_object" } }
    );
    return JSON.parse(rawContent);
  } catch (error) {
    // Regex-based natural language parsing fallback
    const qLower = query.toLowerCase();
    const isVeg = /pure veg|vegetarian|\bveg\b/.test(qLower) ? true : (/non.?veg|chicken|mutton|fish/.test(qLower) ? false : null);
    
    // Extract price like "under 300", "below 200", "< 500", "200 rs"
    const priceMatch = qLower.match(/(?:under|below|less than|within|<=|<|\₹)\s*(\d+)/i) || qLower.match(/(\d+)\s*(?:rs|inr|rupees)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

    // Extract rating like "4 star", "good ratings", "top rated"
    const ratingMatch = qLower.match(/(\d(?:\.\d)?)\s*(?:star|stars|\+)/i);
    let minRating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
    if (!minRating && /top rated|good rating|best/.test(qLower)) minRating = 4.0;

    // Clean keywords
    const cleanedKeywords = query
      .replace(/show me|find|get|food|dishes|restaurants|under|below|with|rating|ratings|stars?|\₹|\d+/gi, "")
      .trim();

    return {
      isVeg,
      maxPrice,
      minRating,
      keywords: cleanedKeywords || "Food",
      summary: `Filtered by: ${isVeg === true ? "Pure Veg, " : ""}${maxPrice ? `Under ₹${maxPrice}, ` : ""}${minRating ? `${minRating}+ Stars` : "Best Matches"}`,
    };
  }
};
