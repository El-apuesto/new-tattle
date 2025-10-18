import { useState, useEffect } from 'react';
import { FileAudio, Download, Users, MonitorDown, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import TranscriptionUpload from './components/TranscriptionUpload';
import TranscriptionList from './components/TranscriptionList';
import { Transcription } from './types';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTranscriptions();

      const channel = supabase
        .channel('transcriptions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transcriptions',
          },
          () => {
            fetchTranscriptions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTranscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMac = () => {
    alert('To enable downloads:\n\n1. Build the DMG file (see BUILD-INSTRUCTIONS.md)\n2. Upload the DMG to your server\n3. Update this button URL to point to your DMG file\n\nThe DMG will be a simple download that users can double-click and drag to Applications!');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="fixed inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <img
          src="/191B9F39-079C-4793-9A7D-B291F683F49B copy.PNG"
          alt="Tattletale Logo Background"
          className="object-contain"
          style={{ width: '110vw', height: '110vh', maxWidth: 'none', maxHeight: 'none' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="text-center mb-12">
          <p className="text-2xl text-gray-800 mb-6 font-semibold">AI-Powered Transcription with Speaker Detection</p>

          <div className="mt-6 mb-4">
            <button
              onClick={handleDownloadMac}
              className="inline-flex items-center gap-4 px-12 py-6 bg-gray-900 hover:bg-gray-800 text-white font-bold text-2xl rounded-2xl shadow-2xl transition-all transform hover:scale-105"
            >
              <MonitorDown className="w-8 h-8" />
              Download for Mac
              <span className="text-lg font-normal text-gray-300">(Universal)</span>
            </button>
            <p className="text-gray-700 text-base mt-4 font-medium">
              Double-click to install • Drag to Applications • Done!
            </p>
          </div>

          <div className="flex items-center justify-center gap-10 mt-6 text-lg text-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Speaker Diarization</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-6 h-6" />
              <span>Multiple Export Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <FileAudio className="w-6 h-6" />
              <span>Audio & Video Support</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <TranscriptionUpload onUploadComplete={fetchTranscriptions} />
          <TranscriptionList transcriptions={transcriptions} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
