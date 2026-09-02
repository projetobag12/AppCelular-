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
import { UserRole } from '../types';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unresolvedAlertsCount,
  onOpenEnrollment
}) => {
  const { currentUser, role, logout, switchDemoRole } = useAuth();

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

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'ADMINISTRADOR':
        return 'bg-blue-950 text-blue-400 border-blue-800/80';
      case 'GESTOR':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/80';
      case 'VISUALIZACAO':
        return 'bg-amber-950 text-amber-400 border-amber-800/80';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

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

      {/* Role Switcher */}
      <div className="px-3 pt-3 pb-1">
        <div className="bg-[#161A22] rounded-xl p-2.5 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nível de Acesso</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(role)}`}>
              {role}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => switchDemoRole('ADMINISTRADOR')}
              className={`px-1 py-1 rounded text-[10px] font-bold transition text-center ${
                role === 'ADMINISTRADOR'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
              title="Acesso completo a todas as funções"
            >
              Admin
            </button>
            <button
              onClick={() => switchDemoRole('GESTOR')}
              className={`px-1 py-1 rounded text-[10px] font-bold transition text-center ${
                role === 'GESTOR'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
              title="Gerenciar dispositivos e relatórios"
            >
              Gestor
            </button>
            <button
              onClick={() => switchDemoRole('VISUALIZACAO')}
              className={`px-1 py-1 rounded text-[10px] font-bold transition text-center ${
                role === 'VISUALIZACAO'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
              title="Somente leitura"
            >
              Leitura
            </button>
          </div>
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

        {/* Android Enterprise Enrollment Action */}
        <div className="pt-2">
          <button
            onClick={onOpenEnrollment}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-blue-900/40 hover:to-indigo-900/40 border border-slate-700 hover:border-blue-500/60 p-2.5 rounded-xl text-left transition group shadow-sm"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <QrCode className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white">Provisionar Aparelho (DPC)</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              QR Code e token oficial para Android Enterprise Device Owner.
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
