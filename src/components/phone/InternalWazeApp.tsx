import React, { useState } from 'react';
import {
  Navigation,
  AlertTriangle,
  Volume2,
  VolumeX,
  Search,
  Gauge,
  Radio,
  Clock,
  ShieldAlert,
  Flame,
  Camera,
  Car,
  CheckCircle
} from 'lucide-react';

interface WazeAlert {
  id: string;
  type: 'radar' | 'transito' | 'acidente' | 'policia';
  title: string;
  distance: string;
  severity: 'low' | 'medium' | 'high';
}

const SAMPLE_ALERTS: WazeAlert[] = [
  {
    id: 'a1',
    type: 'radar',
    title: 'Radar Fixo 60 km/h à frente',
    distance: '350 metros',
    severity: 'medium',
  },
  {
    id: 'a2',
    type: 'transito',
    title: 'Trânsito moderado (+4 min)',
    distance: '1.2 km à frente',
    severity: 'low',
  },
  {
    id: 'a3',
    type: 'acidente',
    title: 'Acidente na faixa da esquerda',
    distance: '3.8 km',
    severity: 'high',
  },
];

export const InternalWazeApp: React.FC = () => {
  const [speed, setSpeed] = useState(54);
  const [isMuted, setIsMuted] = useState(false);
  const [activeReportSent, setActiveReportSent] = useState(false);
  const [alerts, setAlerts] = useState<WazeAlert[]>(SAMPLE_ALERTS);

  const handleSendReport = (type: string) => {
    setActiveReportSent(true);
    setTimeout(() => setActiveReportSent(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top Waze Navigation Strip */}
      <div className="bg-[#16191E] border-b border-slate-800 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Waze GPS & Trânsito
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/60 font-mono">
                Ao Vivo
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-[#12141A] hover:bg-[#1A1D23] text-slate-300 border border-slate-800"
            title={isMuted ? 'Ativar Voz' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Main Waze Map Area */}
      <div className="relative flex-1 bg-[#10141D] overflow-hidden flex flex-col justify-between p-3">
        {/* Animated Map Road Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>

        {/* Dynamic Road Curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700 fill-none">
          <path d="M 190 400 L 190 50" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
          <path d="M 190 400 L 190 50" stroke="#0284c7" strokeWidth="8" strokeDasharray="12 6" className="animate-pulse" />
        </svg>

        {/* Top Next Turn Banner */}
        <div className="relative z-10 bg-cyan-950/95 border border-cyan-600 rounded-xl p-3 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 rotate-90" />
            </div>
            <div>
              <p className="text-[10px] text-cyan-300 font-semibold uppercase">Em 250 metros</p>
              <h4 className="text-xs font-bold truncate max-w-[190px]">Acesse a pista expressa (Av. 23 de Maio)</h4>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-cyan-900/80 px-2 py-1 rounded">18 min</span>
        </div>

        {/* Center Vehicle & Speedometer */}
        <div className="relative z-10 my-auto flex items-center justify-between px-2">
          {/* Speedometer Widget */}
          <div className="bg-[#16191E]/95 backdrop-blur-md border border-slate-700 rounded-2xl p-2.5 text-center shadow-2xl flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Velocidade</span>
            <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight leading-none my-1">
              {speed}
            </span>
            <span className="text-[9px] text-slate-400">km/h</span>
            <div className="mt-1.5 px-1.5 py-0.5 rounded-full bg-red-950/80 border border-red-600/80 text-[8px] font-bold text-red-300">
              LIM: 60
            </div>
          </div>

          {/* Car Icon on Road */}
          <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
            <Car className="w-5 h-5" />
          </div>

          {/* Radar Alert Floating */}
          <div className="bg-[#16191E]/95 backdrop-blur-md border border-amber-600/80 rounded-xl p-2 max-w-[120px] text-left shadow-xl animate-pulse">
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
              <Camera className="w-3 h-3" /> Radar
            </div>
            <p className="text-[9px] text-slate-300 mt-0.5">Fixo 60 km/h a 350m</p>
          </div>
        </div>

        {/* Report Success Toast */}
        {activeReportSent && (
          <div className="relative z-20 bg-emerald-950 border border-emerald-500 rounded-xl p-2 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Ocorrência reportada com sucesso no Waze!
          </div>
        )}

        {/* Bottom Bar: Quick Reports (Radar, Trânsito, Perigo) */}
        <div className="relative z-10 bg-[#16191E]/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Reportar no Trânsito:</span>
            <span className="text-cyan-400 font-mono">Rota: 12.4 km restantes</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSendReport('radar')}
              className="bg-[#12141A] hover:bg-amber-950/50 border border-slate-700 hover:border-amber-600 p-2 rounded-lg text-center transition"
            >
              <Camera className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-200 block">Radar</span>
            </button>

            <button
              onClick={() => handleSendReport('transito')}
              className="bg-[#12141A] hover:bg-red-950/50 border border-slate-700 hover:border-red-600 p-2 rounded-lg text-center transition"
            >
              <Flame className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-200 block">Trânsito</span>
            </button>

            <button
              onClick={() => handleSendReport('perigo')}
              className="bg-[#12141A] hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-600 p-2 rounded-lg text-center transition"
            >
              <AlertTriangle className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-200 block">Perigo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
