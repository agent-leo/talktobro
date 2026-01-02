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
    const body = await req.json().catch(() => ({}));
    const voiceLogId: string | undefined = body.voiceLogId;
    const audioBase64: string | undefined = body.audio; // legacy payload

    if (!voiceLogId) {
      return new Response(JSON.stringify({ error: 'Missing voiceLogId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Backend not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Backend not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[process-voice-log] start voiceLogId=${voiceLogId}`);

    // Client that respects RLS for ownership check
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: logRow, error: logReadError } = await supabaseUser
      .from('voice_logs')
      .select('id, audio_url')
      .eq('id', voiceLogId)
      .single();

    if (logReadError || !logRow) {
      console.error('[process-voice-log] voice log not found or not accessible', logReadError);
      return new Response(JSON.stringify({ error: 'Voice log not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service client for storage download + DB update
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Prefer downloading from storage (avoids base64 body limits). Keep base64 fallback for legacy callers.
    let audioBytes: Uint8Array;
    let mimeType = 'application/octet-stream';
    let fileExt = 'webm';

    if (logRow.audio_url) {
      console.log(`[process-voice-log] downloading audio from storage path=${logRow.audio_url}`);
      const { data: audioBlob, error: dlError } = await supabaseService.storage
        .from('voice-recordings')
        .download(logRow.audio_url);

      if (dlError || !audioBlob) {
        console.error('[process-voice-log] storage download failed', dlError);
        return new Response(JSON.stringify({ error: 'Could not download audio file' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      mimeType = audioBlob.type || mimeType;
      if (mimeType.includes('mp4')) fileExt = 'mp4';
      else if (mimeType.includes('mpeg')) fileExt = 'mp3';
      else if (mimeType.includes('ogg')) fileExt = 'ogg';
      else if (mimeType.includes('wav')) fileExt = 'wav';
      else if (mimeType.includes('webm')) fileExt = 'webm';

      const buf = await audioBlob.arrayBuffer();
      audioBytes = new Uint8Array(buf);
      console.log(`[process-voice-log] downloaded bytes=${audioBytes.length} mime=${mimeType}`);
    } else if (audioBase64) {
      console.log('[process-voice-log] no audio_url found; falling back to base64 payload');
      audioBytes = processBase64Chunks(audioBase64);
      mimeType = 'audio/webm';
      fileExt = 'webm';
    } else {
      return new Response(JSON.stringify({ error: 'Missing audio (no audio_url and no audio payload)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare form data for Whisper
    const formData = new FormData();
    const audioArrayBuffer = audioBytes.buffer.slice(
      audioBytes.byteOffset,
      audioBytes.byteOffset + audioBytes.byteLength,
    );
    const audioBlob = new Blob([audioArrayBuffer], { type: mimeType });
    formData.append('file', audioBlob, `audio.${fileExt}`);
    formData.append('model', 'whisper-1');

    console.log('[process-voice-log] sending to Whisper...');

    const transcriptResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('[process-voice-log] Whisper API error:', errorText);
      return new Response(JSON.stringify({ error: `Whisper API error: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transcriptData = await transcriptResponse.json();
    const transcript: string = transcriptData.text;

    console.log('[process-voice-log] transcription complete; generating reflection...');

    const reflectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
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

Tone: Calm older brother. Short sentences. Non-judgmental. No emojis.`,
          },
          { role: 'user', content: transcript },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!reflectionResponse.ok) {
      const errorText = await reflectionResponse.text();
      console.error('[process-voice-log] GPT API error:', errorText);
      return new Response(JSON.stringify({ error: `GPT API error: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reflectionData = await reflectionResponse.json();
    const reflection: string = reflectionData.choices?.[0]?.message?.content ?? '';

    console.log('[process-voice-log] updating database...');

    const { error: updateError } = await supabaseService
      .from('voice_logs')
      .update({
        transcript,
        reflection_summary: reflection,
      })
      .eq('id', voiceLogId);

    if (updateError) {
      console.error('[process-voice-log] database update error:', updateError);
      return new Response(JSON.stringify({ error: 'Database update failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[process-voice-log] success');

    return new Response(JSON.stringify({ transcript, reflection, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[process-voice-log] unhandled error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
