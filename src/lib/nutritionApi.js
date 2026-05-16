const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function searchFoodNutrition(foodName, weightG) {
  const userPrompt =
    `Give me the nutritional information for ${weightG}g of ${foodName}. ` +
    `Respond ONLY with this JSON and nothing else: ` +
    `{"food_name":"matched food name","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}. ` +
    `All values must be for exactly ${weightG}g, rounded to 1 decimal place.`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 300,
      messages: [
        {
  role: "system",
  content:
    "You are a precise nutrition database. " +
    "Use USDA FoodData Central values as your primary reference. " +
    "For Indian foods, use standard ICMR/NIN (National Institute of Nutrition) values. " +
    "Always scale values linearly to the exact gram weight given. " +
    "Respond ONLY with valid JSON — no explanation, no markdown, no extra text.",
},
{
  role: "user",
  content:
    `Nutritional info for exactly ${weightG}g of ${foodName} (raw/uncooked unless specified). ` +
    `Use USDA or NIN reference values. ` +
    `Respond ONLY with this JSON: ` +
    `{"food_name":"canonical name","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number}. ` +
    `All values scaled to exactly ${weightG}g, rounded to 1 decimal.`,
},
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";

  // Strip markdown code fences if the model wraps the JSON
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let nutrition;
  try {
    nutrition = JSON.parse(jsonStr);
  } catch {
    throw new Error("Could not parse nutrition data. Try rephrasing the food name.");
  }

  return {
    food_name: nutrition.food_name || foodName,
    weight_g: Number(weightG),
    calories: Number(nutrition.calories) || 0,
    protein_g: Number(nutrition.protein_g) || 0,
    carbs_g: Number(nutrition.carbs_g) || 0,
    fat_g: Number(nutrition.fat_g) || 0,
    raw_api_data: data,
  };
}
