import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Building2,
  Layers,
  Lock,
  Wifi,
  WifiOff,
  Radio,
  Usb,
  Settings,
  Sparkles,
  Info,
  X,
  Folder,
  FolderLock,
  FolderCheck,
  Slash,
  Share2,
  Check
} from 'lucide-react';
import { Policy, Application, Device, Team } from '../types';
import { useAuth } from '../context/AuthContext';

interface PoliciesViewProps {
  policies: Policy[];
  applications: Application[];
  devices: Device[];
  teams: Team[];
  onSavePolicy: (policy: Policy) => Promise<void>;
  onDeletePolicy: (policyId: string) => Promise<void>;
  onDuplicatePolicy: (policy: Policy) => Promise<void>;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  applications,
  devices,
  teams,
  onSavePolicy,
  onDeletePolicy,
  onDuplicatePolicy
}) => {
  const { canManagePolicies } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicyForDetails, setSelectedPolicyForDetails] = useState<Policy | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy> | null>(null);
  const [newFolderInput, setNewFolderInput] = useState('');
  const [appSearchTermInModal, setAppSearchTermInModal] = useState('');

  const filteredPolicies = policies.filter((p) => {
    if (!p) return false;
    const sTerm = (searchTerm || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    return pName.includes(sTerm) || pDesc.includes(sTerm);
  });

  const handleOpenCreate = () => {
    // Seleciona todos os apps autorizados por padrão
    const defaultAllowed = applications
      .filter((a) => a.status === 'AUTORIZADO')
      .map((a) => a.packageName);

    const defaultBlocked = applications
      .filter((a) => a.status === 'BLOQUEADO')
      .map((a) => a.packageName);

    setEditingPolicy({
      id: `pol-${Date.now()}`,
      name: '',
      description: '',
      securityModel: 'ALLOWLIST',
      allowedAppPackageNames: defaultAllowed,
      blockedAppPackageNames: defaultBlocked,
      associatedDeviceIds: [],
      associatedTeamIds: [],
      allowedFolders: [
        '/storage/emulated/0/MultivaleDocumentos',
        '/storage/emulated/0/Download/Corporativo'
      ],
      blockExternalStorageAccess: true,
      blockSettingsAccess: true,
      blockStatusBarExpand: true,
      blockPlayStore: true,
      blockUsbData: true,
      allowUsbOtgStorage: true,
      blockHotspot: true,
      blockUsbTethering: true,
      blockBluetoothTethering: true,
      blockFactoryReset: true,
      blockDeveloperMode: true,
      enforceKioskMode: true,
      status: 'ATIVO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setAppSearchTermInModal('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy({
      ...policy,
      allowUsbOtgStorage: policy.allowUsbOtgStorage ?? true,
      blockUsbTethering: policy.blockUsbTethering ?? true,
      blockBluetoothTethering: policy.blockBluetoothTethering ?? true
    });
    setAppSearchTermInModal('');
    setIsModalOpen(true);
  };

  const handleToggleAppInPolicy = (pkg: string) => {
    if (!editingPolicy) return;
    const current = editingPolicy.allowedAppPackageNames || [];
    if (current.includes(pkg)) {
      setEditingPolicy({
        ...editingPolicy,
        allowedAppPackageNames: current.filter((p) => p !== pkg),
        blockedAppPackageNames: [...(editingPolicy.blockedAppPackageNames || []), pkg]
      });
    } else {
      setEditingPolicy({
        ...editingPolicy,
        allowedAppPackageNames: [...current, pkg],
        blockedAppPackageNames: (editingPolicy.blockedAppPackageNames || []).filter((p) => p !== pkg)
      });
    }
  };

  const handleRemoveAppFromPolicy = (pkg: string) => {
    if (!editingPolicy) return;
    const current = editingPolicy.allowedAppPackageNames || [];
    setEditingPolicy({
      ...editingPolicy,
      allowedAppPackageNames: current.filter((p) => p !== pkg),
      blockedAppPackageNames: [...(editingPolicy.blockedAppPackageNames || []), pkg]
    });
  };

  // Alternar Roteamento de Internet / Hotspot rapidamente no cartão
  const handleQuickToggleRouting = async (policy: Policy) => {
    const isCurrentlyBlocked = policy.blockHotspot || policy.blockUsbTethering || policy.blockBluetoothTethering;
    const updatedPolicy: Policy = {
      ...policy,
      blockHotspot: !isCurrentlyBlocked,
      blockUsbTethering: !isCurrentlyBlocked,
      blockBluetoothTethering: !isCurrentlyBlocked,
      updatedAt: new Date().toISOString()
    };
    await onSavePolicy(updatedPolicy);
  };

  // Alternar Liberação de Entrada Tipo-C para Pendrive OTG rapidamente no cartão
  const handleQuickToggleUsbOtg = async (policy: Policy) => {
    const isCurrentlyAllowed = policy.allowUsbOtgStorage ?? true;
    const updatedPolicy: Policy = {
      ...policy,
      allowUsbOtgStorage: !isCurrentlyAllowed,
      updatedAt: new Date().toISOString()
    };
    await onSavePolicy(updatedPolicy);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy || !editingPolicy.name) return;

    const fullPolicy: Policy = {
      id: editingPolicy.id || `pol-${Date.now()}`,
      name: editingPolicy.name,
      description: editingPolicy.description || 'Política de segurança corporativa Multivale Telecom',
      securityModel: editingPolicy.securityModel || 'ALLOWLIST',
      allowedAppPackageNames: editingPolicy.allowedAppPackageNames || [],
      blockedAppPackageNames: editingPolicy.blockedAppPackageNames || [],
      associatedDeviceIds: editingPolicy.associatedDeviceIds || [],
      associatedTeamIds: editingPolicy.associatedTeamIds || [],
      allowedFolders: editingPolicy.allowedFolders || [],
      blockExternalStorageAccess: editingPolicy.blockExternalStorageAccess ?? true,
      blockSettingsAccess: editingPolicy.blockSettingsAccess ?? true,
      blockStatusBarExpand: editingPolicy.blockStatusBarExpand ?? true,
      blockPlayStore: editingPolicy.blockPlayStore ?? true,
      blockUsbData: editingPolicy.blockUsbData ?? true,
      allowUsbOtgStorage: editingPolicy.allowUsbOtgStorage ?? true,
      blockHotspot: editingPolicy.blockHotspot ?? true,
      blockUsbTethering: editingPolicy.blockUsbTethering ?? true,
      blockBluetoothTethering: editingPolicy.blockBluetoothTethering ?? true,
      blockFactoryReset: editingPolicy.blockFactoryReset ?? true,
      blockDeveloperMode: editingPolicy.blockDeveloperMode ?? true,
      enforceKioskMode: editingPolicy.enforceKioskMode ?? true,
      status: editingPolicy.status || 'ATIVO',
      createdAt: editingPolicy.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSavePolicy(fullPolicy);
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span>Políticas de Segurança e Restrições</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configuração de perfis de conformidade, bloqueio de roteamento Wi-Fi/USB e seleção de aplicativos liberados.
          </p>
        </div>

        {canManagePolicies && (
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Política</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome da política ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">
          Total: <strong className="text-white">{(filteredPolicies || []).length}</strong> políticas ativas
        </span>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(filteredPolicies || []).map((policy) => {
          const associatedDevices = (devices || []).filter((d) => d && d.policyId === policy.id);
          const associatedTeams = (teams || []).filter((t) => t && t.defaultPolicyId === policy.id);
          const isRoutingBlocked = policy.blockHotspot || policy.blockUsbTethering || policy.blockBluetoothTethering;

          return (
            <div
              key={policy.id}
              className="bg-[#141820] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{policy.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                        {policy.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-blue-400 font-semibold mt-0.5 block">
                      Modelo: {policy.securityModel} (Lista de Permissão)
                    </span>
                  </div>

                  {canManagePolicies && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicatePolicy(policy)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Duplicar Política"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(policy)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Editar Política"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePolicy(policy.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Excluir Política"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
                  {policy.description}
                </p>

                {/* Banner de Roteamento Corporativo / Hotspot */}
                <div
                  className={`p-3 rounded-xl border text-xs mb-3.5 flex items-center justify-between gap-3 transition ${
                    isRoutingBlocked
                      ? 'bg-rose-950/20 border-rose-900/60 text-rose-300'
                      : 'bg-amber-950/20 border-amber-900/60 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isRoutingBlocked
                          ? 'bg-rose-900/40 text-rose-400 border border-rose-800'
                          : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {isRoutingBlocked ? <WifiOff className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[11px] block truncate">
                        {isRoutingBlocked
                          ? 'Roteador & Ancoragem: BLOQUEADO'
                          : 'Roteador & Ponto de Acesso: LIBERADO'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {isRoutingBlocked
                          ? 'Hotspot, USB e Bluetooth bloqueados (evita desvio de dados 4G/5G)'
                          : 'Aparelho pode rotear a internet corporativa'}
                      </span>
                    </div>
                  </div>

                  {canManagePolicies && (
                    <button
                      type="button"
                      onClick={() => handleQuickToggleRouting(policy)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex-shrink-0 ${
                        isRoutingBlocked
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                      }`}
                      title={isRoutingBlocked ? 'Liberar roteamento para este perfil' : 'Bloquear roteamento para proteger a franquia'}
                    >
                      {isRoutingBlocked ? 'Liberar Roteamento' : 'Bloquear Agora'}
                    </button>
                  )}
                </div>

                {/* Destaque: Entrada USB Tipo-C / Pendrive OTG (Arquivos & WhatsApp) */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 mb-3 ${
                    (policy.allowUsbOtgStorage ?? true)
                      ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-900/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        (policy.allowUsbOtgStorage ?? true)
                          ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-900/40 text-rose-400 border border-rose-800'
                      }`}
                    >
                      <Usb className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[11px] block truncate">
                        {(policy.allowUsbOtgStorage ?? true)
                          ? 'Entrada Tipo-C & Pendrive OTG: LIBERADO'
                          : 'Entrada Tipo-C (Pendrive OTG): BLOQUEADO'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {(policy.allowUsbOtgStorage ?? true)
                          ? 'Colaborador pode espetar pendrive USB-C para passar arquivos e enviar p/ WhatsApp'
                          : 'Entrada Tipo-C bloqueada para pendrives. Apenas carregamento de bateria permitido'}
                      </span>
                    </div>
                  </div>

                  {canManagePolicies && (
                    <button
                      type="button"
                      onClick={() => handleQuickToggleUsbOtg(policy)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex-shrink-0 ${
                        (policy.allowUsbOtgStorage ?? true)
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      }`}
                      title={(policy.allowUsbOtgStorage ?? true) ? 'Bloquear entrada Tipo-C para pendrive' : 'Liberar entrada Tipo-C para pendrive OTG'}
                    >
                      {(policy.allowUsbOtgStorage ?? true) ? 'Bloquear Entrada' : 'Liberar Tipo-C'}
                    </button>
                  )}
                </div>

                {/* Badges & Hardware Rules */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(policy.allowUsbOtgStorage ?? true) ? (
                    <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Usb className="w-3 h-3" />
                      <span>Pendrive Tipo-C (OTG) Liberado</span>
                    </span>
                  ) : (
                    <span className="bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Usb className="w-3 h-3" />
                      <span>Pendrive Tipo-C Bloqueado</span>
                    </span>
                  )}
                  {policy.blockPlayStore && (
                    <span className="bg-red-950/40 text-red-400 border border-red-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Play Store Bloqueada
                    </span>
                  )}
                  {policy.blockUsbData && (
                    <span className="bg-red-950/40 text-red-400 border border-red-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      USB Dados Bloqueado
                    </span>
                  )}
                  {policy.blockHotspot && (
                    <span className="bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      <span>Roteador Wi-Fi Bloqueado</span>
                    </span>
                  )}
                  {policy.blockUsbTethering && (
                    <span className="bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Ancoragem USB Bloqueada
                    </span>
                  )}
                  {policy.blockBluetoothTethering && (
                    <span className="bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Bluetooth Tethering Bloqueado
                    </span>
                  )}
                  {policy.blockFactoryReset && (
                    <span className="bg-red-950/40 text-red-400 border border-red-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Reset Fábrica Protegido
                    </span>
                  )}
                  {policy.enforceKioskMode && (
                    <span className="bg-blue-950/40 text-blue-400 border border-blue-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Modo Quiosque (Kiosk)
                    </span>
                  )}
                  {policy.blockExternalStorageAccess && (
                    <span className="bg-amber-950/40 text-amber-400 border border-amber-800/50 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <FolderLock className="w-3 h-3" />
                      <span>Pastas Restritas</span>
                    </span>
                  )}
                  {policy.blockStatusBarExpand && (
                    <span className="bg-purple-950/40 text-purple-400 border border-purple-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Barra de Notificações Travada
                    </span>
                  )}
                  {policy.blockSettingsAccess && (
                    <span className="bg-rose-950/40 text-rose-400 border border-rose-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Configurações Android Bloqueadas
                    </span>
                  )}
                </div>

                {/* Pastas Permitidas Pill */}
                {(policy.allowedFolders || []).length > 0 && (
                  <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 text-xs mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <FolderCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Diretórios & Pastas Liberadas</span>
                      </span>
                      <span className="font-bold text-amber-400 font-mono text-[11px]">
                        {(policy.allowedFolders || []).length} pastas
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {policy.allowedFolders.map((folderPath) => (
                        <span
                          key={folderPath}
                          className="bg-amber-950/40 border border-amber-800/40 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded truncate max-w-full"
                          title={folderPath}
                        >
                          {folderPath.split('/').filter(Boolean).slice(-1)[0] || folderPath}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authorized Apps Count Pill */}
                <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 text-xs mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 font-bold">Aplicativos Permitidos no Aparelho</span>
                    <span className="font-bold text-emerald-400">{(policy.allowedAppPackageNames || []).length} pacotes</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(policy.allowedAppPackageNames || []).slice(0, 5).map((pkg) => {
                      const appObj = applications.find((a) => a.packageName === pkg);
                      return (
                        <span
                          key={pkg}
                          className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700"
                        >
                          {appObj?.name || pkg.split('.').pop()}
                        </span>
                      );
                    })}
                    {(policy.allowedAppPackageNames || []).length > 5 && (
                      <span className="text-[10px] text-slate-500 font-semibold px-1 py-0.5">
                        +{(policy.allowedAppPackageNames || []).length - 5} outros
                      </span>
                    )}
                  </div>
                </div>

                {/* Association Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <strong>{(associatedDevices || []).length}</strong> aparelhos vinculados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <strong>{(associatedTeams || []).length}</strong> equipes associadas
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPolicyForDetails(policy)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Ver Detalhes</span>
                </button>

                {canManagePolicies && (
                  <button
                    onClick={() => handleOpenEdit(policy)}
                    className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Configurar Restrições & Apps</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Criação e Edição de Política */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 custom-scrollbar">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A] sticky top-0 z-10">
              <h3 className="text-sm font-bold text-white">
                {editingPolicy.id?.startsWith('pol-') && !policies.some((p) => p.id === editingPolicy.id)
                  ? 'Cadastrar Nova Política de Segurança'
                  : `Editar Política: ${editingPolicy.name}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome da Política *</label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.name || ''}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Operações Fibra Óptica - Modo Estrito"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Modelo de Segurança *</label>
                  <select
                    value={editingPolicy.securityModel || 'ALLOWLIST'}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, securityModel: e.target.value as 'ALLOWLIST' | 'DENYLIST' })
                    }
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="ALLOWLIST">ALLOWLIST (Apenas apps marcados podem ser abertos)</option>
                    <option value="DENYLIST">DENYLIST (Todos liberados, exceto bloqueados)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição do Perfil</label>
                <textarea
                  rows={2}
                  value={editingPolicy.description || ''}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Finalidade das restrições para a equipe associada..."
                />
              </div>

              {/* ========================================================================= */}
              {/* DESTAQUE: CONTROLE DE CONECTIVIDADE & BLOQUEIO DE ROTEAMENTO (HOTSPOT) */}
              {/* ========================================================================= */}
              <div className="bg-[#11141A] p-4 rounded-xl border border-rose-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <WifiOff className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Bloqueio de Roteamento de Internet & Ponto de Acesso</h4>
                      <p className="text-[10px] text-slate-400">
                        Impede que o colaborador compartilhe o plano de dados móveis 4G/5G corporativo da Multivale com computadores, consoles ou outros celulares.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPolicy({
                          ...editingPolicy,
                          blockHotspot: true,
                          blockUsbTethering: true,
                          blockBluetoothTethering: true
                        })
                      }
                      className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                    >
                      Bloquear Tudo (Recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPolicy({
                          ...editingPolicy,
                          blockHotspot: false,
                          blockUsbTethering: false,
                          blockBluetoothTethering: false
                        })
                      }
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                    >
                      Liberar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-200 text-[11px] hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockHotspot ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockHotspot: e.target.checked })}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-200">Bloquear Roteador Wi-Fi (Hotspot)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-200 text-[11px] hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockUsbTethering ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockUsbTethering: e.target.checked })}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-200">Bloquear Ancoragem USB</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-200 text-[11px] hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockBluetoothTethering ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockBluetoothTethering: e.target.checked })}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-200">Bloquear Roteamento Bluetooth</span>
                  </label>
                </div>
              </div>

              {/* Hardware Restrictions Grid */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-2">
                  Outras Travas do Sistema Operacional Android Enterprise
                </span>

                {/* Opção Específica para Entrada Tipo-C / Pendrive OTG & WhatsApp */}
                <div className="p-3.5 bg-[#11141A] rounded-xl border border-slate-800 space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <Usb className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          Liberar Entrada USB Tipo-C para Pendrive OTG (Arquivos & WhatsApp)
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Permite plugar pendrive Tipo-C para ler, transferir documentos e enviar direto ao WhatsApp
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={editingPolicy.allowUsbOtgStorage ?? true}
                        onChange={(e) => setEditingPolicy({ ...editingPolicy, allowUsbOtgStorage: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    <strong className="text-emerald-400">Finalidade Operacional:</strong> Quando ativado, os técnicos e consultores de campo podem conectar qualquer pendrive ou leitor USB Tipo-C via OTG no celular para passar arquivos, medições ópticas e projetos, permitindo o envio imediato destes arquivos via WhatsApp Corporativo para os clientes e supervisor sem precisar de computador.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#11141A] p-4 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockPlayStore ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockPlayStore: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloquear Google Play Store</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockUsbData ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockUsbData: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloquear Transferência USB</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockFactoryReset ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockFactoryReset: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloquear Reset de Fábrica</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockDeveloperMode ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockDeveloperMode: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloquear Modo Desenvolvedor / ADB</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.enforceKioskMode ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, enforceKioskMode: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-blue-300">Travar Celular no Modo Kiosk</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockStatusBarExpand ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockStatusBarExpand: e.target.checked })}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Bloquear Barra de Notificações / Cortina</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockSettingsAccess ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockSettingsAccess: e.target.checked })}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                    />
                    <span>Bloquear Configurações do Android</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingPolicy.blockExternalStorageAccess ?? true}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, blockExternalStorageAccess: e.target.checked })
                      }
                      className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-amber-300">Restringir Pastas do Armazenamento</span>
                  </label>
                </div>
              </div>

              {/* Pastas e Diretórios Autorizados */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4" />
                      <span>Pastas e Diretórios Liberados no Celular</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      O colaborador terá acesso exclusivo às pastas listadas abaixo. Todas as outras pastas do sistema estarão travadas.
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                    {editingPolicy.allowedFolders?.length || 0} pastas liberadas
                  </span>
                </div>

                {/* Lista de Pastas Adicionadas */}
                <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 space-y-2 mb-2">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {(editingPolicy.allowedFolders || []).map((folderPath, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="font-mono text-slate-200 text-[11px] truncate">{folderPath}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingPolicy.allowedFolders || []).filter((_, i) => i !== idx);
                            setEditingPolicy({ ...editingPolicy, allowedFolders: updated });
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 transition"
                          title="Remover Pasta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(editingPolicy.allowedFolders?.length || 0) === 0 && (
                      <p className="text-[11px] text-slate-500 italic p-1">
                        Nenhuma pasta cadastrada. Todo o explorador de arquivos estará bloqueado para o usuário.
                      </p>
                    )}
                  </div>

                  {/* Input para Adicionar Nova Pasta */}
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Ex: /storage/emulated/0/MultivaleDocumentos ou /Download"
                      value={newFolderInput}
                      onChange={(e) => setNewFolderInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newFolderInput.trim()) {
                            const current = editingPolicy.allowedFolders || [];
                            if (!current.includes(newFolderInput.trim())) {
                              setEditingPolicy({
                                ...editingPolicy,
                                allowedFolders: [...current, newFolderInput.trim()]
                              });
                            }
                            setNewFolderInput('');
                          }
                        }
                      }}
                      className="flex-1 bg-[#141820] border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFolderInput.trim()) {
                          const current = editingPolicy.allowedFolders || [];
                          if (!current.includes(newFolderInput.trim())) {
                            setEditingPolicy({
                              ...editingPolicy,
                              allowedFolders: [...current, newFolderInput.trim()]
                            });
                          }
                          setNewFolderInput('');
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Pasta</span>
                    </button>
                  </div>

                  {/* Sugestões Rápidas de Pastas */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500">Sugestões rápidas:</span>
                    {[
                      '/storage/emulated/0/MultivaleDocumentos',
                      '/storage/emulated/0/MultivaleFotosCampo',
                      '/storage/emulated/0/Download/Corporativo',
                      '/storage/emulated/0/DCIM/Camera'
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          const current = editingPolicy.allowedFolders || [];
                          if (!current.includes(sug)) {
                            setEditingPolicy({
                              ...editingPolicy,
                              allowedFolders: [...current, sug]
                            });
                          }
                        }}
                        className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                      >
                        +{sug.split('/').pop()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SELEÇÃO E GERENCIAMENTO DE APLICATIVOS LIBERADOS */}
              {/* ========================================================================= */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Aplicativos Liberados no Celular do Colaborador
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Marque ou desmarque os aplicativos que os colaboradores associados a esta política poderão abrir.
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                    {editingPolicy.allowedAppPackageNames?.length || 0} de {(applications || []).length} liberados
                  </span>
                </div>

                {/* Filtro Rápido de Aplicativo no Modal */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filtrar apps (ex: whatsapp, chrome, maps)..."
                      value={appSearchTermInModal}
                      onChange={(e) => setAppSearchTermInModal(e.target.value)}
                      className="w-full bg-[#11141A] border border-slate-800 text-white text-[11px] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const all = applications.map((a) => a.packageName);
                        setEditingPolicy({ ...editingPolicy, allowedAppPackageNames: all, blockedAppPackageNames: [] });
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition"
                    >
                      Liberar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const all = applications.map((a) => a.packageName);
                        setEditingPolicy({ ...editingPolicy, allowedAppPackageNames: [], blockedAppPackageNames: all });
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition"
                    >
                      Remover Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const auto = applications.filter((a) => a.status === 'AUTORIZADO').map((a) => a.packageName);
                        const block = applications.filter((a) => a.status === 'BLOQUEADO').map((a) => a.packageName);
                        setEditingPolicy({ ...editingPolicy, allowedAppPackageNames: auto, blockedAppPackageNames: block });
                      }}
                      className="text-[10px] bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 px-2 py-1 rounded-lg transition"
                    >
                      Padrão do Catálogo
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto bg-[#11141A] p-3 rounded-xl border border-slate-800 custom-scrollbar">
                  {applications
                    .filter((app) => {
                      if (!app) return false;
                      if (!appSearchTermInModal) return true;
                      const modalSTerm = (appSearchTermInModal || '').toLowerCase();
                      const appName = (app.name || '').toLowerCase();
                      const appPkg = (app.packageName || '').toLowerCase();
                      return appName.includes(modalSTerm) || appPkg.includes(modalSTerm);
                    })
                    .map((app) => {
                      const isChecked = editingPolicy.allowedAppPackageNames?.includes(app.packageName);
                      return (
                        <div
                          key={app.id}
                          className={`flex items-center justify-between p-2 rounded-lg transition ${
                            isChecked
                              ? 'bg-emerald-950/30 border border-emerald-800/50'
                              : 'hover:bg-slate-800/40 border border-transparent'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAppInPolicy(app.packageName)}
                              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{app.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {app.packageName}
                              </span>
                            </div>
                          </label>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                app.status === 'AUTORIZADO' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                              }`}
                            >
                              {app.status}
                            </span>

                            {isChecked ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveAppFromPolicy(app.packageName)}
                                className="text-slate-500 hover:text-red-400 p-1 transition"
                                title="Remover este app da política"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleAppInPolicy(app.packageName)}
                                className="text-slate-500 hover:text-emerald-400 p-1 transition"
                                title="Adicionar este app à política"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-4 bg-[#11141A] border-t border-slate-800 -mx-5 -mb-5 mt-4 flex justify-end gap-2 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-blue-900/30"
                >
                  Salvar Política
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Detalhes da Política */}
      {/* ------------------------------------------------------------- */}
      {selectedPolicyForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">{selectedPolicyForDetails.name}</h3>
              </div>
              <button onClick={() => setSelectedPolicyForDetails(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">{selectedPolicyForDetails.description}</p>

              {/* Status de Roteamento */}
              <div className="p-3 bg-[#11141A] rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Controle de Conectividade e Roteamento</span>
                </span>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Wi-Fi Hotspot:</span>
                    <strong className={selectedPolicyForDetails.blockHotspot ? 'text-rose-400' : 'text-emerald-400'}>
                      {selectedPolicyForDetails.blockHotspot ? 'BLOQUEADO' : 'LIBERADO'}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ancoragem USB:</span>
                    <strong className={selectedPolicyForDetails.blockUsbTethering ? 'text-rose-400' : 'text-emerald-400'}>
                      {selectedPolicyForDetails.blockUsbTethering ? 'BLOQUEADO' : 'LIBERADO'}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Bluetooth:</span>
                    <strong className={selectedPolicyForDetails.blockBluetoothTethering ? 'text-rose-400' : 'text-emerald-400'}>
                      {selectedPolicyForDetails.blockBluetoothTethering ? 'BLOQUEADO' : 'LIBERADO'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status da Entrada Tipo-C / Pendrive OTG */}
              <div className="p-3 bg-[#11141A] rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Usb className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Entrada USB Tipo-C para Pendrive OTG</span>
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      (selectedPolicyForDetails.allowUsbOtgStorage ?? true)
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {(selectedPolicyForDetails.allowUsbOtgStorage ?? true) ? 'LIBERADO' : 'BLOQUEADO'}
                  </span>
                </span>
                <p className="text-[11px] text-slate-300">
                  {(selectedPolicyForDetails.allowUsbOtgStorage ?? true)
                    ? 'Colaborador pode conectar pendrive USB-C para transferir arquivos e enviar direto para o WhatsApp Corporativo.'
                    : 'Entrada Tipo-C restrita a recarga. Transferência de arquivos via pendrive OTG bloqueada.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                  Pacotes Android Autorizados ({(selectedPolicyForDetails.allowedAppPackageNames || []).length})
                </span>
                <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {(selectedPolicyForDetails.allowedAppPackageNames || []).map((pkg) => {
                    const appObj = applications.find((a) => a.packageName === pkg);
                    return (
                      <div key={pkg} className="font-mono text-[11px] text-emerald-400 flex items-center justify-between gap-1.5 py-0.5 border-b border-slate-900">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-bold text-white text-xs">{appObj?.name || pkg}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate max-w-[160px]">{pkg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(selectedPolicyForDetails.allowedFolders || []).length > 0 && (
                <div>
                  <span className="text-[10px] text-amber-500 uppercase font-bold block mb-1.5 flex items-center gap-1.5">
                    <FolderCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pastas e Diretórios Liberados ({(selectedPolicyForDetails.allowedFolders || []).length})</span>
                  </span>
                  <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                    {(selectedPolicyForDetails.allowedFolders || []).map((folder) => (
                      <div key={folder} className="font-mono text-[11px] text-amber-300 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span>{folder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#11141A] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPolicyForDetails(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
