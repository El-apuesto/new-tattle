import { useState } from 'react';
import { Download, FileText, FileCode } from 'lucide-react';
import { Transcription } from '../types';

interface ExportMenuProps {
  transcription: Transcription;
}

export default function ExportMenu({ transcription }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsTxt = () => {
    let content = '';

    if (transcription.speakers && transcription.speakers.length > 0) {
      content = transcription.speakers
        .map(speaker => `${speaker.label}:\n${speaker.text}\n`)
        .join('\n');
    } else {
      content = transcription.transcription_text || '';
    }

    downloadFile(content, `${transcription.file_name}.txt`, 'text/plain');
  };

  const exportAsSrt = () => {
    if (!transcription.speakers || transcription.speakers.length === 0) {
      alert('SRT export requires speaker timestamps');
      return;
    }

    let srtContent = '';
    transcription.speakers.forEach((speaker, index) => {
      const startTime = formatSrtTime(speaker.start_time || 0);
      const endTime = formatSrtTime(speaker.end_time || 0);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${speaker.text}\n\n`;
    });

    downloadFile(srtContent, `${transcription.file_name}.srt`, 'text/srt');
  };

  const exportAsVtt = () => {
    if (!transcription.speakers || transcription.speakers.length === 0) {
      alert('VTT export requires speaker timestamps');
      return;
    }

    let vttContent = 'WEBVTT\n\n';
    transcription.speakers.forEach((speaker, index) => {
      const startTime = formatVttTime(speaker.start_time || 0);
      const endTime = formatVttTime(speaker.end_time || 0);

      vttContent += `${index + 1}\n`;
      vttContent += `${startTime} --> ${endTime}\n`;
      vttContent += `<v ${speaker.label}>${speaker.text}\n\n`;
    });

    downloadFile(vttContent, `${transcription.file_name}.vtt`, 'text/vtt');
  };

  const exportAsJson = () => {
    const jsonContent = JSON.stringify({
      file_name: transcription.file_name,
      created_at: transcription.created_at,
      duration_seconds: transcription.duration_seconds,
      speakers: transcription.speakers || [],
      transcription_text: transcription.transcription_text,
    }, null, 2);

    downloadFile(jsonContent, `${transcription.file_name}.json`, 'application/json');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const formatSrtTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatVttTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        title="Export"
      >
        <Download className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 z-20">
            <button
              onClick={exportAsTxt}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export as TXT
            </button>
            <button
              onClick={exportAsSrt}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4" />
              Export as SRT
            </button>
            <button
              onClick={exportAsVtt}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4" />
              Export as VTT
            </button>
            <button
              onClick={exportAsJson}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
