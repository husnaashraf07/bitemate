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
    console.log('Generating health tips');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a wellness coach providing daily health tips. Create practical, actionable health tips in three categories: Water Intake, Exercise, and Mindful Eating.

Return the tips in this exact JSON structure:
{
  "tips": [
    {
      "category": "Water Intake",
      "tips": [
        "Drink at least 8 glasses of water daily",
        "Start your day with a glass of water",
        "Keep a water bottle with you at all times"
      ]
    },
    {
      "category": "Exercise",
      "tips": [
        "Take a 10-minute walk after meals",
        "Try 15 minutes of stretching in the morning",
        "Take the stairs instead of the elevator"
      ]
    },
    {
      "category": "Mindful Eating",
      "tips": [
        "Eat slowly and chew thoroughly",
        "Put away distractions during meals",
        "Listen to your body's hunger cues"
      ]
    }
  ]
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
          { role: 'user', content: 'Generate fresh, practical health tips for today' }
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

    const healthTipsData = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(healthTipsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-health-tips:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
