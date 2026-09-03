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
  X
} from 'lucide-react';
import { Application, AppStatus, AppCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface ApplicationsViewProps {
  applications: Application[];
  onSaveApplication: (app: Application) => Promise<void>;
  onDeleteApplication: (appId: string) => Promise<void>;
  onToggleStatus: (app: Application) => Promise<void>;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onSaveApplication,
  onDeleteApplication,
  onToggleStatus
}) => {
  const { canManageApps } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<Application> | null>(null);

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
    { name: 'Uber Driver / Passageiro', pkg: 'com.ubercab', cat: 'Navegação e Mapas', status: 'AUTORIZADO', desc: 'Mobilidade corporativa' },
    { name: 'Slack Corporativo', pkg: 'com.Slack', cat: 'Comunicação', status: 'AUTORIZADO', desc: 'Mensagens e canais de TI' },
    { name: 'Spotify Music', pkg: 'com.spotify.music', cat: 'Streaming e Vídeo', status: 'BLOQUEADO', desc: 'Streaming de áudio recreativo' },
    { name: 'Twitter / X', pkg: 'com.twitter.android', cat: 'Redes Sociais', status: 'BLOQUEADO', desc: 'Rede social externa não corporativa' },
    { name: 'Mercado Livre', pkg: 'com.mercadolibre', cat: 'Utilidades', status: 'BLOQUEADO', desc: 'Comércio eletrônico pessoal' },
    { name: 'Google Chrome', pkg: 'com.android.chrome', cat: 'Produtividade', status: 'AUTORIZADO', desc: 'Navegador Web institucional com filtros' }
  ];

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());

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
      packageName: editingApp.packageName.trim().toLowerCase(),
      category: editingApp.category || 'Utilidades',
      description: editingApp.description || 'Aplicativo cadastrado no catálogo corporativo Multivale',
      status: (editingApp.status as AppStatus) || 'AUTORIZADO',
      isSystemApp: editingApp.isSystemApp || false,
      riskLevel: editingApp.status === 'AUTORIZADO' ? 'BAIXO' : 'ALTO',
      createdAt: editingApp.createdAt || new Date().toISOString()
    };

    await onSaveApplication(fullApp);
    setIsModalOpen(false);
    setEditingApp(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-blue-500" />
            <span>Catálogo de Aplicativos (Allowlist / Denylist)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Identificação por Package Name Android e definição de status de autorização nos smartphones corporativos.
          </p>
        </div>

        {canManageApps && (
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Aplicativo</span>
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
              placeholder="Buscar por nome, package name (ex: com.whatsapp)..."
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
              <option value="ALL">Todos os Status (Autorizados e Bloqueados)</option>
              <option value="AUTORIZADO">Apenas AUTORIZADOS</option>
              <option value="BLOQUEADO">Apenas BLOQUEADOS</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
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

        {/* Counters */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {applications.filter((a) => a.status === 'AUTORIZADO').length} Autorizados
            </span>
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              {applications.filter((a) => a.status === 'BLOQUEADO').length} Bloqueados
            </span>
          </div>
          <span>Mostrando <strong className="text-white">{filteredApps.length}</strong> aplicativos</span>
        </div>
      </div>

      {/* Applications Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isAllowed = app.status === 'AUTORIZADO';
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

                <div className="bg-[#11141A] p-2.5 rounded-xl border border-slate-800/80 mb-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Android Package Name</span>
                  <p className="text-[11px] font-mono font-semibold text-blue-400 break-all select-all">
                    {app.packageName}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {app.description}
                </p>
              </div>

              {canManageApps && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
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
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Remover do Catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Cadastro de Aplicativo */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <h3 className="text-sm font-bold text-white">Cadastrar Aplicativo no Catálogo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {/* Presets Bar */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Preenchimento Rápido com Pacotes Comuns
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularPresets.map((p) => (
                    <button
                      key={p.pkg}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="bg-[#11141A] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[11px] font-medium transition"
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
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Google Maps"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Android Package Name (Identificador Único do Pacote) *
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.packageName || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, packageName: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="Ex: com.google.android.apps.maps"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Exatamente igual ao manifesto do APK no Android (ex: com.whatsapp, com.waze)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={editingApp.category || 'Operações e Campo'}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value as AppCategory })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="AUTORIZADO">AUTORIZADO (Permitido no Celular)</option>
                    <option value="BLOQUEADO">BLOQUEADO (Indisponível)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição / Finalidade Corporativa</label>
                <textarea
                  rows={2}
                  value={editingApp.description || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Justificativa de uso do app no dia a dia da Multivale..."
                />
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-blue-900/30"
                >
                  Salvar Aplicativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
