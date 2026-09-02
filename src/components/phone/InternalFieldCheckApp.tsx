import React, { useState } from 'react';
import { ClipboardCheck, CheckSquare, Square, Camera, Send, FileCheck, CheckCircle2 } from 'lucide-react';
import { FieldInspectionReport } from '../../types';

interface InternalFieldCheckAppProps {
  reports: FieldInspectionReport[];
  onAddReport?: (report: FieldInspectionReport) => void;
}

export const InternalFieldCheckApp: React.FC<InternalFieldCheckAppProps> = ({ reports }) => {
  const [activeTab, setActiveTab] = useState<'nova_vistoria' | 'historico'>('nova_vistoria');
  const [clientName, setClientName] = useState('CD Logístico Bandeirantes');
  const [location, setLocation] = useState('Km 22 - Galpão 03');
  const [checkEquip, setCheckEquip] = useState(true);
  const [checkSafety, setCheckSafety] = useState(true);
  const [checkSignal, setCheckSignal] = useState(true);
  const [notes, setNotes] = useState('Equipamentos operando com 100% de integridade e lacres intactos.');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [hasSignature, setHasSignature] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveTab('historico');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-amber-950/40 border-b border-amber-700/40 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">AlfaField Vistorias</h3>
            <p className="text-[10px] text-amber-300">Coleta e Auditoria em Campo</p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-700 text-amber-300">
          GPS Ativo: ±3m
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800 p-1 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('nova_vistoria')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'nova_vistoria' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          + Nova Vistoria
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'historico' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Histórico ({reports.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'nova_vistoria' && (
          isSubmitted ? (
            <div className="bg-emerald-950/80 border border-emerald-600 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-emerald-200">Relatório Transmitido!</h4>
              <p className="text-xs text-emerald-300">Auditoria salva com carimbo de data, hora e geolocalização.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Local / Cliente:</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Endereço / Ponto de Referência:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">Itens Obrigatórios da Inspeção:</p>
                
                <div
                  onClick={() => setCheckEquip(!checkEquip)}
                  className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white"
                >
                  {checkEquip ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                  <span>Equipamentos e Mercadorias Conferidos</span>
                </div>

                <div
                  onClick={() => setCheckSafety(!checkSafety)}
                  className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white"
                >
                  {checkSafety ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                  <span>Condições de Segurança e EPIs Atendidas</span>
                </div>

                <div
                  onClick={() => setCheckSignal(!checkSignal)}
                  className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:text-white"
                >
                  {checkSignal ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                  <span>Sinal de Telemetria e Conexão Homologados</span>
                </div>
              </div>

              {/* Photo Attachment (Restricted Sandbox Camera) */}
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Foto com Marca d'Água (Câmera Segura)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    hasPhoto ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {hasPhoto ? '1 Foto Anexada' : 'Capturar'}
                </button>
              </div>

              {/* Signature */}
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>Assinatura Digital do Responsável</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasSignature(!hasSignature)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    hasSignature ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {hasSignature ? 'Assinado ✓' : 'Coletar'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Observações Técnicas:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Criptografando e Enviando...' : 'Finalizar e Enviar Vistoria'}
              </button>
            </form>
          )
        )}

        {activeTab === 'historico' && (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-100">{r.clientName}</h4>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-semibold">
                    {r.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">{r.location}</p>
                <p className="text-[10px] text-slate-400 italic">"{r.notes}"</p>
                <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-700/60">
                  <span>{r.inspectorName}</span>
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
