import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  QrCode,
  EyeOff,
  Building,
  Lock
} from 'lucide-react';
import { CompanyInfo } from '../types';

interface HeaderProps {
  companyInfo: CompanyInfo;
  onOpenEnrollmentModal: () => void;
  onNavigateToDevices?: () => void;
  onEnterKioskMode?: () => void;
  onLockGestor?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  companyInfo,
  onOpenEnrollmentModal,
  onNavigateToDevices,
  onEnterKioskMode,
  onLockGestor
}) => {
  return (
    <header className="bg-[#11141A] border-b border-slate-800/90 sticky top-0 z-20 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 font-sans">
      {/* Left: Organization & Security Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-tight">{companyInfo.name}</span>
          <span className="hidden md:inline-block bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
            CNPJ: {companyInfo.cnpj}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cloud Firestore Ativo</span>
        </div>
      </div>

      {/* Privacy Notice Badge */}
      <div className="hidden xl:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] px-3 py-1 rounded-lg">
        <EyeOff className="w-3.5 h-3.5 text-blue-400" />
        <span>Gestão Corporativa Estrita (Sem invasão de privacidade de conversas ou fotos pessoais)</span>
      </div>

      {/* Right Actions: Kiosk Mode & Enrollment QR */}
      <div className="flex items-center gap-2">
        {onEnterKioskMode && (
          <button
            onClick={onEnterKioskMode}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Abrir a tela do celular travado com aplicativos e pastas liberadas"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Ver Modo Celular (Colaborador)</span>
          </button>
        )}

        <button
          onClick={onOpenEnrollmentModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-900/30"
          title="Ver Token e QR Code de Provisionamento Android Device Owner"
        >
          <QrCode className="w-4 h-4" />
          <span>Provisionar e Instalar</span>
        </button>

        {onLockGestor && (
          <button
            onClick={onLockGestor}
            className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Bloquear painel e voltar ao Modo Celular do Colaborador"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Bloquear Gestão</span>
          </button>
        )}
      </div>
    </header>
  );
};
