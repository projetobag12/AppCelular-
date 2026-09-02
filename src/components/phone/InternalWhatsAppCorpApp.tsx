import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Camera,
  Mic,
  Send,
  CheckCheck,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

interface ContactChat {
  id: string;
  name: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: { id: string; sender: 'me' | 'other'; text: string; time: string }[];
}

const INITIAL_CHATS: ContactChat[] = [
  {
    id: 'c1',
    name: 'Supermercados Estrela (Compras)',
    avatarColor: 'bg-emerald-600',
    lastMessage: 'Confirmando a entrega dos 40 pallets para as 14h.',
    time: '11:45',
    unreadCount: 2,
    messages: [
      { id: 'm1', sender: 'other', text: 'Bom dia! O motorista já está com o manifesto de carga?', time: '11:30' },
      { id: 'm2', sender: 'me', text: 'Bom dia! Sim, carga faturada e em trânsito.', time: '11:35' },
      { id: 'm3', sender: 'other', text: 'Confirmando a entrega dos 40 pallets para as 14h.', time: '11:45' },
    ],
  },
  {
    id: 'c2',
    name: 'Coordenação Logística & Frota',
    avatarColor: 'bg-blue-600',
    lastMessage: 'Rota 04 otimizada. Favor seguir pelo desvio.',
    time: '10:12',
    unreadCount: 1,
    messages: [
      { id: 'm4', sender: 'other', text: 'Rota 04 otimizada. Favor seguir pelo desvio.', time: '10:12' },
    ],
  },
  {
    id: 'c3',
    name: 'Drogarias Santa Helena (Recepção)',
    avatarColor: 'bg-purple-600',
    lastMessage: 'Recebido o canhoto assinado digitalmente.',
    time: 'Ontem',
    unreadCount: 0,
    messages: [
      { id: 'm5', sender: 'me', text: 'Segue comprovante da entrega #9921.', time: 'Ontem 16:40' },
      { id: 'm6', sender: 'other', text: 'Recebido o canhoto assinado digitalmente.', time: 'Ontem 16:45' },
    ],
  },
];

export const InternalWhatsAppCorpApp: React.FC = () => {
  const [chats, setChats] = useState<ContactChat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChatId) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: inputMsg,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, lastMessage: inputMsg, time: newMsg.time, messages: [...c.messages, newMsg] }
          : c
      )
    );
    setInputMsg('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top WhatsApp Header */}
      <div className="bg-[#12141A] border-b border-slate-800 p-3 flex items-center justify-between">
        {activeChat ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveChatId(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              ←
            </button>
            <div className={`w-8 h-8 rounded-full ${activeChat.avatarColor} flex items-center justify-center font-bold text-white text-xs`}>
              {activeChat.name[0]}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{activeChat.name}</h4>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online (Corporativo)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">WhatsApp Corporativo</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Criptografia Ponta a Ponta
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-400">
          <Search className="w-4 h-4 hover:text-white cursor-pointer" />
          <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Content Area: Chat List OR Active Chat Conversation */}
      {activeChat ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#0A0C0E]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            <div className="text-center my-1">
              <span className="bg-[#16191E] border border-slate-800 text-[9px] text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                🔒 Mensagens criptografadas pela política corporativa
              </span>
            </div>

            {activeChat.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs shadow ${
                    m.sender === 'me'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-[#1A1D23] border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                    <span>{m.time}</span>
                    {m.sender === 'me' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="bg-[#12141A] p-2 border-t border-slate-800 flex items-center gap-1.5">
            <button type="button" className="p-1.5 text-slate-400 hover:text-white">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Mensagem corporativa..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-[#16191E] border border-slate-700 rounded-full px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setActiveChatId(c.id);
                setChats((prev) => prev.map((item) => item.id === c.id ? { ...item, unreadCount: 0 } : item));
              }}
              className="p-3 flex items-center gap-3 hover:bg-[#16191E] cursor-pointer transition"
            >
              <div className={`w-11 h-11 rounded-full ${c.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow flex-shrink-0`}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                  <span className="text-[10px] text-slate-400">{c.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {c.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
