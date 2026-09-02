import React, { useState } from 'react';
import {
  Send,
  Search,
  Bell,
  Radio,
  FileText,
  Download,
  Share2,
  Users,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface ChannelItem {
  id: string;
  name: string;
  subscribers: string;
  lastUpdate: string;
  badge?: number;
  messages: { id: string; title: string; date: string; content: string; file?: string }[];
}

const SAMPLE_CHANNELS: ChannelItem[] = [
  {
    id: 'ch-1',
    name: '📢 Comunicados Oficiais & Diretoria',
    subscribers: '142 membros da frota',
    lastUpdate: '09:00',
    badge: 1,
    messages: [
      {
        id: 'msg-1',
        title: 'Atualização da Política de Segurança MDM v4.2.1',
        date: 'Hoje às 08:30',
        content: 'Informamos a todos os motoristas e consultores que a nova matriz de segurança KioskGuard está ativa com liberação de GPS, rotas e bloqueio estrito de roteamento de dados móveis.',
        file: 'norma_mdm_2026.pdf (1.4 MB)',
      },
    ],
  },
  {
    id: 'ch-2',
    name: '🚚 Alertas Operacionais de Rota & Trânsito',
    subscribers: '89 motoristas ativos',
    lastUpdate: '10:45',
    messages: [
      {
        id: 'msg-2',
        title: 'Obras na Rodovia dos Bandeirantes',
        date: 'Hoje às 10:45',
        content: 'Faixa 1 e 2 interditadas no km 42 sentido interior. Recomendado desvio pelo Waze ou Google Maps pela Anhanguera.',
      },
    ],
  },
  {
    id: 'ch-3',
    name: '🛠️ Suporte Técnico de Campo & Telecom',
    subscribers: '35 técnicos',
    lastUpdate: 'Ontem',
    messages: [
      {
        id: 'msg-3',
        title: 'Manual de Vistoria de Antenas FindSites',
        date: 'Ontem às 15:20',
        content: 'Disponibilizado o novo guia de calibragem de sinal para vistorias em torres remotas.',
        file: 'guia_findsites_calibragem.pdf (3.8 MB)',
      },
    ],
  },
];

export const InternalTelegramCorpApp: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top Telegram Header */}
      <div className="bg-[#12141A] border-b border-slate-800 p-3 flex items-center justify-between">
        {selectedChannel ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedChannel(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              ←
            </button>
            <div>
              <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{selectedChannel.name}</h4>
              <p className="text-[10px] text-sky-400">{selectedChannel.subscribers}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Send className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Telegram Corporativo</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" /> Canais Oficiais da Frota
              </p>
            </div>
          </div>
        )}

        <Search className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
      </div>

      {/* Main Body */}
      {selectedChannel ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0B0D11]">
          {selectedChannel.messages.map((m) => (
            <div key={m.id} className="bg-[#16191E] border border-slate-800 rounded-xl p-3 space-y-2 shadow">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-sky-400" />
                  {m.title}
                </h4>
                <span className="text-[9px] text-slate-500">{m.date}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{m.content}</p>

              {m.file && (
                <div className="bg-[#12141A] border border-slate-700/80 rounded-lg p-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="text-[11px] text-slate-300 font-mono">{m.file}</span>
                  </div>
                  <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800 font-semibold">
                    Anexo Homologado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {SAMPLE_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setSelectedChannel(ch)}
              className="p-3.5 flex items-center gap-3 hover:bg-[#16191E] cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-full bg-sky-900/60 border border-sky-700/60 flex items-center justify-center text-sky-300 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                  <span className="text-[10px] text-slate-400">{ch.lastUpdate}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{ch.messages[0]?.title}</p>
              </div>
              {ch.badge ? (
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {ch.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
