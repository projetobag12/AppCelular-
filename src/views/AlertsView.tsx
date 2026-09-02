import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { Alert, AlertSeverity, AlertType, Device } from '../types';
import { useAuth } from '../context/AuthContext';

interface AlertsViewProps {
  alerts: Alert[];
  devices: Device[];
  onResolveAlert: (alertId: string) => Promise<void>;
  onSelectDevice: (device: Device) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  devices,
  onResolveAlert,
  onSelectDevice
}) => {
  const { canManageDevices } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // Padrão focado em pendentes

  const filteredAlerts = alerts.filter((alt) => {
    const matchesSearch =
      alt.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alt.deviceName && alt.deviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alt.employeeName && alt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? !alt.resolved
        : alt.resolved;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICA':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      case 'ALTA':
        return 'bg-red-950/80 text-red-400 border-red-800/80';
      case 'MEDIA':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'BAIXA':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-red-500" />
            <span>Central de Alertas & Conformidade</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Detecção de violações de política, falhas de sincronismo e dispositivos com pendência técnica.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por mensagem, dispositivo, colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="PENDING">Apenas Alertas Pendentes</option>
              <option value="RESOLVED">Apenas Alertas Resolvidos</option>
              <option value="ALL">Todos os Alertas</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todas as Severidades</option>
              <option value="CRITICA">CRÍTICA</option>
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MÉDIA</option>
              <option value="BAIXA">BAIXA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#141820] border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-white">Nenhum Alerta Encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Todos os smartphones corporativos estão operando em conformidade com as regras estabelecidas.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const dev = devices.find((d) => d.id === alert.deviceId);
            return (
              <div
                key={alert.id}
                className={`bg-[#141820] border rounded-2xl p-5 transition shadow-sm ${
                  alert.resolved
                    ? 'border-slate-800 opacity-70'
                    : alert.severity === 'CRITICA' || alert.severity === 'ALTA'
                    ? 'border-red-900/50 hover:border-red-600/60'
                    : 'border-amber-900/50 hover:border-amber-600/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${
                        alert.resolved
                          ? 'bg-slate-800 text-slate-400'
                          : alert.severity === 'CRITICA' || alert.severity === 'ALTA'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          Severidade {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {alert.deviceName || 'Alerta de Sistema'}
                        </span>
                        {alert.employeeName && (
                          <span className="text-[11px] text-slate-400">({alert.employeeName})</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium mb-2">
                        {alert.message}
                      </p>

                      {alert.details && (
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-2 bg-[#11141A] p-2.5 rounded-lg border border-slate-800/80">
                          {alert.details}
                        </p>
                      )}

                      {alert.suggestedAction && !alert.resolved && (
                        <p className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                          <span>Recomendação:</span>
                          <span className="text-slate-300 font-normal">{alert.suggestedAction}</span>
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Gerado em: {formatDateTime(alert.createdAt)}
                        </span>
                        {alert.resolved && (
                          <span className="text-emerald-400 font-semibold">
                            ✓ Resolvido em {formatDateTime(alert.resolvedAt)} por {alert.resolvedBy || 'TI'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 mt-2 sm:mt-0 flex-shrink-0">
                    {dev && (
                      <button
                        onClick={() => onSelectDevice(dev)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ver Aparelho</span>
                      </button>
                    )}

                    {canManageDevices && !alert.resolved && (
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-sm"
                      >
                        Marcar como Resolvido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
