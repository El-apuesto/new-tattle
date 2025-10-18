import { Loader2, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { Transcription } from '../types';
import ExportMenu from './ExportMenu';

interface TranscriptionListProps {
  transcriptions: Transcription[];
  loading: boolean;
}

export default function TranscriptionList({ transcriptions, loading }: TranscriptionListProps) {
  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-300 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-300">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Transcriptions</h2>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {transcriptions.length === 0 ? (
          <div className="text-center py-16 text-gray-700">
            <p className="text-xl font-semibold">No transcriptions yet</p>
            <p className="text-base mt-2 text-gray-600">Upload a file to get started</p>
          </div>
        ) : (
          transcriptions.map((transcription) => (
            <TranscriptionCard key={transcription.id} transcription={transcription} />
          ))
        )}
      </div>
    </div>
  );
}

function TranscriptionCard({ transcription }: { transcription: Transcription }) {
  const getStatusIcon = () => {
    switch (transcription.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusText = () => {
    switch (transcription.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing...';
      default:
        return 'Pending';
    }
  };

  const speakerCount = transcription.speakers?.length || 0;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-300 hover:border-gray-400 transition-all hover:bg-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{transcription.file_name}</h3>
          <div className="flex items-center gap-4 text-base text-gray-700">
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
            {speakerCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{speakerCount} {speakerCount === 1 ? 'Speaker' : 'Speakers'}</span>
              </div>
            )}
            {transcription.duration_seconds && (
              <span>{Math.floor(transcription.duration_seconds / 60)}m {transcription.duration_seconds % 60}s</span>
            )}
          </div>
        </div>
        {transcription.status === 'completed' && (
          <ExportMenu transcription={transcription} />
        )}
      </div>

      {transcription.status === 'completed' && transcription.speakers && transcription.speakers.length > 0 ? (
        <div className="space-y-3 mt-4">
          {transcription.speakers.map((speaker, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-700">{speaker.label}</span>
                {speaker.start_time !== undefined && (
                  <span className="text-xs text-gray-500">
                    [{formatTime(speaker.start_time)} - {formatTime(speaker.end_time || 0)}]
                  </span>
                )}
              </div>
              <p className="text-gray-900 leading-relaxed">{speaker.text}</p>
            </div>
          ))}
        </div>
      ) : transcription.status === 'completed' && transcription.transcription_text ? (
        <p className="text-gray-800 leading-relaxed mt-4 bg-white p-4 rounded-lg">
          {transcription.transcription_text}
        </p>
      ) : transcription.status === 'failed' ? (
        <p className="text-red-400 text-sm mt-2">{transcription.error_message}</p>
      ) : null}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
