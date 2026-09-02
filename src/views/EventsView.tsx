import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  ShieldCheck,
  Smartphone,
  Grid,
  Building2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { AuditEvent } from '../types';

interface EventsViewProps {
  events: AuditEvent[];
}

export const EventsView: React.FC<EventsViewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.newValue && evt.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || evt.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('ALLOWED') || action.includes('ACTIVATED')) {
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
    }
    if (action.includes('BLOCKED') || action.includes('DISABLED') || action.includes('LOCKED') || action.includes('DELETED')) {
      return 'bg-red-950/60 text-red-400 border-red-800/80';
    }
    return 'bg-blue-950/60 text-blue-400 border-blue-800/80';
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
        minute: '2-digit',
        second: '2-digit'
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
            <History className="w-6 h-6 text-blue-500" />
            <span>Trilha de Auditoria & Logs de Ações</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro imutável de todas as modificações administrativas, atribuições de políticas e bloqueios de apps.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por usuário, alvo, ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todas as Ações Administrativas</option>
              <option value="POLICY_CREATED">Criação de Política</option>
              <option value="POLICY_UPDATED">Atualização de Política</option>
              <option value="POLICY_ASSIGNED">Atribuição de Política</option>
              <option value="APPLICATION_ALLOWED">Autorização de Aplicativo</option>
              <option value="APPLICATION_BLOCKED">Bloqueio de Aplicativo</option>
              <option value="DEVICE_REGISTERED">Cadastro de Dispositivo</option>
              <option value="DEVICE_UPDATED">Atualização de Dispositivo</option>
              <option value="DEVICE_LOCKED">Bloqueio Remoto de Dispositivo</option>
              <option value="ALERT_RESOLVED">Resolução de Alerta</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-1">
          Mostrando <strong className="text-white">{filteredEvents.length}</strong> eventos registrados
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11141A] text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Data & Hora</th>
                <th className="py-3.5 px-4">Usuário Responsável</th>
                <th className="py-3.5 px-4">Ação Executada</th>
                <th className="py-3.5 px-4">Alvo Envolvido</th>
                <th className="py-3.5 px-4">Valor Anterior</th>
                <th className="py-3.5 px-4">Novo Valor Configurado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum evento registrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(evt.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{evt.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getActionColor(
                          evt.action
                        )}`}
                      >
                        {evt.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 truncate max-w-xs">{evt.targetName}</div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">({evt.targetType})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                      {evt.previousValue || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-300 truncate max-w-[200px]">
                      {evt.newValue || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
