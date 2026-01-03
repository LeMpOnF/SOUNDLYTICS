
import React from 'react';
import { AnalysisResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Activity, Users, Globe, Zap, Cpu, Waves, Disc } from 'lucide-react';
import { translations, Language } from '../translations';

interface AnalysisViewProps {
  data: AnalysisResult;
  lang: Language;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, lang }) => {
  const t = translations[lang];
  const radarData = data.subGenres.map(sg => ({
    subject: sg.name,
    A: sg.matchPercentage,
    fullMark: 100,
  }));

  while (radarData.length < 3) {
    radarData.push({ subject: '...', A: 0, fullMark: 100 });
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Section: Primary ID */}
      <div className="glass rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-32 -mt-32 transition-all duration-700 group-hover:bg-indigo-500/20" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          <div className="lg:col-span-3 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-bold tracking-widest uppercase">
              <Zap className="w-3 h-3" /> {t.digital_id}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              {data.primaryGenre}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
              {data.description}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-fuchsia-600 opacity-20 transition-all duration-1000"
                  style={{ height: `${data.confidenceScore}%` }}
                />
                <span className="text-3xl font-black text-white relative z-10">{data.confidenceScore}%</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{t.confidence_rating}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Map */}
        <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col">
          <h3 className="text-sm font-black text-slate-500 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-indigo-400" /> {t.genre_mapping}
          </h3>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="DNA"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#radarGradient)"
                  fillOpacity={0.6}
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Terminal */}
        <div className="lg:col-span-2 glass rounded-3xl p-8 border border-white/5">
          <h3 className="text-sm font-black text-slate-500 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <Cpu className="w-4 h-4 text-emerald-400" /> {t.signal_metadata}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
              <span className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-tighter">{t.tempo}</span>
              <div className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{data.technicalDetails.bpmEstimate}</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 group hover:border-fuchsia-500/30 transition-colors">
              <span className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-tighter">{t.harmonic_key}</span>
              <div className="text-2xl font-black text-white group-hover:text-fuchsia-400 transition-colors">{data.technicalDetails.keyEstimate}</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
              <span className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-tighter">{t.structure}</span>
              <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{data.technicalDetails.timeSignature}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Waves className="w-3 h-3 text-cyan-400" /> {t.sonic_atmosphere}
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.moods.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-bold text-slate-300 border border-white/5">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Disc className="w-3 h-3 text-fuchsia-400" /> {t.layer_profile}
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.instrumentation.map((inst, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs font-bold text-slate-300 border border-white/5">
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border border-white/5">
          <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" /> {t.proximity_network}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.similarArtists.map((artist, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:bg-slate-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-white font-black text-xs group-hover:scale-110 transition-transform">
                  {artist.charAt(0)}
                </div>
                <span className="font-bold text-slate-300">{artist}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5">
          <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" /> {t.historical_origin}
          </h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            {data.culturalContext}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
