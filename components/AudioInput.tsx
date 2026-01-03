
import React, { useCallback, useState, useRef } from 'react';
import { Upload, Mic, Square, Music, X, AlertCircle } from 'lucide-react';
import { AudioState } from '../types';
import { translations, Language } from '../translations';

interface AudioInputProps {
  onAudioReady: (audioState: AudioState) => void;
  onClear: () => void;
  isAnalyzing: boolean;
  lang: Language;
}

const AudioInput: React.FC<AudioInputProps> = ({ onAudioReady, onClear, isAnalyzing, lang }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const t = translations[lang];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError(lang === 'th' ? 'รูปแบบไฟล์ไม่ถูกต้อง Soundlytics ต้องการไฟล์เสียงมาตรฐาน' : 'Invalid format. Soundlytics requires standard audio containers.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) { 
      setError(lang === 'th' ? 'ขนาดไฟล์ใหญ่เกินไป จำกัดที่ 20MB' : 'Signal payload too large. Max limit: 20MB.');
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const url = URL.createObjectURL(file);
      onAudioReady({ file, url, base64, isRecording: false });
    };
    reader.readAsDataURL(file);
  }, [onAudioReady, lang]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], "live_signal.webm", { type: 'audio/webm' });
        processFile(file);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError(lang === 'th' ? 'ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการอนุญาต' : 'Sensor access denied. Check system microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {fileName ? (
        <div className="glass border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between animate-fadeIn group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold truncate max-w-[240px]">{fileName}</p>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{t.signal_locked}</p>
            </div>
          </div>
          <button 
            onClick={() => { setFileName(null); onClear(); }}
            className="p-2.5 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all disabled:opacity-50"
            disabled={isAnalyzing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`
              relative flex flex-col items-center justify-center p-10 border border-dashed rounded-3xl transition-all duration-500 cursor-pointer group
              ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/5'}
            `}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files[0] && processFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input id="file-upload" type="file" className="hidden" accept="audio/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-white font-bold">{t.import_audio}</p>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">{t.drag_browse}</p>
          </div>

          <div 
            className={`
              flex flex-col items-center justify-center p-10 border rounded-3xl transition-all duration-500
              ${isRecording ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-fuchsia-500/30 hover:bg-white/5'}
            `}
          >
            {isRecording ? (
              <button onClick={stopRecording} className="flex flex-col items-center w-full">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 text-red-500 border border-red-500/20 animate-pulse">
                  <Square className="w-7 h-7" />
                </div>
                <p className="text-red-400 font-bold">{t.capturing}</p>
                <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-red-500/40 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}} />)}
                </div>
              </button>
            ) : (
              <button onClick={startRecording} className="flex flex-col items-center w-full group">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:bg-slate-800 transition-colors duration-500">
                  <Mic className="w-7 h-7 text-fuchsia-400" />
                </div>
                <p className="text-white font-bold">{t.live_sensor}</p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">{t.use_mic}</p>
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AudioInput;
