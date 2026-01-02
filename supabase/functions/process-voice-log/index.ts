import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, voiceLogId } = await req.json();
    
    if (!audio || !voiceLogId) {
      throw new Error('Missing audio data or voiceLogId');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing voice log: ${voiceLogId}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data for Whisper
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log('Sending to Whisper for transcription...');

    // Transcribe with Whisper
    const transcriptResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    const transcript = transcriptData.text;

    console.log('Transcription complete. Generating reflection...');

    // Generate reflection with constrained prompt
    const reflectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a calm, neutral reflection assistant. Your role is to mirror back what someone has said to help them pause and think.

STRICT RULES - You must follow these exactly:
1. Summarize their stated intent in 1-2 sentences
2. Reflect the emotional tone you heard (without judgment)
3. If they used urgent or emotional language, gently highlight it
4. End with ONE grounding question to help them pause

YOU MUST NOT:
- Give advice
- Make suggestions about what to do
- Encourage or discourage any action
- Use phrases like "you should", "consider", "maybe try"
- Make predictions about outcomes
- Validate or invalidate their feelings

Tone: Calm older brother. Short sentences. Non-judgmental. No emojis.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!reflectionResponse.ok) {
      const errorText = await reflectionResponse.text();
      console.error('GPT API error:', errorText);
      throw new Error(`GPT API error: ${errorText}`);
    }

    const reflectionData = await reflectionResponse.json();
    const reflection = reflectionData.choices[0].message.content;

    console.log('Reflection generated. Updating database...');

    // Update the voice log with transcript and reflection
    const { error: updateError } = await supabase
      .from('voice_logs')
      .update({
        transcript: transcript,
        reflection_summary: reflection
      })
      .eq('id', voiceLogId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Voice log processed successfully');

    return new Response(
      JSON.stringify({ 
        transcript,
        reflection,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing voice log:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
