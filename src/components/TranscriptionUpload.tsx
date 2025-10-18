import { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TranscriptionUploadProps {
  onUploadComplete: () => void;
}

export default function TranscriptionUpload({ onUploadComplete }: TranscriptionUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processUpload(file);
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    await processUpload(null, urlInput);
  };

  const processUpload = async (file: File | null, url?: string) => {
    setUploading(true);

    try {
      let fileUrl = url || null;
      const fileName = file?.name || new URL(url || '').pathname.split('/').pop() || 'audio';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('transcriptions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('transcriptions')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      const { data: transcription, error: insertError } = await supabase
        .from('transcriptions')
        .insert({
          user_id: user?.id,
          file_name: fileName,
          file_url: fileUrl,
          source_url: url || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-transcription`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription_id: transcription.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', errorData);
        throw new Error(`Failed to start transcription: ${errorData.error || 'Unknown error'}`);
      }

      onUploadComplete();
      setUrlInput('');
      const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-300">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Upload Media</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setUploadType('file')}
          className={`flex-1 py-4 px-5 rounded-xl font-bold text-lg transition-all ${
            uploadType === 'file'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-5 h-5 inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setUploadType('url')}
          className={`flex-1 py-4 px-5 rounded-xl font-bold text-lg transition-all ${
            uploadType === 'url'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="w-5 h-5 inline mr-2" />
          From URL
        </button>
      </div>

      {uploadType === 'file' ? (
        <div className="border-3 border-dashed border-gray-400 rounded-xl p-16 text-center hover:border-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <label className="cursor-pointer block">
            <span className="text-gray-900 text-xl font-semibold block mb-2">
              {uploading ? 'Uploading...' : 'Click to upload audio or video'}
            </span>
            <input
              type="file"
              className="hidden"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <p className="text-gray-600 text-base mt-2">MP3, WAV, MP4, MOV, and more</p>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={uploading}
          />
          <button
            onClick={handleUrlUpload}
            disabled={uploading || !urlInput.trim()}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5 mr-2" />
                Transcribe from URL
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
