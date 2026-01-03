
import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Activity, Pause, Play, Layers } from 'lucide-react';
import AudioInput from './components/AudioInput';
import AnalysisView from './components/AnalysisView';
import Visualizer from './components/Visualizer';
import { AnalysisResult, AudioState } from './types';
import { analyzeAudioContent, analyzeTextDescription } from './services/geminiService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [audioState, setAudioState] = useState<AudioState | null>(null);
  const [textInput, setTextInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[lang];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioReady = (state: AudioState) => {
    setAudioState(state);
    setTextInput('');
    setAnalysis(null);
    setError(null);
  };

  const handleClearAudio = () => {
    setAudioState(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioState?.url) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleAnalyze = async () => {
    if (!audioState && !textInput.trim()) {
      setError(t.error_input);
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      let result: AnalysisResult;
      if (audioState && audioState.base64) {
         const mimeType = audioState.file?.type || 'audio/mp3';
         result = await analyzeAudioContent(audioState.base64, mimeType, lang);
      } else {
         result = await analyzeTextDescription(textInput, lang);
      }
      setAnalysis(result);
      window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });
    } catch (err) {
      setError(t.error_engine);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', onEnded);
      return () => audio.removeEventListener('ended', onEnded);
    }
  }, [audioState]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <audio ref={audioRef} src={audioState?.url || undefined} />

      {/* Modern Top Nav */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-gradient-to-tr from-indigo-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10 group-hover:rotate-12 transition-transform duration-500">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-white">
                {t.title.split('LYTICS')[0]}<span className="text-indigo-500">LYTICS</span>
              </span>
              <div className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase -mt-1">{t.subtitle}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
                <a href="#" className="hover:text-indigo-400 transition-colors">{t.nav_docs}</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">{t.nav_api}</a>
             </div>

             {/* Language Switcher */}
             <div className="flex items-center bg-slate-900 rounded-full p-1 border border-white/5">
                <button 
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('th')}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'th' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  TH
                </button>
             </div>

             {process.env.API_KEY && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">G3 ONLINE</span>
                </div>
             )}
          </div>
        </div>
      </nav>

      {/* Main Signal Input */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {!analysis && !isAnalyzing && (
          <div className="text-center mb-16 space-y-6 animate-fadeIn">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
              {t.hero_title_1} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-cyan-400 uppercase">{t.hero_title_2}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              {t.hero_desc}
            </p>
          </div>
        )}

        <div className={`transition-all duration-700 ${analysis ? 'mb-12' : 'mb-24'}`}>
          <div className="max-w-4xl mx-auto glass border border-white/5 rounded-[40px] p-10 shadow-3xl">
            
            <AudioInput 
              onAudioReady={handleAudioReady} 
              onClear={handleClearAudio}
              isAnalyzing={isAnalyzing}
              lang={lang}
            />

            <div className="flex items-center gap-6 my-10">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">{t.descriptor_module}</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <div className="relative group">
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (e.target.value) handleClearAudio();
                }}
                disabled={isAnalyzing || !!audioState}
                placeholder={t.placeholder_text}
                className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-white placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none h-36 font-medium transition-all group-hover:bg-slate-900/80 disabled:opacity-30"
              />
              <div className="absolute top-6 right-6">
                 <Layers className="w-5 h-5 text-slate-800" />
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
               {audioState && (
                 <div className="flex-1 w-full animate-fadeIn">
                    <div className="bg-slate-900/50 rounded-2xl p-4 flex items-center gap-6 border border-white/5">
                        <button 
                          onClick={togglePlay}
                          className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl shadow-white/5"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                        </button>
                        <div className="flex-1">
                           <Visualizer audioUrl={audioState.url} isPlaying={isPlaying} />
                        </div>
                    </div>
                 </div>
               )}
               
               <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!audioState && !textInput)}
                className={`
                  w-full md:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all
                  ${isAnalyzing || (!audioState && !textInput) 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    {t.btn_processing}
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    {t.btn_generate}
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-6 text-center text-red-400 text-xs font-black uppercase tracking-widest bg-red-950/20 py-3 rounded-2xl border border-red-900/30">
                {error}
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="animate-slideUp mt-12">
             <AnalysisView data={analysis} lang={lang} />
          </div>
        )}
      </main>
      
      <footer className="border-t border-white/5 py-12 mt-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                <Cpu className="w-5 h-5" />
                <span className="font-black tracking-widest text-xs uppercase">Soundlytics Neural Engine</span>
             </div>
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
               © {new Date().getFullYear()} {t.footer_rights}
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
