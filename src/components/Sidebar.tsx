import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Building2,
  Grid,
  ShieldCheck,
  BellRing,
  History,
  FileText,
  Settings,
  LogOut,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'devices'
  | 'employees'
  | 'teams'
  | 'applications'
  | 'policies'
  | 'alerts'
  | 'events'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedAlertsCount: number;
  onOpenEnrollment: () => void;
  onEnterKioskMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unresolvedAlertsCount,
  onOpenEnrollment,
  onEnterKioskMode
}) => {
  const { currentUser, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Dispositivos', icon: Smartphone },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'teams', label: 'Equipes & Filiais', icon: Building2 },
    { id: 'applications', label: 'Catálogo de Apps', icon: Grid },
    { id: 'policies', label: 'Políticas Corporativas', icon: ShieldCheck },
    { id: 'alerts', label: 'Alertas & Conformidade', icon: BellRing, badge: unresolvedAlertsCount },
    { id: 'events', label: 'Eventos & Auditoria', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#11141A] border-r border-slate-800/90 flex flex-col flex-shrink-0 h-screen sticky top-0 font-sans z-30 select-none">
      {/* Brand & Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-950/50 font-black text-xl">
          M
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">MULTIVALE</span>
          </div>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Mobile Control MDM</p>
        </div>
      </div>

      {/* Perfil Unificado do Gestor */}
      <div className="px-3 pt-3 pb-1">
        <div className="bg-[#161A22] rounded-xl p-2.5 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Painel de Controle</span>
              <span className="text-xs font-bold text-emerald-400">GESTOR MULTIVALE</span>
            </div>
          </div>
          <span className="text-[9px] font-mono bg-emerald-950/90 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
            Acesso Total
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Modo Colaborador (Kiosk) Action */}
        {onEnterKioskMode && (
          <div className="pt-2">
            <button
              onClick={onEnterKioskMode}
              className="w-full bg-gradient-to-r from-emerald-950/60 to-slate-900 hover:from-emerald-900/60 hover:to-slate-800 border border-emerald-800/60 hover:border-emerald-500/80 p-2.5 rounded-xl text-left transition group shadow-sm"
            >
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-white">Modo Colaborador</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Interface do celular de campo com apps e pastas liberadas da empresa.
              </p>
            </button>
          </div>
        )}

        {/* Android Enterprise Enrollment Action */}
        <div className="pt-1.5">
          <button
            onClick={onOpenEnrollment}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900/40 hover:to-indigo-900/40 border border-slate-700 hover:border-blue-500/60 p-2.5 rounded-xl text-left transition group shadow-sm"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <QrCode className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white">Provisionar Aparelho</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Instalação PWA ou QR Code Android Device Owner.
            </p>
          </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-[#0E1015]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/80 text-blue-300 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Administrador'}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
