import React, { useState } from 'react';
import { Send, Shield, Lock, Search, Hash, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types';

interface InternalChatAppProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, channel: 'geral' | 'vendas' | 'suporte' | 'avisos') => void;
}

export const InternalChatApp: React.FC<InternalChatAppProps> = ({ messages, onSendMessage }) => {
  const [activeChannel, setActiveChannel] = useState<'geral' | 'vendas' | 'suporte' | 'avisos'>('vendas');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages
    .filter((m) => m.channel === activeChannel)
    .filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()) || m.sender.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), activeChannel);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* App Top Bar */}
      <div className="bg-slate-800/90 border-b border-slate-700/60 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1">
              Chat Seguro AlfaCorp
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">E2EE</span>
            </h3>
            <p className="text-[10px] text-slate-400">Canal: #{activeChannel.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
          <Shield className="w-3 h-3 mr-1" />
          Rede Segura
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex bg-slate-950/70 border-b border-slate-800 p-1 gap-1 overflow-x-auto text-[11px]">
        {(['vendas', 'geral', 'avisos', 'suporte'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all whitespace-nowrap ${
              activeChannel === ch
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Hash className="w-3 h-3 opacity-70" />
            {ch === 'avisos' ? 'Avisos da Diretoria' : ch.charAt(0).toUpperCase() + ch.slice(1)}
          </button>
        ))}
      </div>

      {/* Security Compliance Banner */}
      <div className="bg-cyan-950/40 border-b border-cyan-800/40 px-3 py-1.5 flex items-center text-[10px] text-cyan-300">
        <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-cyan-400" />
        <span>Mensagens auditadas em conformidade com a LGPD e a política corporativa.</span>
      </div>

      {/* Search within chat */}
      <div className="p-2 border-b border-slate-800/60 bg-slate-900/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar mensagens internas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhuma mensagem neste canal ainda. Seja o primeiro a interagir!
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.sender.includes('Você');
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1 mb-0.5 text-[10px] text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">{msg.sender}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isSystem && (
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded border border-amber-500/30">
                      SISTEMA
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow'
                      : msg.isSystem
                      ? 'bg-slate-800 border border-amber-500/40 text-amber-100 rounded-tl-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Mensagem para #${activeChannel}...`}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
