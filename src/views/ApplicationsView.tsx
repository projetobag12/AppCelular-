import React, { useState } from 'react';
import {
  Grid,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Smartphone,
  Info,
  X,
  ExternalLink,
  Check,
  Share2,
  Users
} from 'lucide-react';
import { Application, AppStatus, AppCategory, Policy } from '../types';
import { useAuth } from '../context/AuthContext';

interface ApplicationsViewProps {
  applications: Application[];
  policies?: Policy[];
  onSaveApplication: (app: Application) => Promise<void>;
  onDeleteApplication: (appId: string) => Promise<void>;
  onToggleStatus: (app: Application) => Promise<void>;
  onAssignAppToPolicies?: (packageName: string, targetPolicyIds: string[]) => Promise<void>;
  onRemoveAppFromPolicies?: (packageName: string, targetPolicyIds?: string[]) => Promise<void>;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  policies = [],
  onSaveApplication,
  onDeleteApplication,
  onToggleStatus,
  onAssignAppToPolicies,
  onRemoveAppFromPolicies
}) => {
  const { canManageApps } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal de Criação / Edição de Aplicativo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<Application> | null>(null);
  const [selectedPoliciesForNewApp, setSelectedPoliciesForNewApp] = useState<string[]>([]);

  // Modal de Distribuição para Colaboradores (Vincular / Desvincular de Políticas)
  const [appForPolicyAssignment, setAppForPolicyAssignment] = useState<Application | null>(null);
  const [selectedPolicyIdsForApp, setSelectedPolicyIdsForApp] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Confirmação de exclusão
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  const categories: AppCategory[] = [
    'Comunicação',
    'Produtividade',
    'Navegação e Mapas',
    'Operações e Campo',
    'Vendas e CRM',
    'Utilidades',
    'Redes Sociais',
    'Streaming e Vídeo',
    'Jogos e Lazer'
  ];

  const popularPresets = [
    { name: 'WhatsApp Corporativo', pkg: 'com.whatsapp', cat: 'Comunicação', status: 'AUTORIZADO', desc: 'Comunicação oficial e suporte a clientes' },
    { name: 'Google Maps', pkg: 'com.google.android.apps.maps', cat: 'Navegação e Mapas', status: 'AUTORIZADO', desc: 'Navegação GPS e localização de rotas' },
    { name: 'Waze GPS & Trânsito', pkg: 'com.waze', cat: 'Navegação e Mapas', status: 'AUTORIZADO', desc: 'Rotas em tempo real e desvio de trânsito' },
    { name: 'Microsoft Teams', pkg: 'com.microsoft.teams', cat: 'Comunicação', status: 'AUTORIZADO', desc: 'Reuniões, chamadas e alinhamentos corporativos' },
    { name: 'Multivale OS Campo', pkg: 'br.com.multivale.campo.ordemservico', cat: 'Operações e Campo', status: 'AUTORIZADO', desc: 'Ordens de serviço de fibra óptica e vistorias técnicas' },
    { name: 'Google Chrome', pkg: 'com.android.chrome', cat: 'Produtividade', status: 'AUTORIZADO', desc: 'Navegador web com filtros corporativos' },
    { name: 'Uber Driver / Passageiro', pkg: 'com.ubercab', cat: 'Navegação e Mapas', status: 'AUTORIZADO', desc: 'Mobilidade corporativa para consultores' },
    { name: 'Slack Corporativo', pkg: 'com.Slack', cat: 'Comunicação', status: 'AUTORIZADO', desc: 'Canais de comunicação técnica e suporte TI' },
    { name: 'Spotify Music', pkg: 'com.spotify.music', cat: 'Streaming e Vídeo', status: 'BLOQUEADO', desc: 'Streaming de áudio não essencial' },
    { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', cat: 'Redes Sociais', status: 'BLOQUEADO', desc: 'Rede social recreativa bloqueada' },
    { name: 'YouTube', pkg: 'com.google.android.youtube', cat: 'Streaming e Vídeo', status: 'BLOQUEADO', desc: 'Streaming recreativo bloqueado em horário de trabalho' }
  ];

  const filteredApps = applications.filter((app) => {
    if (!app) return false;
    const sTerm = (searchTerm || '').toLowerCase();
    const appName = (app.name || '').toLowerCase();
    const appPkg = (app.packageName || '').toLowerCase();
    const appDesc = (app.description || '').toLowerCase();

    const matchesSearch =
      appName.includes(sTerm) ||
      appPkg.includes(sTerm) ||
      appDesc.includes(sTerm);

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || app.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingApp({
      id: `app-${Date.now()}`,
      name: '',
      packageName: 'com.',
      category: 'Operações e Campo',
      description: '',
      status: 'AUTORIZADO',
      riskLevel: 'BAIXO',
      createdAt: new Date().toISOString()
    });
    // Por padrão marcar todas as políticas para que colaboradores já recebam o app
    setSelectedPoliciesForNewApp(policies.map((p) => p.id));
    setIsModalOpen(true);
  };

  const handleSelectPreset = (preset: typeof popularPresets[0]) => {
    setEditingApp({
      id: `app-${Date.now()}`,
      name: preset.name,
      packageName: preset.pkg,
      category: preset.cat as AppCategory,
      description: preset.desc,
      status: preset.status as AppStatus,
      riskLevel: preset.status === 'AUTORIZADO' ? 'BAIXO' : 'ALTO',
      createdAt: new Date().toISOString()
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editingApp.name || !editingApp.packageName) return;

    const fullApp: Application = {
      id: editingApp.id || `app-${Date.now()}`,
      name: editingApp.name,
      packageName: editingApp.packageName.trim(),
      category: editingApp.category || 'Operações e Campo',
      description: editingApp.description || 'Aplicativo gerenciado pelo Gestor Multivale',
      status: editingApp.status || 'AUTORIZADO',
      riskLevel: editingApp.status === 'AUTORIZADO' ? 'BAIXO' : 'ALTO',
      createdAt: editingApp.createdAt || new Date().toISOString()
    };

    await onSaveApplication(fullApp);

    // Se o aplicativo for autorizado e o Gestor selecionou políticas, vinculá-lo imediatamente
    if (fullApp.status === 'AUTORIZADO' && selectedPoliciesForNewApp.length > 0 && onAssignAppToPolicies) {
      await onAssignAppToPolicies(fullApp.packageName, selectedPoliciesForNewApp);
    }

    setFeedbackMessage(`Aplicativo "${fullApp.name}" salvo com sucesso no catálogo corporativo.`);
    setTimeout(() => setFeedbackMessage(null), 4000);

    setIsModalOpen(false);
    setEditingApp(null);
  };

  // Abrir Modal de Gerenciamento de Políticas para um Aplicativo
  const handleOpenPolicyAssignment = (app: Application) => {
    setAppForPolicyAssignment(app);
    // Verificar quais políticas atualmente contêm o pacote
    const currentActivePolicies = (policies || [])
      .filter((p) => p && p.allowedAppPackageNames?.includes(app.packageName))
      .map((p) => p.id);
    setSelectedPolicyIdsForApp(currentActivePolicies);
  };

  // Salvar vinculação de políticas do app
  const handleSavePolicyAssignment = async () => {
    if (!appForPolicyAssignment) return;

    if (onAssignAppToPolicies && onRemoveAppFromPolicies) {
      // 1. Adicionar nas políticas selecionadas
      if (selectedPolicyIdsForApp.length > 0) {
        await onAssignAppToPolicies(appForPolicyAssignment.packageName, selectedPolicyIdsForApp);
      }
      // 2. Remover das políticas desmarcadas
      const unselectedPolicies = policies
        .filter((p) => !selectedPolicyIdsForApp.includes(p.id))
        .map((p) => p.id);

      if (unselectedPolicies.length > 0) {
        await onRemoveAppFromPolicies(appForPolicyAssignment.packageName, unselectedPolicies);
      }
    }

    setFeedbackMessage(`Políticas atualizadas para o aplicativo ${appForPolicyAssignment.name}.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
    setAppForPolicyAssignment(null);
  };

  // Liberar para todos os colaboradores com 1 clique
  const handleAssignToAllCollaborators = async (app: Application) => {
    if (onAssignAppToPolicies) {
      const allPolicyIds = policies.map((p) => p.id);
      await onAssignAppToPolicies(app.packageName, allPolicyIds);
      setFeedbackMessage(`"${app.name}" liberado para todos os smartphones dos colaboradores!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Remover de todos os colaboradores com 1 clique
  const handleRemoveFromAllCollaborators = async (app: Application) => {
    if (onRemoveAppFromPolicies) {
      await onRemoveAppFromPolicies(app.packageName);
      setFeedbackMessage(`"${app.name}" removido de todos os smartphones dos colaboradores!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Confirmar exclusão do aplicativo do catálogo
  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    // Remover primeiro das políticas
    if (onRemoveAppFromPolicies) {
      await onRemoveAppFromPolicies(appToDelete.packageName);
    }
    // Deletar do catálogo
    await onDeleteApplication(appToDelete.id);
    setFeedbackMessage(`Aplicativo "${appToDelete.name}" removido com sucesso.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
    setAppToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/50">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-emerald-400" />
            <span>Gestão de Aplicativos dos Colaboradores</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Adicione aplicativos para os colaboradores, defina permissões por política ou remova com um clique.
          </p>
        </div>

        {canManageApps && (
          <button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Aplicativo</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141820] border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar app por nome ou pacote (ex: com.whatsapp)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Todos os Status (Autorizados e Bloqueados)</option>
              <option value="AUTORIZADO">Apenas AUTORIZADOS</option>
              <option value="BLOQUEADO">Apenas BLOQUEADOS</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counters & Gestor Guidance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {applications.filter((a) => a.status === 'AUTORIZADO').length} Autorizados
            </span>
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              {(applications || []).filter((a) => a && a.status === 'BLOQUEADO').length} Bloqueados
            </span>
          </div>
          <span className="text-slate-400">
            Mostrando <strong className="text-white">{(filteredApps || []).length}</strong> de {(applications || []).length} aplicativos cadastrados
          </span>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isAllowed = app.status === 'AUTORIZADO';
          const attachedPolicies = (policies || []).filter((p) => p && p.allowedAppPackageNames?.includes(app.packageName));
          const isAttachedToAll = (policies || []).length > 0 && (attachedPolicies || []).length === (policies || []).length;

          return (
            <div
              key={app.id}
              className={`bg-[#141820] border rounded-2xl p-4.5 flex flex-col justify-between transition shadow-sm ${
                isAllowed ? 'border-slate-800 hover:border-emerald-500/40' : 'border-red-900/30 hover:border-red-600/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isAllowed
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{app.name}</h3>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isAllowed
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                        : 'bg-red-950/60 text-red-400 border-red-800/80'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                {/* Package Name */}
                <div className="bg-[#11141A] p-2.5 rounded-xl border border-slate-800/80 mb-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Pacote Android</span>
                  <p className="text-[11px] font-mono font-semibold text-blue-400 break-all select-all">
                    {app.packageName}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {app.description}
                </p>

                {/* Status de Distribuição para os Colaboradores */}
                {isAllowed && (
                  <div className="bg-[#11141A] p-2.5 rounded-xl border border-slate-800 text-[11px] mb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>Presença nos Telefones:</span>
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          (attachedPolicies || []).length > 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {(attachedPolicies || []).length} de {(policies || []).length} políticas
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(attachedPolicies || []).map((pol) => (
                        <span
                          key={pol.id}
                          className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-medium border border-slate-700 truncate max-w-[140px]"
                          title={pol.name}
                        >
                          {pol.name}
                        </span>
                      ))}
                      {(attachedPolicies || []).length === 0 && (
                        <span className="text-amber-400/80 text-[10px] italic">
                          Não atribuído a nenhuma política. Os colaboradores não verão este app.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações do Gestor */}
              {canManageApps && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  {/* Botões de Ação para Políticas */}
                  {isAllowed && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleOpenPolicyAssignment(app)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1"
                        title="Escolher em quais políticas o app estará liberado"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Gerenciar Políticas</span>
                      </button>

                      {isAttachedToAll ? (
                        <button
                          onClick={() => handleRemoveFromAllCollaborators(app)}
                          className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/70 text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1"
                          title="Remover este app de todos os aparelhos dos colaboradores"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Remover de Todos</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignToAllCollaborators(app)}
                          className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/70 text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1"
                          title="Liberar este app em todos os telefones de colaboradores"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Liberar p/ Todos</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Barra de Ações Rápidas */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => onToggleStatus(app)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAllowed
                          ? 'bg-red-950/50 hover:bg-red-900/70 text-red-400 border border-red-800/60'
                          : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {isAllowed ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Bloquear App</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Liberar App</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingApp({ ...app });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Editar Detalhes"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAppToDelete(app)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Remover do Catálogo e Desinstalar dos Colaboradores"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Gerenciar Aplicativo nas Políticas dos Colaboradores */}
      {/* ------------------------------------------------------------- */}
      {appForPolicyAssignment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Liberar para Colaboradores</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{appForPolicyAssignment.name}</p>
                </div>
              </div>
              <button onClick={() => setAppForPolicyAssignment(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300">
                Selecione em quais perfis e políticas de colaboradores o aplicativo{' '}
                <strong className="text-white">{appForPolicyAssignment.name}</strong> estará disponível nos smartphones:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {policies.map((policy) => {
                  const isChecked = selectedPolicyIdsForApp.includes(policy.id);
                  return (
                    <label
                      key={policy.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-800 text-white'
                          : 'bg-[#11141A] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPolicyIdsForApp([...selectedPolicyIdsForApp, policy.id]);
                          } else {
                            setSelectedPolicyIdsForApp(selectedPolicyIdsForApp.filter((id) => id !== policy.id));
                          }
                        }}
                        className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block text-xs">{policy.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{policy.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Botões Rápidos de Seleção */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPolicyIdsForApp(policies.map((p) => p.id))}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
                >
                  Marcar Todas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPolicyIdsForApp([])}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
                >
                  Desmarcar Todas
                </button>
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAppForPolicyAssignment(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePolicyAssignment}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition shadow"
                >
                  Salvar Distribuição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Cadastro / Edição de Aplicativo */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <h3 className="text-sm font-bold text-white">Cadastrar Aplicativo para Colaboradores</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {/* Presets Rápidos */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Preenchimento Rápido com Apps Comuns:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {popularPresets.map((p) => (
                    <button
                      key={p.pkg}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="bg-[#11141A] hover:bg-emerald-950/40 hover:border-emerald-700/60 border border-slate-800 text-slate-300 hover:text-emerald-300 px-2 py-1 rounded-lg text-[11px] font-medium transition"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome do Aplicativo *</label>
                <input
                  type="text"
                  required
                  value={editingApp.name || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: WhatsApp Corporativo"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Android Package Name (Identificador do Pacote) *
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.packageName || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, packageName: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: com.whatsapp ou br.com.multivale.campo"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Identificador exato do APK no Android (ex: com.whatsapp, com.waze, com.google.android.apps.maps)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={editingApp.category || 'Operações e Campo'}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value as AppCategory })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Status Inicial *</label>
                  <select
                    value={editingApp.status || 'AUTORIZADO'}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as AppStatus })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AUTORIZADO">AUTORIZADO (Permitido no Celular)</option>
                    <option value="BLOQUEADO">BLOQUEADO (Proibido no Celular)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição / Finalidade Corporativa</label>
                <textarea
                  rows={2}
                  value={editingApp.description || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Justificativa de uso operacional..."
                />
              </div>

              {/* Atribuição Imediata a Políticas de Colaboradores */}
              <div className="bg-[#11141A] p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                  Liberar Imediatamente para as Políticas dos Colaboradores:
                </span>
                <p className="text-[10px] text-slate-400 mb-2">
                  Marque as políticas de smartphones que já devem receber este aplicativo liberado assim que você salvar.
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {policies.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedPoliciesForNewApp.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPoliciesForNewApp([...selectedPoliciesForNewApp, p.id]);
                          } else {
                            setSelectedPoliciesForNewApp(selectedPoliciesForNewApp.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#11141A] border-t border-slate-800 -mx-5 -mb-5 mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-emerald-900/30"
                >
                  Salvar Aplicativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Confirmação de Exclusão de Aplicativo */}
      {/* ------------------------------------------------------------- */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-rose-900/80 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Remover Aplicativo</h3>
              <p className="text-xs text-rose-400 font-mono mt-1">{appToDelete.name} ({appToDelete.packageName})</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#11141A] p-3 rounded-xl border border-slate-800">
              Tem certeza que deseja remover este aplicativo do catálogo da Multivale? Ele será removido automaticamente de todas as políticas e dos smartphones dos colaboradores.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAppToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs transition shadow"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
