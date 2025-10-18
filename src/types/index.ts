export interface Speaker {
  speaker_id: string;
  label: string;
  text: string;
  start_time?: number;
  end_time?: number;
}

export interface Transcription {
  id: string;
  user_id: string | null;
  file_name: string;
  file_url: string | null;
  source_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_text: string | null;
  speakers: Speaker[] | null;
  error_message: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}
