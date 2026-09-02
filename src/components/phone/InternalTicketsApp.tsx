import React, { useState } from 'react';
import { Headphones, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SupportTicket } from '../../types';

interface InternalTicketsAppProps {
  tickets: SupportTicket[];
  supportPhone: string;
}

export const InternalTicketsApp: React.FC<InternalTicketsAppProps> = ({ tickets, supportPhone }) => {
  const [activeTab, setActiveTab] = useState<'meus_chamados' | 'abrir_chamado'>('meus_chamados');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Hardware' | 'Software Corporativo' | 'Rede / VPN' | 'Acesso'>('Software Corporativo');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setDescription('');
      setActiveTab('meus_chamados');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-purple-950/50 border-b border-purple-700/40 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Suporte TI & HelpDesk</h3>
            <p className="text-[10px] text-purple-300">Central de Atendimento ao Usuário</p>
          </div>
        </div>
        <div className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-700 text-purple-300">
          Ramal TI: {supportPhone}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800 p-1 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('meus_chamados')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'meus_chamados' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Chamados Abertos ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('abrir_chamado')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'abrir_chamado' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          + Abrir Chamado
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'meus_chamados' && (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{t.id}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      t.status === 'Resolvido'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{t.title}</h4>
                <p className="text-[10px] text-slate-300">{t.description}</p>
                <div className="flex justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>Categoria: {t.category}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {t.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'abrir_chamado' && (
          submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-600 rounded-xl p-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-emerald-200">Chamado Registrado!</h4>
              <p className="text-xs text-emerald-300">A equipe de suporte técnico entrará em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5 bg-slate-800/80 border border-slate-700 rounded-xl p-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Título do Problema:</label>
                <input
                  type="text"
                  placeholder="Ex: Erro ao sincronizar pedido no CRM"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Categoria:</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Software Corporativo">Software Corporativo</option>
                    <option value="Rede / VPN">Rede / VPN</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Acesso">Acesso & Senhas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Prioridade:</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Descrição do Ocorrido:</label>
                <textarea
                  rows={3}
                  placeholder="Detalhe o que aconteceu no seu celular corporativo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Enviar Chamado para TI
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
};
