import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, age, weight, height, gender, fitnessGoal, foodPreference, allergies } = await req.json();
    
    console.log('Generating meal plan for:', { name, age, weight, height, gender, fitnessGoal, foodPreference });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate BMR and daily calorie needs
    let bmr;
    if (gender === 'male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }

    let calorieTarget = bmr * 1.55; // Moderate activity level
    if (fitnessGoal === 'lose-weight') {
      calorieTarget *= 0.85; // 15% deficit
    } else if (fitnessGoal === 'gain-muscle') {
      calorieTarget *= 1.15; // 15% surplus
    }

    const systemPrompt = `You are a professional nutritionist creating personalized meal plans. Create a detailed daily meal plan with realistic portions and accurate nutritional information.

Guidelines:
- Total daily calories should be around ${Math.round(calorieTarget)} calories
- Food preference: ${foodPreference}
${allergies ? `- Avoid these allergens: ${allergies}` : ''}
- Fitness goal: ${fitnessGoal}
- Provide specific meal names, not just generic descriptions
- Include realistic ingredient lists
- Calculate accurate nutritional values

Return the meal plan in this exact JSON structure:
{
  "breakfast": {
    "name": "Meal name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "nutrition": {"calories": 400, "protein": 20, "carbs": 45, "fats": 15}
  },
  "lunch": {
    "name": "Meal name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "nutrition": {"calories": 500, "protein": 30, "carbs": 50, "fats": 18}
  },
  "snacks": {
    "name": "Snack name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "nutrition": {"calories": 200, "protein": 10, "carbs": 25, "fats": 8}
  },
  "dinner": {
    "name": "Meal name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "nutrition": {"calories": 500, "protein": 35, "carbs": 45, "fats": 20}
  },
  "totalNutrition": {
    "calories": 1600,
    "protein": 95,
    "carbs": 165,
    "fats": 61
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Create a personalized meal plan for ${name}, a ${age}-year-old ${gender} who weighs ${weight}kg and is ${height}cm tall. Goal: ${fitnessGoal}. Food preference: ${foodPreference}.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    const mealPlan = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ mealPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-meal-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
