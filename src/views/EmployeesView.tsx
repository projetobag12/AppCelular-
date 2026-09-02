import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  X
} from 'lucide-react';
import { Employee, Team, Device } from '../types';
import { useAuth } from '../context/AuthContext';

interface EmployeesViewProps {
  employees: Employee[];
  teams: Team[];
  devices: Device[];
  onSaveEmployee: (employee: Employee) => Promise<void>;
  onDeleteEmployee: (employeeId: string) => Promise<void>;
  onSelectDevice: (device: Device) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  teams,
  devices,
  onSaveEmployee,
  onDeleteEmployee,
  onSelectDevice
}) => {
  const { canManageDevices } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [viewingEmployeeDevices, setViewingEmployeeDevices] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam = teamFilter === 'ALL' || emp.teamId === teamFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesTeam && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingEmployee({
      id: `emp-${Date.now()}`,
      name: '',
      registrationNumber: `MV-2026-${Math.floor(100 + Math.random() * 900)}`,
      teamId: teams[0]?.id || 'team-curitiba',
      teamName: teams[0]?.name || 'Curitiba',
      associatedDeviceIds: [],
      status: 'ATIVO',
      email: '',
      phone: '',
      jobTitle: '',
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.registrationNumber) return;

    const team = teams.find((t) => t.id === editingEmployee.teamId);

    const fullEmp: Employee = {
      id: editingEmployee.id || `emp-${Date.now()}`,
      name: editingEmployee.name,
      registrationNumber: editingEmployee.registrationNumber,
      teamId: team?.id || editingEmployee.teamId || 'team-curitiba',
      teamName: team?.name || editingEmployee.teamName || 'Geral',
      associatedDeviceIds: editingEmployee.associatedDeviceIds || [],
      status: editingEmployee.status || 'ATIVO',
      email: editingEmployee.email || `${editingEmployee.name.toLowerCase().replace(/\s+/g, '.')}@multivale.com.br`,
      phone: editingEmployee.phone || '(41) 99000-0000',
      jobTitle: editingEmployee.jobTitle || 'Colaborador Corporativo',
      createdAt: editingEmployee.createdAt || new Date().toISOString()
    };

    await onSaveEmployee(fullEmp);
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Quadro de Funcionários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Colaboradores da Multivale, equipes regionais e associação de aparelhos celulares corporativos.
          </p>
        </div>

        {canManageDevices && (
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Funcionário</span>
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
              placeholder="Buscar por nome, matrícula, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

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

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#11141A] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const empDevices = devices.filter((d) => d.employeeId === emp.id);
          return (
            <div
              key={emp.id}
              className="bg-[#141820] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{emp.registrationNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      emp.status === 'ATIVO'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{emp.jobTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{emp.teamName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate text-slate-400">{emp.email}</span>
                  </div>
                </div>

                {/* Associated Devices Pill */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    Aparelhos Associados ({empDevices.length})
                  </span>
                  {empDevices.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">Nenhum smartphone vinculado</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {empDevices.map((dev) => (
                        <button
                          key={dev.id}
                          onClick={() => onSelectDevice(dev)}
                          className="bg-[#11141A] hover:bg-slate-800 border border-slate-800 text-blue-400 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>{dev.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {canManageDevices && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Cadastro / Edição de Funcionário */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
              <h3 className="text-sm font-bold text-white">
                {editingEmployee.id?.includes('emp-') ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.name || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Carlos Alberto Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Matrícula / ID *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.registrationNumber || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, registrationNumber: e.target.value })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="MV-2026-000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.jobTitle || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, jobTitle: e.target.value })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Técnico de Fibra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Equipe Regional *</label>
                  <select
                    value={editingEmployee.teamId || ''}
                    onChange={(e) => {
                      const t = teams.find((x) => x.id === e.target.value);
                      setEditingEmployee({
                        ...editingEmployee,
                        teamId: e.target.value,
                        teamName: t?.name
                      });
                    }}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingEmployee.status || 'ATIVO'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as 'ATIVO' | 'INATIVO' })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={editingEmployee.email || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Telefone Contato</label>
                  <input
                    type="text"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-blue-900/30"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
