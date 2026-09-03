import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  WifiOff,
  AlertTriangle,
  Users,
  Grid,
  ShieldCheck,
  BellRing,
  History,
  ArrowUpRight,
  Building2,
  Clock,
  ShieldAlert,
  Plus,
  QrCode,
  Layers,
  Lock
} from 'lucide-react';
import {
  Device,
  Employee,
  Team,
  Application,
  Policy,
  Alert,
  AuditEvent
} from '../types';

interface DashboardViewProps {
  devices: Device[];
  employees: Employee[];
  teams: Team[];
  applications: Application[];
  policies: Policy[];
  alerts: Alert[];
  events: AuditEvent[];
  onNavigate: (tab: any) => void;
  onSelectDevice: (device: Device) => void;
  onOpenEnrollmentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  devices,
  employees,
  teams,
  applications,
  policies,
  alerts,
  events,
  onNavigate,
  onSelectDevice,
  onOpenEnrollmentModal
}) => {
  // Cálculos de Métricas
  const totalDevices = (devices || []).length;
  const activeDevices = (devices || []).filter((d) => d && d.status === 'ATIVO').length;
  const managedDevices = (devices || []).filter((d) => d && d.managementMode === 'DEVICE_OWNER').length;
  const pendingDevices = (devices || []).filter((d) => d && (d.status === 'PENDENTE' || d.managementMode === 'UNMANAGED')).length;
  const offlineDevices = (devices || []).filter((d) => d && d.status === 'OFFLINE').length;
  const lockedDevices = (devices || []).filter((d) => d && d.status === 'BLOQUEADO').length;

  const totalEmployees = (employees || []).length;
  const authorizedAppsCount = (applications || []).filter((a) => a && a.status === 'AUTORIZADO').length;
  const blockedAppsCount = (applications || []).filter((a) => a && a.status === 'BLOQUEADO').length;
  const activePoliciesCount = (policies || []).filter((p) => p && p.status === 'ATIVO').length;
  const unresolvedAlerts = (alerts || []).filter((a) => a && !a.resolved);

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ATIVO
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            OFFLINE
          </span>
        );
      case 'BLOQUEADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            BLOQUEADO
          </span>
        );
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            PENDENTE
          </span>
        );
      case 'ERRO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            ERRO
          </span>
        );
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Painel Geral de Controle Corporativo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gestão de celulares da frota, catálogo de aplicativos autorizados e políticas de segurança da Multivale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEnrollmentModal}
            className="bg-[#181D26] hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Provisionar DPC</span>
          </button>
          <button
            onClick={() => onNavigate('devices')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-900/30"
          >
            <Smartphone className="w-4 h-4" />
            <span>Ver Dispositivos ({totalDevices})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Devices */}
        <div
          onClick={() => onNavigate('devices')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Aparelhos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalDevices}</span>
            <span className="text-[10px] text-blue-400 font-semibold">Frota</span>
          </div>
        </div>

        {/* 2. Managed Devices */}
        <div
          onClick={() => onNavigate('devices')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gerenciados</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{managedDevices}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Device Owner</span>
          </div>
        </div>

        {/* 3. Pending / Unmanaged */}
        <div
          onClick={() => onNavigate('devices')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendentes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">{pendingDevices}</span>
            <span className="text-[10px] text-amber-400 font-semibold">Aguardando</span>
          </div>
        </div>

        {/* 4. Authorized Apps */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Apps Permitidos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-400">{authorizedAppsCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Allowlist</span>
          </div>
        </div>

        {/* 5. Policies */}
        <div
          onClick={() => onNavigate('policies')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Políticas Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{activePoliciesCount}</span>
            <span className="text-[10px] text-blue-400 font-semibold">Regras</span>
          </div>
        </div>

        {/* 6. Alerts */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-[#141820] hover:bg-[#181D26] border border-slate-800 hover:border-red-500/50 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alertas</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-400">{(unresolvedAlerts || []).length}</span>
            <span className="text-[10px] text-red-400 font-semibold">Pendentes</span>
          </div>
        </div>
      </div>

      {/* Fleet Distribution Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Status da Frota de Dispositivos</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Ativos ({activeDevices})
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
              Offline ({offlineDevices})
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Bloqueados ({lockedDevices})
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Pendentes ({pendingDevices})
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Ativos: ${activeDevices}`}
          />
          <div
            style={{ width: `${totalDevices > 0 ? (offlineDevices / totalDevices) * 100 : 0}%` }}
            className="bg-slate-500 h-full transition-all"
            title={`Offline: ${offlineDevices}`}
          />
          <div
            style={{ width: `${totalDevices > 0 ? (lockedDevices / totalDevices) * 100 : 0}%` }}
            className="bg-red-500 h-full transition-all"
            title={`Bloqueados: ${lockedDevices}`}
          />
          <div
            style={{ width: `${totalDevices > 0 ? (pendingDevices / totalDevices) * 100 : 0}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Pendentes: ${pendingDevices}`}
          />
        </div>
      </div>

      {/* Main Content Grid: Recent Devices Table + Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: DISPOSITIVOS RECENTES */}
        <div className="lg:col-span-8 bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Dispositivos Recentes</h2>
                <p className="text-[11px] text-slate-400">Últimos smartphones corporativos sincronizados</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>Ver Todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11141A] text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">Equipe</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Política</th>
                  <th className="py-3 px-4">Última Sincronização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {devices.slice(0, 5).map((device) => (
                  <tr
                    key={device.id}
                    onClick={() => onSelectDevice(device)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>{device.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      {device.employeeName || <span className="text-slate-500 italic">Não associado</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-700">
                        {device.teamName || 'Sem equipe'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{device.model}</td>
                    <td className="py-3 px-4">{getStatusBadge(device.status)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-blue-300 font-semibold truncate block max-w-[140px]">
                        {device.policyName || 'Sem Política'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(device.lastSync)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: ALERTAS RECENTES & ATIVIDADES RECENTES */}
        <div className="lg:col-span-4 space-y-6">
          {/* ALERTAS RECENTES */}
          <div className="bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Alertas Recentes</h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="p-3 space-y-2.5">
              {(alerts || []).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum alerta registrado no momento.</p>
              ) : (
                (alerts || []).slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs ${
                      alert.resolved
                        ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                        : alert.severity === 'CRITICA' || alert.severity === 'ALTA'
                        ? 'bg-red-950/20 border-red-800/60 text-red-200'
                        : 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        {alert.deviceName || 'Alerta de Conformidade'}
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300 line-clamp-2">{alert.message}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{formatDateTime(alert.createdAt)}</span>
                      <span>{alert.resolved ? '✓ Resolvido' : '● Pendente'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ATIVIDADES RECENTES (Auditoria) */}
          <div className="bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Atividades Recentes</h3>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                Auditoria
              </button>
            </div>

            <div className="p-3 space-y-2">
              {events.slice(0, 4).map((event) => (
                <div key={event.id} className="p-2.5 rounded-xl bg-[#11141A] border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-blue-400">{event.action.replace(/_/g, ' ')}</span>
                    <span>{formatDateTime(event.timestamp)}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white truncate">{event.targetName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>Por: {event.userName}</span>
                    <span className="text-slate-500">({event.targetType})</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
