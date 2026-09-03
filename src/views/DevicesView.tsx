import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  WifiOff,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Building2,
  User,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Info,
  Battery,
  HardDrive,
  QrCode,
  ShieldAlert,
  X
} from 'lucide-react';
import {
  Device,
  Employee,
  Team,
  Policy,
  Application,
  DeviceStatus,
  ManagementMode
} from '../types';
import { useAuth } from '../context/AuthContext';
import { DeviceDetailsModal } from '../components/DeviceDetailsModal';

interface DevicesViewProps {
  devices: Device[];
  employees: Employee[];
  teams: Team[];
  policies: Policy[];
  applications: Application[];
  onSaveDevice: (device: Device) => Promise<void>;
  onDeleteDevice: (deviceId: string) => Promise<void>;
  onApplyPolicyToDevice: (deviceId: string, policyId: string) => Promise<void>;
  onToggleDeviceLock: (device: Device, lockReason?: string) => Promise<void>;
  onOpenEnrollmentModal: () => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  employees,
  teams,
  policies,
  applications,
  onSaveDevice,
  onDeleteDevice,
  onApplyPolicyToDevice,
  onToggleDeviceLock,
  onOpenEnrollmentModal
}) => {
  const { canManageDevices, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [policyFilter, setPolicyFilter] = useState<string>('ALL');

  // Modal States
  const [selectedDeviceForDetails, setSelectedDeviceForDetails] = useState<Device | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Partial<Device> | null>(null);
  const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false);
  const [deviceForPolicy, setDeviceForPolicy] = useState<Device | null>(null);
  const [selectedPolicyIdToApply, setSelectedPolicyIdToApply] = useState<string>('');
  const [lockModalDevice, setLockModalDevice] = useState<Device | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);

  // Filtering
  const filteredDevices = devices.filter((d) => {
    if (!d) return false;
    const sTerm = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (d.name || '').toLowerCase().includes(sTerm) ||
      (d.model || '').toLowerCase().includes(sTerm) ||
      (d.imei || '').toLowerCase().includes(sTerm) ||
      (d.employeeName ? d.employeeName.toLowerCase().includes(sTerm) : false) ||
      (d.teamName ? d.teamName.toLowerCase().includes(sTerm) : false);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesTeam = teamFilter === 'ALL' || d.teamId === teamFilter;
    const matchesPolicy = policyFilter === 'ALL' || d.policyId === policyFilter;

    return matchesSearch && matchesStatus && matchesTeam && matchesPolicy;
  });

  const handleOpenCreate = () => {
    const newDev: Partial<Device> = {
      id: `dev-${Date.now()}`,
      name: `MV-CEL-${Math.floor(100 + Math.random() * 900)}`,
      manufacturer: 'Samsung',
      model: 'Galaxy A15 5G',
      androidVersion: 'Android 14 (One UI 6.1)',
      imei: `358${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      serialNumber: `R5CW${Math.floor(100000 + Math.random() * 900000)}`,
      phoneNumber: '(41) 99' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      operator: 'Vivo Empresas 5G',
      status: 'ATIVO',
      managementMode: 'DEVICE_OWNER',
      batteryLevel: 90,
      storageUsedGb: 18.0,
      storageTotalGb: 128.0,
      createdAt: new Date().toISOString(),
      lastSync: new Date().toISOString()
    };
    setEditingDevice(newDev);
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (device: Device) => {
    setEditingDevice({ ...device });
    setIsEditingModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !editingDevice.name || !editingDevice.model) return;

    // Resolve employee and team names
    const employee = employees.find((emp) => emp.id === editingDevice.employeeId);
    const team = teams.find((t) => t.id === editingDevice.teamId);
    const policy = policies.find((p) => p.id === editingDevice.policyId);

    const fullDevice: Device = {
      id: editingDevice.id || `dev-${Date.now()}`,
      name: editingDevice.name,
      manufacturer: editingDevice.manufacturer || 'Samsung',
      model: editingDevice.model,
      androidVersion: editingDevice.androidVersion || 'Android 14',
      imei: editingDevice.imei || '358000000000000',
      serialNumber: editingDevice.serialNumber || 'SN-UNKNOWN',
      phoneNumber: editingDevice.phoneNumber,
      operator: editingDevice.operator || 'Corporativo',
      employeeId: employee?.id,
      employeeName: employee?.name,
      teamId: team?.id || employee?.teamId,
      teamName: team?.name || employee?.teamName,
      policyId: editingDevice.status === 'BLOQUEADO' ? undefined : (policy?.id || editingDevice.policyId),
      policyName: editingDevice.status === 'BLOQUEADO' ? 'Sem Política (Desativado)' : (policy?.name || editingDevice.policyName),
      status: editingDevice.status as DeviceStatus,
      managementMode: (editingDevice.managementMode as ManagementMode) || 'DEVICE_OWNER',
      batteryLevel: editingDevice.batteryLevel ?? 85,
      storageUsedGb: editingDevice.storageUsedGb ?? 20,
      storageTotalGb: editingDevice.storageTotalGb ?? 128,
      createdAt: editingDevice.createdAt || new Date().toISOString(),
      lastSync: new Date().toISOString()
    };

    await onSaveDevice(fullDevice);
    setIsEditingModalOpen(false);
    setEditingDevice(null);
  };

  const handleOpenAssignPolicy = (device: Device) => {
    setDeviceForPolicy(device);
    setSelectedPolicyIdToApply(device.policyId || policies[0]?.id || '');
    setIsAssignPolicyModalOpen(true);
  };

  const handleApplyPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceForPolicy || !selectedPolicyIdToApply) return;
    await onApplyPolicyToDevice(deviceForPolicy.id, selectedPolicyIdToApply);
    setIsAssignPolicyModalOpen(false);
    setDeviceForPolicy(null);
  };

  const handleTriggerSync = async (device: Device) => {
    setSyncingDeviceId(device.id);
    const updatedDevice: Device = {
      ...device,
      lastSync: new Date().toISOString()
    };
    await onSaveDevice(updatedDevice);
    setTimeout(() => {
      setSyncingDeviceId(null);
    }, 1000);
  };

  const handleOpenLockModal = (device: Device) => {
    setLockModalDevice(device);
    setLockReasonInput(
      device.status === 'BLOQUEADO'
        ? ''
        : 'Bloqueio preventivo pelo Administrador da Multivale'
    );
  };

  const handleConfirmToggleLock = async () => {
    if (!lockModalDevice) return;
    await onToggleDeviceLock(lockModalDevice, lockReasonInput);
    setLockModalDevice(null);
  };

  const getStatusBadge = (status: DeviceStatus) => {
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
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-blue-500" />
            <span>Dispositivos Corporativos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cadastro, monitoramento de políticas de aplicativos e status de smartphones da Multivale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEnrollmentModal}
            className="bg-[#181D26] hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Provisionar DPC</span>
          </button>

          {canManageDevices && (
            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Dispositivo</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, modelo, IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ATIVO">ATIVO</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="BLOQUEADO">BLOQUEADO / DESATIVADO</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="ERRO">ERRO</option>
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todas as Equipes</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Policy Filter */}
          <div>
            <select
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todas as Políticas</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Mostrando <strong className="text-white">{(filteredDevices || []).length}</strong> de {(devices || []).length} dispositivos</span>
          {(searchTerm || statusFilter !== 'ALL' || teamFilter !== 'ALL' || policyFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTeamFilter('ALL');
                setPolicyFilter('ALL');
              }}
              className="text-blue-400 hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11141A] text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dispositivo</th>
                <th className="py-3.5 px-4">Funcionário</th>
                <th className="py-3.5 px-4">Equipe</th>
                <th className="py-3.5 px-4">Modelo & Android</th>
                <th className="py-3.5 px-4">Modo Gestão</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Política Ativa</th>
                <th className="py-3.5 px-4">Última Sinc.</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {(filteredDevices || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    Nenhum dispositivo encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                (filteredDevices || []).map((device) => {
                  const isDeactivated = device.status === 'BLOQUEADO';
                  const isSyncing = syncingDeviceId === device.id;
                  return (
                    <tr key={device.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-white">{device.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">IMEI: {device.imei}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {device.employeeName ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-200">{device.employeeName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Não associado</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-700 inline-block truncate max-w-[140px]">
                          {device.teamName || 'Sem Equipe'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{device.manufacturer} {device.model}</div>
                        <div className="text-[10px] text-slate-400">{device.androidVersion}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            device.managementMode === 'DEVICE_OWNER'
                              ? 'bg-blue-950/60 text-blue-400 border-blue-800/80'
                              : device.managementMode === 'PROFILE_OWNER'
                              ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {device.managementMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(device.status)}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-blue-300 font-semibold truncate block max-w-[130px]" title={device.policyName}>
                          {device.policyName || 'Nenhuma'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(device.lastSync)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sincronizar Agora */}
                          <button
                            onClick={() => handleTriggerSync(device)}
                            disabled={isSyncing}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Sincronizar Dispositivo Agora"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
                          </button>

                          {/* Details Modal */}
                          <button
                            onClick={() => setSelectedDeviceForDetails(device)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Ver Detalhes Técnicos & Gerenciamento"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {canManageDevices && (
                            <>
                              {/* Apply Policy */}
                              <button
                                onClick={() => handleOpenAssignPolicy(device)}
                                className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 transition"
                                title="Alterar Política Corporativa"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Lock */}
                              <button
                                onClick={() => handleOpenLockModal(device)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isDeactivated
                                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                                    : 'bg-red-950/80 text-red-400 border-red-800 hover:bg-red-900'
                                }`}
                                title={isDeactivated ? 'Desbloquear Aparelho' : 'Bloquear Aparelho'}
                              >
                                {isDeactivated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Edit Device */}
                              <button
                                onClick={() => handleOpenEdit(device)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                title="Editar Cadastro"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja realmente remover o dispositivo "${device.name}"?`)) {
                                  onDeleteDevice(device.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                              title="Excluir Dispositivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: DETALHES TÉCNICOS & GERENCIAMENTO */}
      {selectedDeviceForDetails && (
        <DeviceDetailsModal
          isOpen={!!selectedDeviceForDetails}
          onClose={() => setSelectedDeviceForDetails(null)}
          device={selectedDeviceForDetails}
          policies={policies}
          employees={employees}
          teams={teams}
          applications={applications}
          onApplyPolicy={async (devId, polId) => {
            await onApplyPolicyToDevice(devId, polId);
            const updated = devices.find((d) => d.id === devId);
            if (updated) setSelectedDeviceForDetails({ ...updated, policyId: polId });
          }}
          onLockDevice={async (devId, reason) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              await onToggleDeviceLock(dev, reason);
              setSelectedDeviceForDetails({ ...dev, status: 'BLOQUEADO' });
            }
          }}
          onUnlockDevice={async (devId) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              await onToggleDeviceLock(dev);
              setSelectedDeviceForDetails({ ...dev, status: 'ATIVO' });
            }
          }}
          onSyncDevice={async (devId) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              await onSaveDevice({ ...dev, lastSync: new Date().toISOString() });
              setSelectedDeviceForDetails({ ...dev, lastSync: new Date().toISOString() });
            }
          }}
          onOpenEnrollment={onOpenEnrollmentModal}
        />
      )}

      {/* MODAL 2: CADASTRO / EDIÇÃO DE DISPOSITIVO */}
      {isEditingModalOpen && editingDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingDevice.id && devices.some((d) => d.id === editingDevice.id)
                    ? 'Editar Dispositivo Corporativo'
                    : 'Cadastrar Novo Dispositivo'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditingModalOpen(false);
                  setEditingDevice(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nome do Aparelho (Identificador Interno) *</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.name || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    placeholder="Ex: MV-CEL-01"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Modelo do Celular *</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.model || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, model: e.target.value })}
                    placeholder="Ex: Galaxy A15 5G"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={editingDevice.manufacturer || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, manufacturer: e.target.value })}
                    placeholder="Samsung, Motorola, Xiaomi"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Versão do Android</label>
                  <input
                    type="text"
                    value={editingDevice.androidVersion || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, androidVersion: e.target.value })}
                    placeholder="Android 14 (One UI 6)"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">IMEI *</label>
                  <input
                    type="text"
                    required
                    value={editingDevice.imei || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, imei: e.target.value })}
                    placeholder="358000000000000"
                    className="w-full bg-[#11141A] border border-slate-800 text-white font-mono rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Número de Série</label>
                  <input
                    type="text"
                    value={editingDevice.serialNumber || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, serialNumber: e.target.value })}
                    placeholder="R5CW123456"
                    className="w-full bg-[#11141A] border border-slate-800 text-white font-mono rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Linha / Telefone Corporativo</label>
                  <input
                    type="text"
                    value={editingDevice.phoneNumber || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, phoneNumber: e.target.value })}
                    placeholder="(41) 99999-9999"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Operadora / Plano</label>
                  <input
                    type="text"
                    value={editingDevice.operator || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, operator: e.target.value })}
                    placeholder="Vivo Empresas 5G"
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Funcionário Vinculado</label>
                  <select
                    value={editingDevice.employeeId || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find((x) => x.id === empId);
                      setEditingDevice({
                        ...editingDevice,
                        employeeId: empId || undefined,
                        employeeName: emp?.name,
                        teamId: emp?.teamId || editingDevice.teamId,
                        teamName: emp?.teamName || editingDevice.teamName
                      });
                    }}
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Não associado a nenhum funcionário --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.registrationNumber} - {emp.teamName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Equipe / Filial</label>
                  <select
                    value={editingDevice.teamId || ''}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const tm = teams.find((t) => t.id === tId);
                      setEditingDevice({
                        ...editingDevice,
                        teamId: tId || undefined,
                        teamName: tm?.name
                      });
                    }}
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Sem Equipe Definida --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Política Corporativa Inicial</label>
                  <select
                    value={editingDevice.policyId || ''}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const pol = policies.find((p) => p.id === pId);
                      setEditingDevice({
                        ...editingDevice,
                        policyId: pId || undefined,
                        policyName: pol?.name
                      });
                    }}
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Nenhuma Política --</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.securityModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Modo de Gerenciamento</label>
                  <select
                    value={editingDevice.managementMode || 'DEVICE_OWNER'}
                    onChange={(e) => setEditingDevice({ ...editingDevice, managementMode: e.target.value as ManagementMode })}
                    className="w-full bg-[#11141A] border border-slate-800 text-white rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DEVICE_OWNER">DEVICE OWNER (Android Enterprise Corporativo)</option>
                    <option value="PROFILE_OWNER">PROFILE OWNER (Perfil de Trabalho BYOD)</option>
                    <option value="UNMANAGED">UNMANAGED (Pendente de Inscrição)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingModalOpen(false);
                    setEditingDevice(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
                >
                  Salvar Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: APLICAR POLÍTICA A UM DISPOSITIVO */}
      {isAssignPolicyModalOpen && deviceForPolicy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Aplicar Política Corporativa</span>
              </h3>
              <button onClick={() => setIsAssignPolicyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Selecione a política que regerá os aplicativos e restrições do dispositivo{' '}
              <strong className="text-white">{deviceForPolicy.name}</strong>:
            </p>

            <form onSubmit={handleApplyPolicy} className="space-y-4">
              <select
                value={selectedPolicyIdToApply}
                onChange={(e) => setSelectedPolicyIdToApply(e.target.value)}
                className="w-full bg-[#11141A] border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              >
                {(policies || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.securityModel} - {(p.allowedAppPackageNames || []).length} apps)
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignPolicyModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                >
                  Aplicar Política Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BLOQUEIO / DESBLOQUEIO COM MOTIVO */}
      {lockModalDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {lockModalDevice.status === 'BLOQUEADO' ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Desbloquear Dispositivo</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>Bloquear Dispositivo Corporativo</span>
                  </>
                )}
              </h3>
              <button onClick={() => setLockModalDevice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {lockModalDevice.status === 'BLOQUEADO'
                ? `Confirmar o restabelecimento do uso do dispositivo ${lockModalDevice.name}? O aparelho voltará a sincronizar as políticas corporativas.`
                : `Atenção: Ao bloquear o smartphone ${lockModalDevice.name}, a tela será travada e o colaborador não poderá abrir os aplicativos corporativos.`}
            </p>

            {lockModalDevice.status !== 'BLOQUEADO' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Motivo do Bloqueio:</label>
                <input
                  type="text"
                  value={lockReasonInput}
                  onChange={(e) => setLockReasonInput(e.target.value)}
                  placeholder="Ex: Furto, extravio ou término de contrato"
                  className="w-full bg-[#11141A] border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLockModalDevice(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggleLock}
                className={`font-bold px-4 py-2 rounded-xl text-xs transition ${
                  lockModalDevice.status === 'BLOQUEADO'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {lockModalDevice.status === 'BLOQUEADO' ? 'Confirmar Desbloqueio' : 'Confirmar Bloqueio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
