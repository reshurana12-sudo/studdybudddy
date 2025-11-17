import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { noteId, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Create concise Q/A flashcards. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `Generate 8 flashcards. Return JSON: [{"front":"question", "back":"answer"}]\n\n${content}`
          }
        ],
      }),
    });

    const data = await response.json();
    const flashcardsText = data.choices[0].message.content;
    const flashcardsData = JSON.parse(flashcardsText.replace(/```json\n?|\n?```/g, ''));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const flashcards = flashcardsData.map((card: any) => ({
      user_id: user!.id,
      note_id: noteId,
      front: card.front,
      back: card.back,
    }));

    const { error } = await supabase.from('flashcards').insert(flashcards);
    if (error) throw error;

    return new Response(JSON.stringify({ count: flashcards.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
