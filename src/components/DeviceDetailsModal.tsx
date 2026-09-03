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
  Hash,
  FolderCheck,
  FolderLock,
  Folder,
  WifiOff,
  Radio,
  Usb,
  Plus,
  Trash2
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
  onUpdatePolicy?: (policy: Policy) => Promise<void>;
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
  onOpenEnrollment,
  onUpdatePolicy
}) => {
  const { canManageDevices, canManagePolicies } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'policy' | 'apps' | 'security'>('info');
  const [isChangingPolicy, setIsChangingPolicy] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(device.policyId || policies[0]?.id || '');
  const [isLocking, setIsLocking] = useState(false);
  const [lockReason, setLockReason] = useState('Bloqueio preventivo pelo Administrador da Multivale.');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [selectedAppToAdd, setSelectedAppToAdd] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.id === device.policyId);
  const currentEmployee = employees.find((e) => e.id === device.employeeId);
  const currentTeam = teams.find((t) => t.id === device.teamId);

  // Apps permitidos pela política ativa
  const allowedApps = (applications || []).filter((app) =>
    app && currentPolicy?.allowedAppPackageNames?.includes(app.packageName)
  );

  const blockedApps = (applications || []).filter(
    (app) => app && !currentPolicy?.allowedAppPackageNames?.includes(app.packageName)
  );

  const isRoutingBlocked = Boolean(
    currentPolicy?.blockHotspot || currentPolicy?.blockUsbTethering || currentPolicy?.blockBluetoothTethering
  );

  const isUsbOtgAllowed = currentPolicy ? (currentPolicy.allowUsbOtgStorage ?? true) : true;

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleApplyPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyId) return;
    await onApplyPolicy(device.id, selectedPolicyId);
    setIsChangingPolicy(false);
    showFeedback('Política vinculada com sucesso ao smartphone!');
  };

  const handleLockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLockDevice(device.id, lockReason);
    setIsLocking(false);
    showFeedback('Dispositivo bloqueado imediatamente.');
  };

  const handleUnlockSubmit = async () => {
    await onUnlockDevice(device.id);
    showFeedback('Dispositivo desbloqueado.');
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onSyncDevice(device.id);
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  // Gerenciamento Rápido de Roteamento no Aparelho
  const handleToggleRouting = async () => {
    if (!currentPolicy || !onUpdatePolicy) return;
    const shouldBlock = !isRoutingBlocked;
    const updated: Policy = {
      ...currentPolicy,
      blockHotspot: shouldBlock,
      blockUsbTethering: shouldBlock,
      blockBluetoothTethering: shouldBlock,
      updatedAt: new Date().toISOString()
    };
    await onUpdatePolicy(updated);
    showFeedback(
      shouldBlock
        ? 'Roteamento Móvel (Hotspot / USB) BLOQUEADO com sucesso!'
        : 'Roteamento Móvel LIBERADO para este aparelho!'
    );
  };

  // Gerenciamento Rápido da Entrada USB Tipo-C para Pendrive OTG & WhatsApp
  const handleToggleUsbOtg = async () => {
    if (!currentPolicy || !onUpdatePolicy) return;
    const shouldAllow = !isUsbOtgAllowed;
    const updated: Policy = {
      ...currentPolicy,
      allowUsbOtgStorage: shouldAllow,
      updatedAt: new Date().toISOString()
    };
    await onUpdatePolicy(updated);
    showFeedback(
      shouldAllow
        ? 'Entrada USB Tipo-C LIBERADA para Pendrive OTG & WhatsApp!'
        : 'Entrada USB Tipo-C BLOQUEADA para Pendrive OTG.'
    );
  };

  // Remover App do Aparelho
  const handleRemoveApp = async (pkg: string) => {
    if (!currentPolicy || !onUpdatePolicy) return;
    const updated: Policy = {
      ...currentPolicy,
      allowedAppPackageNames: (currentPolicy.allowedAppPackageNames || []).filter((p) => p !== pkg),
      blockedAppPackageNames: [...(currentPolicy.blockedAppPackageNames || []), pkg],
      updatedAt: new Date().toISOString()
    };
    await onUpdatePolicy(updated);
    const appObj = applications.find((a) => a.packageName === pkg);
    showFeedback(`Aplicativo "${appObj?.name || pkg}" removido deste aparelho!`);
  };

  // Adicionar App ao Aparelho
  const handleAddApp = async () => {
    if (!currentPolicy || !onUpdatePolicy || !selectedAppToAdd) return;
    if (currentPolicy.allowedAppPackageNames?.includes(selectedAppToAdd)) return;

    const updated: Policy = {
      ...currentPolicy,
      allowedAppPackageNames: [...(currentPolicy.allowedAppPackageNames || []), selectedAppToAdd],
      blockedAppPackageNames: (currentPolicy.blockedAppPackageNames || []).filter((p) => p !== selectedAppToAdd),
      updatedAt: new Date().toISOString()
    };
    await onUpdatePolicy(updated);
    const appObj = applications.find((a) => a.packageName === selectedAppToAdd);
    setSelectedAppToAdd('');
    showFeedback(`Aplicativo "${appObj?.name || selectedAppToAdd}" liberado neste aparelho!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {device.model} ({device.manufacturer || 'Multivale'})
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    device.status === 'ATIVO'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : device.status === 'BLOQUEADO'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {device.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Série: <strong className="text-slate-200">{device.serialNumber || 'N/A'}</strong> | IMEI: {device.imei}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback message */}
        {actionSuccessMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 sm:px-5 bg-[#11141A] gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Informações Gerais
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'policy'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Política & Roteamento</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'apps'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Aplicativos ({(allowedApps || []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ações & Bloqueio</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          {/* TAB 1: INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Vínculo de Colaborador */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-3">
                  Colaborador Responsável e Setor
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                      {currentEmployee?.name?.charAt(0) || <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {currentEmployee ? currentEmployee.name : 'Nenhum colaborador atribuído'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {currentEmployee ? `${currentEmployee.jobTitle} • Matrícula: ${currentEmployee.registrationNumber}` : 'Aparelho em estoque'}
                      </p>
                    </div>
                  </div>

                  {currentTeam && (
                    <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-200 font-semibold">{currentTeam.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status de Roteamento Rápido */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isRoutingBlocked
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isRoutingBlocked ? 'bg-rose-900/60 text-rose-400' : 'bg-amber-900/60 text-amber-400'
                    }`}
                  >
                    {isRoutingBlocked ? <WifiOff className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs block truncate">
                      {isRoutingBlocked ? 'Roteamento Móvel (Hotspot / USB): BLOQUEADO' : 'Roteamento Móvel: LIBERADO'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isRoutingBlocked
                        ? 'O colaborador não pode rotear a internet corporativa Multivale'
                        : 'Atenção: O colaborador pode compartilhar a internet deste chip'}
                    </span>
                  </div>
                </div>

                {canManagePolicies && onUpdatePolicy && (
                  <button
                    type="button"
                    onClick={handleToggleRouting}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                      isRoutingBlocked
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                    }`}
                  >
                    {isRoutingBlocked ? 'Liberar Roteamento' : 'Bloquear Roteamento'}
                  </button>
                )}
              </div>

              {/* Status de Entrada USB Tipo-C / Pendrive OTG & WhatsApp */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isUsbOtgAllowed
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUsbOtgAllowed ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'
                    }`}
                  >
                    <Usb className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs block truncate">
                      {isUsbOtgAllowed ? 'Entrada Tipo-C & Pendrive OTG: LIBERADO' : 'Entrada Tipo-C (Pendrive OTG): BLOQUEADO'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isUsbOtgAllowed
                        ? 'Permite conectar pendrive Tipo-C para passar arquivos e enviar via WhatsApp'
                        : 'Porta USB-C restrita a apenas carregamento de bateria'}
                    </span>
                  </div>
                </div>

                {canManagePolicies && onUpdatePolicy && (
                  <button
                    type="button"
                    onClick={handleToggleUsbOtg}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                      isUsbOtgAllowed
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    {isUsbOtgAllowed ? 'Bloquear Entrada' : 'Liberar Tipo-C'}
                  </button>
                )}
              </div>

              {/* Telemetria e Hardware */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Bateria</span>
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">{device.batteryLevel}%</span>
                  </div>
                </div>

                <div className="bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Armazenamento</span>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">{device.storageUsedGb}GB / {device.storageTotalGb}GB</span>
                  </div>
                </div>

                <div className="bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Versão Android</span>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">v{device.androidVersion || '14'}</span>
                  </div>
                </div>

                <div className="bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Último Sincronismo</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {new Date(device.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA & ROTEAMENTO */}
          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Perfil de Segurança Ativo
                    </span>
                    <h4 className="text-sm font-bold text-white">{currentPolicy?.name || 'Nenhuma política'}</h4>
                  </div>

                  {canManageDevices && (
                    <button
                      onClick={() => setIsChangingPolicy(!isChangingPolicy)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      {isChangingPolicy ? 'Cancelar Troca' : 'Alterar Política'}
                    </button>
                  )}
                </div>

                {isChangingPolicy ? (
                  <form onSubmit={handleApplyPolicySubmit} className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-300">Selecione uma Nova Política:</label>
                    <select
                      value={selectedPolicyId}
                      onChange={(e) => setSelectedPolicyId(e.target.value)}
                      className="w-full bg-[#11141A] border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    >
                      {(policies || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.securityModel} - {(p.allowedAppPackageNames || []).length} apps autorizados)
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

                    {/* Destaque: Controle de Roteamento */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-4 h-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-white block">Controle de Roteamento (Hotspot / USB)</span>
                          <span className="text-[10px] text-slate-400">
                            Estado atual:{' '}
                            <strong className={isRoutingBlocked ? 'text-rose-400' : 'text-emerald-400'}>
                              {isRoutingBlocked ? 'BLOQUEADO' : 'LIBERADO'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {canManagePolicies && onUpdatePolicy && (
                        <button
                          type="button"
                          onClick={handleToggleRouting}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isRoutingBlocked
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                          }`}
                        >
                          {isRoutingBlocked ? 'Liberar Roteador' : 'Bloquear Roteador'}
                        </button>
                      )}
                    </div>

                    {/* Destaque: Entrada USB Tipo-C / Pendrive OTG & WhatsApp */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Usb className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-bold text-white block">Entrada Tipo-C & Pendrive OTG (Arquivos & WhatsApp)</span>
                          <span className="text-[10px] text-slate-400">
                            Estado atual:{' '}
                            <strong className={isUsbOtgAllowed ? 'text-emerald-400' : 'text-rose-400'}>
                              {isUsbOtgAllowed ? 'LIBERADO' : 'BLOQUEADO'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {canManagePolicies && onUpdatePolicy && (
                        <button
                          type="button"
                          onClick={handleToggleUsbOtg}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isUsbOtgAllowed
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          }`}
                        >
                          {isUsbOtgAllowed ? 'Bloquear Entrada' : 'Liberar Tipo-C'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Modelo: <strong>{currentPolicy?.securityModel || 'ALLOWLIST'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pendrive Tipo-C (OTG): <strong>{isUsbOtgAllowed ? 'LIBERADO' : 'BLOQUEADO'}</strong></span>
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
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Armazenamento Restrito: <strong>{currentPolicy?.blockExternalStorageAccess ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Notificações Bloqueadas: <strong>{currentPolicy?.blockStatusBarExpand ? 'SIM' : 'NÃO'}</strong></span>
                      </div>
                    </div>

                    {/* Pastas Liberadas no Celular */}
                    {(currentPolicy?.allowedFolders || []).length > 0 && (
                      <div className="pt-3 border-t border-slate-800">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                          <FolderCheck className="w-3.5 h-3.5" />
                          <span>Pastas e Diretórios Liberados no Celular ({(currentPolicy?.allowedFolders || []).length})</span>
                        </span>
                        <div className="space-y-1 bg-[#141820] p-2.5 rounded-xl border border-slate-800">
                          {(currentPolicy?.allowedFolders || []).map((fPath) => (
                            <div key={fPath} className="flex items-center gap-2 font-mono text-[11px] text-amber-300">
                              <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span className="truncate">{fPath}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APLICATIVOS AUTORIZADOS */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Aplicativos Liberados no Smartphone ({(allowedApps || []).length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    O colaborador só poderá abrir estes aplicativos no aparelho.
                  </span>
                </div>
              </div>

              {/* Rápido: Adicionar aplicativo ao aparelho */}
              {canManagePolicies && onUpdatePolicy && (
                <div className="p-3 bg-[#11141A] rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Liberar Mais um Aplicativo para este Colaborador:
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={selectedAppToAdd}
                      onChange={(e) => setSelectedAppToAdd(e.target.value)}
                      className="flex-1 bg-[#141820] border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Selecione um aplicativo do catálogo...</option>
                      {blockedApps.map((app) => (
                        <option key={app.id} value={app.packageName}>
                          {app.name} ({app.packageName})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedAppToAdd}
                      onClick={handleAddApp}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Liberar no Celular</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {allowedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-[#11141A] rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{app.name}</h4>
                      <p className="text-[10px] font-mono text-blue-400 truncate">{app.packageName}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        AUTORIZADO
                      </span>

                      {canManagePolicies && onUpdatePolicy && (
                        <button
                          type="button"
                          onClick={() => handleRemoveApp(app.packageName)}
                          className="text-slate-500 hover:text-red-400 p-1 transition"
                          title="Remover este app deste aparelho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                    Envia um comando remoto para o smartphone atualizar as diretrizes de política corporativa.
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

              {/* Roteamento e Ponto de Acesso */}
              <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Bloqueio de Roteamento de Internet (Hotspot)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bloqueie ou libere o compartilhamento do plano 4G/5G do chip corporativo deste aparelho.
                  </p>
                </div>

                {canManagePolicies && onUpdatePolicy && (
                  <button
                    onClick={handleToggleRouting}
                    className={`font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow ${
                      isRoutingBlocked
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {isRoutingBlocked ? (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        <span>Liberar Roteamento</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Bloquear Roteamento</span>
                      </>
                    )}
                  </button>
                )}
              </div>

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
