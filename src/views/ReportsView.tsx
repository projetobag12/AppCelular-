import React, { useState } from 'react';
import {
  FileText,
  Download,
  Smartphone,
  Users,
  Building2,
  ShieldCheck,
  Grid,
  History,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2
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

interface ReportsViewProps {
  devices: Device[];
  employees: Employee[];
  teams: Team[];
  applications: Application[];
  policies: Policy[];
  alerts: Alert[];
  events: AuditEvent[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  devices,
  employees,
  teams,
  applications,
  policies,
  alerts,
  events
}) => {
  const [activeReport, setActiveReport] = useState<string>('devices');

  // Função auxiliar para exportação CSV real
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join(
        '\n'
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_multivale_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDevices = () => {
    const headers = ['ID', 'Nome Dispositivo', 'Fabricante', 'Modelo', 'Versão Android', 'IMEI', 'Funcionário', 'Equipe', 'Política', 'Status', 'Modo Gestão', 'Bateria %', 'Última Sincronização'];
    const rows = devices.map((d) => [
      d.id,
      d.name,
      d.manufacturer,
      d.model,
      d.androidVersion,
      d.imei,
      d.employeeName || 'Não associado',
      d.teamName || 'Sem equipe',
      d.policyName || 'Sem política',
      d.status,
      d.managementMode,
      d.batteryLevel,
      d.lastSync
    ]);
    exportToCsv('relatorio_dispositivos', headers, rows);
  };

  const handleExportEmployees = () => {
    const headers = ['ID', 'Nome', 'Matrícula', 'Equipe', 'Cargo', 'E-mail', 'Telefone', 'Status', 'Qtd Aparelhos'];
    const rows = employees.map((e) => [
      e.id,
      e.name,
      e.registrationNumber,
      e.teamName,
      e.jobTitle,
      e.email,
      e.phone,
      e.status,
      (devices || []).filter((d) => d && d.employeeId === e.id).length
    ]);
    exportToCsv('relatorio_funcionarios', headers, rows);
  };

  const handleExportTeams = () => {
    const headers = ['ID', 'Nome Equipe', 'Região', 'Membros', 'Aparelhos', 'Política Padrão'];
    const rows = (teams || []).map((t) => [
      t.id,
      t.name,
      t.region,
      (employees || []).filter((e) => e && e.teamId === t.id).length || t.memberCount || 0,
      (devices || []).filter((d) => d && d.teamId === t.id).length || t.deviceCount || 0,
      (policies || []).find((p) => p && p.id === t.defaultPolicyId)?.name || 'Padrão'
    ]);
    exportToCsv('relatorio_equipes', headers, rows);
  };

  const handleExportPolicies = () => {
    const headers = ['ID', 'Nome Política', 'Modelo Segurança', 'Qtd Apps Autorizados', 'Play Store Bloqueada', 'USB Bloqueado', 'Status'];
    const rows = (policies || []).map((p) => [
      p.id,
      p.name,
      p.securityModel,
      (p.allowedAppPackageNames || []).length,
      p.blockPlayStore ? 'SIM' : 'NÃO',
      p.blockUsbData ? 'SIM' : 'NÃO',
      p.status
    ]);
    exportToCsv('relatorio_politicas', headers, rows);
  };

  const handleExportApplications = () => {
    const headers = ['ID', 'Nome Aplicativo', 'Package Name Android', 'Categoria', 'Status', 'Nível Risco'];
    const rows = applications.map((a) => [
      a.id,
      a.name,
      a.packageName,
      a.category,
      a.status,
      a.riskLevel || 'BAIXO'
    ]);
    exportToCsv('relatorio_catalogo_aplicativos', headers, rows);
  };

  const handleExportEvents = () => {
    const headers = ['ID', 'Data Hora', 'Usuário', 'Ação', 'Tipo Alvo', 'Nome Alvo', 'Valor Anterior', 'Novo Valor'];
    const rows = events.map((e) => [
      e.id,
      e.timestamp,
      e.userName,
      e.action,
      e.targetType,
      e.targetName,
      e.previousValue || '-',
      e.newValue || '-'
    ]);
    exportToCsv('relatorio_auditoria_eventos', headers, rows);
  };

  const handleExportProblemDevices = () => {
    const problemList = devices.filter((d) => d.status === 'BLOQUEADO' || d.status === 'OFFLINE' || d.status === 'ERRO' || d.status === 'PENDENTE');
    const headers = ['ID', 'Nome', 'Modelo', 'Funcionário', 'Equipe', 'Status', 'Modo Gestão', 'Motivo / Detalhes', 'Última Sincronização'];
    const rows = problemList.map((d) => [
      d.id,
      d.name,
      d.model,
      d.employeeName || 'Não associado',
      d.teamName || 'Sem equipe',
      d.status,
      d.managementMode,
      d.lockReason || 'Dispositivo offline ou pendente de sincronização',
      d.lastSync
    ]);
    exportToCsv('relatorio_dispositivos_problemas', headers, rows);
  };

  const reportTabs = [
    { id: 'devices', label: 'Dispositivos', icon: Smartphone, count: (devices || []).length, action: handleExportDevices },
    { id: 'employees', label: 'Funcionários', icon: Users, count: (employees || []).length, action: handleExportEmployees },
    { id: 'teams', label: 'Equipes Regionais', icon: Building2, count: (teams || []).length, action: handleExportTeams },
    { id: 'policies', label: 'Políticas', icon: ShieldCheck, count: (policies || []).length, action: handleExportPolicies },
    { id: 'applications', label: 'Aplicativos', icon: Grid, count: (applications || []).length, action: handleExportApplications },
    { id: 'events', label: 'Auditoria & Logs', icon: History, count: (events || []).length, action: handleExportEvents },
    { id: 'problems', label: 'Dispositivos c/ Problemas', icon: AlertTriangle, count: (devices || []).filter((d) => d && d.status !== 'ATIVO').length, action: handleExportProblemDevices },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-500" />
            <span>Central de Relatórios & Exportação</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gere relatórios gerenciais e exporte dados corporativos em formato CSV (compatível com Excel).
          </p>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isActive
                  ? 'bg-[#181D26] border-blue-500 shadow-md shadow-blue-900/20'
                  : 'bg-[#141820] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">{tab.label}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    tab.action();
                  }}
                  className="mt-3 w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent font-bold py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Report Preview Table */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Pré-visualização do Relatório:{' '}
              <span className="text-blue-400">
                {reportTabs.find((t) => t.id === activeReport)?.label}
              </span>
            </h3>
          </div>
          <button
            onClick={() => reportTabs.find((t) => t.id === activeReport)?.action()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          {activeReport === 'devices' && (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Dispositivo</th>
                  <th className="py-2.5 px-3">Modelo</th>
                  <th className="py-2.5 px-3">IMEI</th>
                  <th className="py-2.5 px-3">Funcionário</th>
                  <th className="py-2.5 px-3">Equipe</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2.5 px-3 font-bold text-white">{d.name}</td>
                    <td className="py-2.5 px-3">{d.model}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{d.imei}</td>
                    <td className="py-2.5 px-3">{d.employeeName || '-'}</td>
                    <td className="py-2.5 px-3">{d.teamName || '-'}</td>
                    <td className="py-2.5 px-3 font-bold">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'employees' && (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Matrícula</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Equipe</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 px-3 font-bold text-white">{e.name}</td>
                    <td className="py-2.5 px-3 font-mono">{e.registrationNumber}</td>
                    <td className="py-2.5 px-3">{e.jobTitle}</td>
                    <td className="py-2.5 px-3">{e.teamName}</td>
                    <td className="py-2.5 px-3">{e.email}</td>
                    <td className="py-2.5 px-3 font-bold">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'applications' && (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Package Name Android</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 font-bold text-white">{a.name}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">{a.packageName}</td>
                    <td className="py-2.5 px-3">{a.category}</td>
                    <td className="py-2.5 px-3 font-bold">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'events' && (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Alvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {events.slice(0, 10).map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-2.5 px-3 font-mono">{ev.timestamp.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{ev.userName}</td>
                    <td className="py-2.5 px-3">{ev.action}</td>
                    <td className="py-2.5 px-3">{ev.targetName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeReport === 'teams' || activeReport === 'policies' || activeReport === 'problems') && (
            <p className="text-xs text-slate-400 text-center py-6">
              Clique no botão <strong>"Exportar CSV"</strong> acima para baixar o arquivo completo com todos os registros e colunas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
