import React, { useState } from 'react';
import {
  Smartphone,
  X,
  ShieldCheck,
  ShieldAlert,
  User,
  Building2,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  Battery,
  HardDrive,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  Layers,
  Phone,
  Hash
} from 'lucide-react';
import { Device, Policy, Employee, Team, Application } from '../types';
import { useAuth } from '../context/AuthContext';

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  policies: Policy[];
  employees: Employee[];
  teams: Team[];
  applications: Application[];
  onApplyPolicy: (deviceId: string, policyId: string) => Promise<void>;
  onLockDevice: (deviceId: string, reason: string) => Promise<void>;
  onUnlockDevice: (deviceId: string) => Promise<void>;
  onSyncDevice: (deviceId: string) => Promise<void>;
  onOpenEnrollment: () => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  isOpen,
  onClose,
  device,
  policies,
  employees,
  teams,
  applications,
  onApplyPolicy,
  onLockDevice,
  onUnlockDevice,
  onSyncDevice,
  onOpenEnrollment
}) => {
  const { canManageDevices } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'policy' | 'apps' | 'security'>('info');
  const [isChangingPolicy, setIsChangingPolicy] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(device.policyId || policies[0]?.id || '');
  const [isLocking, setIsLocking] = useState(false);
  const [lockReason, setLockReason] = useState('Bloqueio preventivo pelo Administrador da Multivale.');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.id === device.policyId);
  const currentEmployee = employees.find((e) => e.id === device.employeeId);
  const currentTeam = teams.find((t) => t.id === device.teamId);

  // Apps permitidos pela política ativa
  const allowedApps = applications.filter((app) =>
    currentPolicy?.allowedAppPackageNames?.includes(app.packageName)
  );

  const blockedApps = applications.filter(
    (app) => !currentPolicy?.allowedAppPackageNames?.includes(app.packageName)
  );

  const handleApplyPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyId) return;
    await onApplyPolicy(device.id, selectedPolicyId);
    setIsChangingPolicy(false);
  };

  const handleLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLockDevice(device.id, lockReason);
    setIsLocking(false);
  };

  const handleUnlockSubmit = async () => {
    await onUnlockDevice(device.id);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onSyncDevice(device.id);
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#11141A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{device.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    device.status === 'ATIVO'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                      : device.status === 'BLOQUEADO'
                      ? 'bg-red-950/60 text-red-400 border-red-800/80'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                  }`}
                >
                  {device.status}
                </span>
                <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] px-2 py-0.5 rounded font-mono">
                  {device.managementMode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {device.manufacturer} {device.model} • {device.androidVersion}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0F1115] border-b border-slate-800 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Identificação & Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'policy'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Política Corporativa</span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apps'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Aplicativos Autorizados ({allowedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ações & Bloqueio Remoto</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-300">
          {/* TAB 1: IDENTIFICAÇÃO E HARDWARE */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Section 1: Identificação */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Identificação do Aparelho</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Nome do Aparelho</span>
                    <span className="text-white font-bold">{device.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Modelo & Fabricante</span>
                    <span className="text-white">{device.manufacturer} {device.model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Sistema Operacional</span>
                    <span className="text-white font-mono">{device.androidVersion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">IMEI</span>
                    <span className="text-slate-200 font-mono text-[11px] select-all">{device.imei}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Número de Série</span>
                    <span className="text-slate-200 font-mono text-[11px] select-all">{device.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Chip / Linha Corporativa</span>
                    <span className="text-emerald-400 font-bold">{device.phoneNumber || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Associação com Colaborador */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Colaborador Responsável</span>
                </h3>

                {currentEmployee ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Nome</span>
                      <span className="text-white font-bold">{currentEmployee.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Matrícula</span>
                      <span className="text-blue-400 font-mono font-bold">{currentEmployee.registrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Equipe / Filial</span>
                      <span className="text-slate-200">{currentEmployee.teamName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Cargo</span>
                      <span className="text-slate-200">{currentEmployee.jobTitle}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Nenhum colaborador vinculado a este aparelho.</p>
                )}
              </div>

              {/* Section 3: Telemetria Técnica Não-Invasiva */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span>Status Operacional & Bateria</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Nível de Bateria</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-bold">{device.batteryLevel}%</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Armazenamento</span>
                    <span className="text-white font-bold">{device.storageUsedGb} GB / {device.storageTotalGb} GB</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Última Sincronização</span>
                    <span className="text-slate-300 font-mono text-[11px]">{formatDateTime(device.lastSync)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Modo de Gerenciamento</span>
                    <span className="text-blue-400 font-bold">{device.managementMode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA CORPORATIVA */}
          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Política Ativa no Dispositivo</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {currentPolicy?.name || 'Nenhuma Política Vinculada'}
                    </h3>
                  </div>

                  {canManageDevices && (
                    <button
                      onClick={() => setIsChangingPolicy(!isChangingPolicy)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                    >
                      {isChangingPolicy ? 'Cancelar' : 'Alterar Política'}
                    </button>
                  )}
                </div>

                {isChangingPolicy ? (
                  <form onSubmit={handleApplyPolicySubmit} className="bg-[#141820] p-4 rounded-xl border border-slate-700 space-y-3">
                    <label className="block text-xs font-bold text-white">Selecione a Nova Política:</label>
                    <select
                      value={selectedPolicyId}
                      onChange={(e) => setSelectedPolicyId(e.target.value)}
                      className="w-full bg-[#11141A] border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    >
                      {policies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.securityModel} - {p.allowedAppPackageNames.length} apps autorizados)
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsChangingPolicy(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                      >
                        Salvar e Aplicar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {currentPolicy?.description || 'Este dispositivo está sem uma política corporativa formal.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Modelo: <strong>{currentPolicy?.securityModel || 'ALLOWLIST'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Play Store Restrita: <strong>{currentPolicy?.blockPlayStore ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Depuração USB Bloqueada: <strong>{currentPolicy?.blockDeveloperMode ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Transferência USB Bloqueada: <strong>{currentPolicy?.blockUsbData ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reset de Fábrica Bloqueado: <strong>{currentPolicy?.blockFactoryReset ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APLICATIVOS AUTORIZADOS */}
          {activeTab === 'apps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Aplicativos Autorizados na Política Atual ({allowedApps.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Modo Estrito: Apenas os pacotes listados podem ser executados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {allowedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-[#11141A] rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                      <p className="text-[10px] font-mono text-blue-400 truncate">{app.packageName}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex-shrink-0">
                      AUTORIZADO
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AÇÕES ADMINISTRATIVAS E BLOQUEIO REMOTO */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Sincronização */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Forçar Sincronização Imediata</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Envia um sinal para o agente no smartphone atualizar as diretrizes de política corporativa.
                  </p>
                </div>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </button>
              </div>

              {syncSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dispositivo sincronizado com sucesso! Diretrizes atualizadas na nuvem Firestore.</span>
                </div>
              )}

              {/* Bloqueio / Desbloqueio */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Controle de Bloqueio Corporativo</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bloqueia a tela do aparelho impedindo o uso em caso de perda, furto ou desvinculação de funcionário.
                    </p>
                  </div>

                  {device.status === 'BLOQUEADO' ? (
                    <button
                      onClick={handleUnlockSubmit}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Desbloquear Aparelho</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsLocking(!isLocking)}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow shadow-red-900/30"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloquear Aparelho</span>
                    </button>
                  )}
                </div>

                {isLocking && (
                  <form onSubmit={handleLockSubmit} className="bg-[#141820] p-4 rounded-xl border border-red-900/40 space-y-3">
                    <label className="block text-xs font-bold text-red-300">Motivo do Bloqueio Corporativo:</label>
                    <input
                      type="text"
                      value={lockReason}
                      onChange={(e) => setLockReason(e.target.value)}
                      placeholder="Ex: Celular extraviado ou colaborador desligado da empresa"
                      className="w-full bg-[#11141A] border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-red-500"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsLocking(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                      >
                        Confirmar Bloqueio Imediato
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Android Enterprise Provisioning Info */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Provisionamento Android Device Owner</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visualize o token de inscrição e instruções para registro do aparelho no Android Enterprise.
                  </p>
                </div>

                <button
                  onClick={onOpenEnrollment}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Ver Provisionamento</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#11141A] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ID: <strong className="text-slate-400 font-mono">{device.id}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
