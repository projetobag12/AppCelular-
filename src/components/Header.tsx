import React from 'react';
import {
  Shield,
  Smartphone,
  Sliders,
  Columns,
  Sparkles,
  Lock,
  Building2,
  FileCheck,
  AlertCircle,
  Download,
  Cloud
} from 'lucide-react';
import { CompanySettings, CorporateDevice, SecurityPolicy } from '../types';

interface HeaderProps {
  currentView: 'kiosk' | 'admin' | 'split';
  onChangeView: (view: 'kiosk' | 'admin' | 'split') => void;
  companySettings: CompanySettings;
  activeDevice: CorporateDevice;
  policy: SecurityPolicy;
  unresolvedIncidentsCount: number;
  onOpenDownloadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  companySettings,
  activeDevice,
  policy,
  unresolvedIncidentsCount,
  onOpenDownloadModal,
}) => {
  return (
    <header className="bg-[#12141A] border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Organization */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">SECURE<span className="text-blue-500">MDM</span></h1>
                <span className="bg-blue-950/60 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-800/60">
                  Enterprise Kiosk
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500" />
                {companySettings.companyName}
              </p>
            </div>
          </div>

          {/* Mobile Badge */}
          <div className="sm:hidden flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/60">
            <Lock className="w-3 h-3 text-emerald-500" /> Kiosk Ativo
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#16191E] p-1 rounded-lg border border-slate-800 text-xs font-semibold w-full sm:w-auto justify-center">
          <button
            onClick={() => onChangeView('kiosk')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${
              currentView === 'kiosk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Celular Bloqueado</span>
          </button>

          <button
            onClick={() => onChangeView('split')}
            className={`hidden md:flex px-3.5 py-1.5 rounded-md items-center justify-center gap-1.5 transition ${
              currentView === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>⚡ Dividida (Side-by-Side)</span>
          </button>

          <button
            onClick={() => onChangeView('admin')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition relative ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>💻 Painel Admin MDM</span>
            {unresolvedIncidentsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1"></span>
            )}
          </button>
        </div>

        {/* Live Status Indicators & Download/Hosting Action */}
        <div className="flex items-center gap-2 text-xs">
          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md shadow-blue-900/30 text-xs animate-pulse hover:animate-none"
              title="Obter link na nuvem, baixar como PWA/APK ou hospedar grátis"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🚀 Hospedar & Baixar Grátis</span>
              <span className="sm:hidden">🚀 Baixar App</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1.5 text-slate-300 bg-[#16191E] px-3 py-1.5 rounded-md border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Modo Kiosk: <strong className="text-white">Multi-App</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-300 bg-[#16191E] px-3 py-1.5 rounded-md border border-slate-800">
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-blue-300">{policy.version}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
