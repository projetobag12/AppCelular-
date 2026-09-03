import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Users,
  Smartphone,
  ShieldCheck,
  Edit,
  Trash2,
  Layers,
  MapPin,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { Team, Device, Employee, Policy } from '../types';
import { useAuth } from '../context/AuthContext';

interface TeamsViewProps {
  teams: Team[];
  devices: Device[];
  employees: Employee[];
  policies: Policy[];
  onSaveTeam: (team: Team) => Promise<void>;
  onApplyPolicyToTeam: (teamId: string, policyId: string) => Promise<void>;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  devices,
  employees,
  policies,
  onSaveTeam,
  onApplyPolicyToTeam
}) => {
  const { canManageDevices } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<Team> | null>(null);

  const [isBatchPolicyModalOpen, setIsBatchPolicyModalOpen] = useState(false);
  const [selectedTeamForBatch, setSelectedTeamForBatch] = useState<Team | null>(null);
  const [selectedBatchPolicyId, setSelectedBatchPolicyId] = useState<string>('');

  const handleOpenCreate = () => {
    setEditingTeam({
      id: `team-${Date.now()}`,
      name: '',
      region: 'Paraná',
      description: '',
      defaultPolicyId: policies[0]?.id,
      memberCount: 0,
      deviceCount: 0,
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam({ ...team });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.name || !editingTeam.region) return;

    const teamDevs = (devices || []).filter((d) => d && d.teamId === editingTeam.id).length;
    const teamEmps = (employees || []).filter((e) => e && e.teamId === editingTeam.id).length;

    const fullTeam: Team = {
      id: editingTeam.id || `team-${Date.now()}`,
      name: editingTeam.name,
      region: editingTeam.region,
      description: editingTeam.description || 'Equipe técnica regional da Multivale',
      defaultPolicyId: editingTeam.defaultPolicyId || policies[0]?.id,
      memberCount: teamEmps || editingTeam.memberCount || 0,
      deviceCount: teamDevs || editingTeam.deviceCount || 0,
      createdAt: editingTeam.createdAt || new Date().toISOString()
    };

    await onSaveTeam(fullTeam);
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleApplyBatchPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForBatch || !selectedBatchPolicyId) return;

    await onApplyPolicyToTeam(selectedTeamForBatch.id, selectedBatchPolicyId);
    setIsBatchPolicyModalOpen(false);
    setSelectedTeamForBatch(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>Equipes & Filiais Regionais</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organização territorial dos colaboradores e aplicação de políticas de aplicativos em lote por filial.
          </p>
        </div>

        {canManageDevices && (
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Equipe Regional</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const teamDevices = devices.filter((d) => d.teamId === team.id);
          const teamEmployees = employees.filter((e) => e.teamId === team.id);
          const policy = policies.find((p) => p.id === team.defaultPolicyId);

          return (
            <div
              key={team.id}
              className="bg-[#141820] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{team.name}</h3>
                    <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{team.region}</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {team.description}
                </p>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2 bg-[#11141A] p-3 rounded-xl border border-slate-800 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Membros</span>
                      <span className="font-bold text-white">{(teamEmployees || []).length || team.memberCount || 0} funcionários</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Smartphones</span>
                      <span className="font-bold text-white">{(teamDevices || []).length || team.deviceCount || 0} aparelhos</span>
                    </div>
                  </div>
                </div>

                {/* Default Policy */}
                <div className="text-xs border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Política Padrão da Equipe
                  </span>
                  <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{policy?.name || 'Padrão Corporativo'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedTeamForBatch(team);
                    setSelectedBatchPolicyId(team.defaultPolicyId || policies[0]?.id || '');
                    setIsBatchPolicyModalOpen(true);
                  }}
                  className="bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-400 border border-indigo-800/60 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Aplicar em Lote</span>
                </button>

                {canManageDevices && (
                  <button
                    onClick={() => handleOpenEdit(team)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Editar Equipe"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Cadastro e Edição de Equipe */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <h3 className="text-sm font-bold text-white">
                {editingTeam.id?.includes('team-') ? 'Editar Equipe Regional' : 'Nova Equipe Regional'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome da Equipe *</label>
                <input
                  type="text"
                  required
                  value={editingTeam.name || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Cascavel (Oeste)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Região de Atuação *</label>
                <input
                  type="text"
                  required
                  value={editingTeam.region || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, region: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Oeste do Paraná"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editingTeam.description || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Descreva as atividades e funções desta equipe..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Política Padrão</label>
                <select
                  value={editingTeam.defaultPolicyId || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, defaultPolicyId: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Aplicação de Política em Lote por Equipe */}
      {/* ------------------------------------------------------------- */}
      {isBatchPolicyModalOpen && selectedTeamForBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Aplicação de Política em Lote</h3>
              </div>
              <button onClick={() => setIsBatchPolicyModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBatchPolicy} className="p-5 space-y-4 text-xs">
              <div className="bg-[#11141A] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Equipe Selecionada</span>
                <p className="font-bold text-white text-sm mt-0.5">{selectedTeamForBatch.name}</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  Todos os dispositivos ativos vinculados a esta equipe receberão a nova política simultaneamente via Cloud Firestore.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Selecione a Política para Todos os Aparelhos da Equipe
                </label>
                <select
                  required
                  value={selectedBatchPolicyId}
                  onChange={(e) => setSelectedBatchPolicyId(e.target.value)}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {(policies || []).map((pol) => (
                    <option key={pol.id} value={pol.id}>
                      {pol.name} ({(pol.allowedAppPackageNames || []).length} apps autorizados)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-[#11141A] border-t border-slate-800 -mx-5 -mb-5 mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchPolicyModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-indigo-900/30"
                >
                  Aplicar para Toda a Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
