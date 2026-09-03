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
  Usb,
  Settings,
  Sparkles,
  Info,
  X
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

  const filteredPolicies = policies.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      blockPlayStore: true,
      blockUsbData: true,
      blockHotspot: true,
      blockFactoryReset: true,
      blockDeveloperMode: true,
      enforceKioskMode: true,
      status: 'ATIVO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy({ ...policy });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy || !editingPolicy.name) return;

    const fullPolicy: Policy = {
      id: editingPolicy.id || `pol-${Date.now()}`,
      name: editingPolicy.name,
      description: editingPolicy.description || 'Política corporativa de aplicativos da Multivale',
      securityModel: editingPolicy.securityModel || 'ALLOWLIST',
      allowedAppPackageNames: editingPolicy.allowedAppPackageNames || [],
      blockedAppPackageNames: editingPolicy.blockedAppPackageNames || [],
      associatedDeviceIds: editingPolicy.associatedDeviceIds || [],
      associatedTeamIds: editingPolicy.associatedTeamIds || [],
      blockPlayStore: editingPolicy.blockPlayStore ?? true,
      blockUsbData: editingPolicy.blockUsbData ?? true,
      blockHotspot: editingPolicy.blockHotspot ?? true,
      blockFactoryReset: editingPolicy.blockFactoryReset ?? true,
      blockDeveloperMode: editingPolicy.blockDeveloperMode ?? true,
      enforceKioskMode: editingPolicy.enforceKioskMode ?? true,
      autoLaunchAppPackage: editingPolicy.autoLaunchAppPackage,
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
            <span>Políticas de Aplicativos & Restrições</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Definição de Allowlist de aplicativos corporativos autorizados e regras de sistema para os smartphones.
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

      {/* Filter and Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou regras da política..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPolicies.map((policy) => {
          const associatedDevices = devices.filter((d) => d.policyId === policy.id);
          const associatedTeams = teams.filter((t) => t.defaultPolicyId === policy.id);

          return (
            <div
              key={policy.id}
              className="bg-[#141820] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{policy.name}</h3>
                      <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                        Modelo: {policy.securityModel} (Lista de Permissão)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      policy.status === 'ATIVO'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {policy.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {policy.description}
                </p>

                {/* Badges & Hardware Rules */}
                <div className="flex flex-wrap gap-1.5 mb-4">
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
                    <span className="bg-red-950/40 text-red-400 border border-red-800/50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Roteador Wi-Fi Bloqueado
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
                </div>

                {/* Authorized Apps Count Pill */}
                <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 text-xs mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 font-bold">Aplicativos Permitidos no Aparelho</span>
                    <span className="font-bold text-emerald-400">{policy.allowedAppPackageNames.length} pacotes</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {policy.allowedAppPackageNames.slice(0, 5).map((pkg) => {
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
                    {policy.allowedAppPackageNames.length > 5 && (
                      <span className="text-[10px] text-slate-500 font-semibold px-1 py-0.5">
                        +{policy.allowedAppPackageNames.length - 5} outros
                      </span>
                    )}
                  </div>
                </div>

                {/* Association Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <strong>{associatedDevices.length}</strong> aparelhos vinculados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <strong>{associatedTeams.length}</strong> equipes associadas
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicatePolicy(policy)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Duplicar Política"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(policy)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Editar Política"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePolicy(policy.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Excluir Política"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Criar / Editar Política */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 custom-scrollbar">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A] sticky top-0 z-10">
              <h3 className="text-sm font-bold text-white">
                {editingPolicy.id?.includes('pol-') ? 'Editar Política Corporativa' : 'Criar Nova Política'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome da Política *</label>
                <input
                  type="text"
                  required
                  value={editingPolicy.name || ''}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Celular Operacional - Campo & Fibra"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingPolicy.description || ''}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Finalidade e escopo desta política de segurança..."
                />
              </div>

              {/* Hardware & System Restrictions */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-2">
                  Restrições de Hardware & Sistema (Android Enterprise)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
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
                      checked={editingPolicy.blockHotspot ?? true}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, blockHotspot: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bloquear Roteador Wi-Fi (Hotspot)</span>
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
                    <span>Ativar Modo Quiosque (Kiosk)</span>
                  </label>
                </div>
              </div>

              {/* Granular App Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Seleção de Aplicativos Liberados para o Celular
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Marque os aplicativos que os colaboradores desta política poderão abrir no celular.
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800">
                    {editingPolicy.allowedAppPackageNames?.length || 0} permitidos
                  </span>
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const all = applications.map((a) => a.packageName);
                      setEditingPolicy({ ...editingPolicy, allowedAppPackageNames: all, blockedAppPackageNames: [] });
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition"
                  >
                    Marcar Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const all = applications.map((a) => a.packageName);
                      setEditingPolicy({ ...editingPolicy, allowedAppPackageNames: [], blockedAppPackageNames: all });
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition"
                  >
                    Desmarcar Todos
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

                <div className="space-y-1.5 max-h-56 overflow-y-auto bg-[#11141A] p-3 rounded-xl border border-slate-800 custom-scrollbar">
                  {applications.map((app) => {
                    const isChecked = editingPolicy.allowedAppPackageNames?.includes(app.packageName);
                    return (
                      <label
                        key={app.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-blue-950/30 border border-blue-800/50' : 'hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAppInPolicy(app.packageName)}
                            className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{app.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">{app.packageName}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            app.status === 'AUTORIZADO' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {app.category}
                        </span>
                      </label>
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

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                  Pacotes Android Autorizados ({selectedPolicyForDetails.allowedAppPackageNames.length})
                </span>
                <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {selectedPolicyForDetails.allowedAppPackageNames.map((pkg) => (
                    <div key={pkg} className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pkg}</span>
                    </div>
                  ))}
                </div>
              </div>
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
