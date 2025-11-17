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
    const { noteId, content, title } = await req.json();
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
            content: 'You generate high-quality multiple-choice questions. Return valid JSON only.'
          },
          {
            role: 'user',
            content: `Generate 5 MCQs from this content. Return JSON array: [{"question":"...", "options":["..."], "answer_index":0, "explanation_short":"..."}]\n\n${content}`
          }
        ],
      }),
    });

    const data = await response.json();
    const questionsText = data.choices[0].message.content;
    const questions = JSON.parse(questionsText.replace(/```json\n?|\n?```/g, ''));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const { data: quiz, error } = await supabase.from('quizzes').insert({
      user_id: user!.id,
      note_id: noteId,
      title: `Quiz: ${title}`,
      questions,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ quizId: quiz.id }), {
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
