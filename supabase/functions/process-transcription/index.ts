import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranscriptionRequest {
  transcription_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transcription_id }: TranscriptionRequest = await req.json();

    if (!transcription_id) {
      return new Response(
        JSON.stringify({ error: "transcription_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const hfToken = Deno.env.get("HUGGINGFACE_TOKEN");

    const updateStatus = async (status: string, updates: any = {}) => {
      await fetch(`${supabaseUrl}/rest/v1/transcriptions?id=eq.${transcription_id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString(),
          ...updates,
        }),
      });
    };

    await updateStatus("processing");

    const transcriptionRes = await fetch(
      `${supabaseUrl}/rest/v1/transcriptions?id=eq.${transcription_id}&select=*`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transcriptions = await transcriptionRes.json();
    if (!transcriptions || transcriptions.length === 0) {
      throw new Error("Transcription not found");
    }

    const transcription = transcriptions[0];
    const audioUrl = transcription.file_url || transcription.source_url;

    if (!audioUrl) {
      throw new Error("No audio URL found");
    }

    if (!hfToken) {
      await updateStatus("completed", {
        transcription_text: "Demo: This is a placeholder transcription. The audio file has been uploaded successfully. Add your Hugging Face API token to enable real transcription with speaker detection using Whisper and pyannote.",
        speakers: [
          {
            speaker_id: "A",
            label: "Speaker A",
            text: "This is a demo transcription. To enable real AI-powered transcription with speaker detection, add your Hugging Face API token to the Supabase environment variables.",
            start_time: 0,
            end_time: 5,
          },
        ],
        duration_seconds: 5,
      });

      return new Response(
        JSON.stringify({ success: true, demo: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.arrayBuffer();

    const whisperResponse = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-base",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      }
    );

    const whisperResult = await whisperResponse.json();

    if (whisperResult.error) {
      if (whisperResult.error.includes("loading")) {
        await updateStatus("processing", {
          error_message: "Model is loading, please wait and try again in a moment...",
        });
        
        await new Promise((resolve) => setTimeout(resolve, 20000));
        
        const retryResponse = await fetch(
          "https://api-inference.huggingface.co/models/openai/whisper-base",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hfToken}`,
              "Content-Type": "application/octet-stream",
            },
            body: audioBlob,
          }
        );
        const retryResult = await retryResponse.json();
        if (retryResult.error) {
          throw new Error(retryResult.error);
        }
        whisperResult.text = retryResult.text;
      } else {
        throw new Error(whisperResult.error);
      }
    }

    const transcriptionText = whisperResult.text;

    const diarizationResponse = await fetch(
      "https://api-inference.huggingface.co/models/pyannote/speaker-diarization-3.1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      }
    );

    let speakers = null;
    const diarizationResult = await diarizationResponse.json();

    if (diarizationResult.error) {
      console.log("Diarization not available:", diarizationResult.error);
    } else if (Array.isArray(diarizationResult) && diarizationResult.length > 0) {
      const speakerSegments = new Map();

      for (const segment of diarizationResult) {
        const speaker = segment.label || segment.speaker || "SPEAKER_00";
        if (!speakerSegments.has(speaker)) {
          speakerSegments.set(speaker, []);
        }
        speakerSegments.get(speaker).push({
          start_time: segment.start || 0,
          end_time: segment.end || 0,
        });
      }

      const words = transcriptionText.split(" ");
      const wordsPerSpeaker = Math.ceil(words.length / speakerSegments.size);

      speakers = Array.from(speakerSegments.entries()).map(([speaker, segments], idx) => {
        const startIdx = idx * wordsPerSpeaker;
        const endIdx = Math.min(startIdx + wordsPerSpeaker, words.length);
        const text = words.slice(startIdx, endIdx).join(" ");
        
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        return {
          speaker_id: speaker,
          label: `Speaker ${speaker.replace('SPEAKER_', '')}`,
          text: text,
          start_time: firstSegment.start_time,
          end_time: lastSegment.end_time,
        };
      });
    }

    const audioDuration = audioBlob.byteLength / (16000 * 2);

    await updateStatus("completed", {
      transcription_text: transcriptionText,
      speakers: speakers,
      duration_seconds: Math.floor(audioDuration),
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing transcription:", error);

    try {
      const bodyText = await req.text();
      const body = JSON.parse(bodyText);
      const transcription_id = body.transcription_id;
      
      if (transcription_id) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        await fetch(`${supabaseUrl}/rest/v1/transcriptions?id=eq.${transcription_id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            status: "failed",
            error_message: error.message,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    } catch (e) {
      console.error("Error updating transcription status:", e);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});