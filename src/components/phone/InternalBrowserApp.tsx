import React, { useState } from 'react';
import { Globe, Lock, ShieldAlert, ArrowRight, RotateCw, CheckCircle, ExternalLink } from 'lucide-react';
import { WebFilterDomain } from '../../types';

interface InternalBrowserAppProps {
  whitelistedDomains: WebFilterDomain[];
  onTriggerViolation: (blockedUrl: string) => void;
}

export const InternalBrowserApp: React.FC<InternalBrowserAppProps> = ({ whitelistedDomains, onTriggerViolation }) => {
  const [urlInput, setUrlInput] = useState('https://intranet.alfalog.com.br');
  const [currentUrl, setCurrentUrl] = useState('https://intranet.alfalog.com.br');
  const [blockedState, setBlockedState] = useState<{ isBlocked: boolean; attemptedUrl: string } | null>(null);

  const navigateTo = (target: string) => {
    let clean = target.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }

    try {
      const urlObj = new URL(clean);
      const hostname = urlObj.hostname.toLowerCase();

      // Check if domain is in whitelist
      const isAllowed = whitelistedDomains.some(
        (d) => d.isAllowed && (hostname === d.domain.toLowerCase() || hostname.endsWith('.' + d.domain.toLowerCase()))
      );

      if (isAllowed) {
        setBlockedState(null);
        setCurrentUrl(clean);
        setUrlInput(clean);
      } else {
        // Blocked!
        setBlockedState({ isBlocked: true, attemptedUrl: clean });
        onTriggerViolation(clean);
      }
    } catch {
      // Invalid URL or blocked search
      setBlockedState({ isBlocked: true, attemptedUrl: clean });
      onTriggerViolation(clean);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Browser Bar */}
      <div className="bg-slate-950 border-b border-slate-800 p-2 space-y-1.5">
        <form onSubmit={handleNavigate} className="flex items-center gap-1.5">
          <div className="flex-1 flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
            <Lock className="w-3 h-3 text-cyan-400 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Digite URL corporativa..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-[11px]"
            />
          </div>
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-1.5 rounded-lg transition"
            title="Navegar"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo(currentUrl)}
            className="p-1.5 text-slate-400 hover:text-slate-200"
            title="Recarregar"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Whitelist Bookmark Chips */}
        <div className="flex gap-1 overflow-x-auto text-[10px] pb-0.5">
          <span className="text-slate-500 self-center text-[9px] uppercase font-semibold">Autorizados:</span>
          {whitelistedDomains
            .filter((d) => d.isAllowed)
            .map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  const url = `https://${d.domain}`;
                  setUrlInput(url);
                  navigateTo(url);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 whitespace-nowrap"
              >
                <Globe className="w-2.5 h-2.5 opacity-70" />
                {d.domain.replace('.alfalog.com.br', '')}
              </button>
            ))}
        </div>
      </div>

      {/* Browser Viewport Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {blockedState?.isBlocked ? (
          /* RED BLOCKED SCREEN */
          <div className="bg-red-950/60 border-2 border-red-600 rounded-2xl p-4 text-center space-y-3 my-2 animate-pulse-slow">
            <div className="w-12 h-12 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mx-auto border border-red-500">
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-red-300 tracking-wide">ACESSO BLOQUEADO PELO MDM</h4>
              <p className="text-[11px] text-red-200 mt-1">
                A navegação para o domínio externo solicitado viola a <strong>Política de Cibersegurança Corporativa</strong> da AlfaLog.
              </p>
            </div>

            <div className="bg-black/50 p-2.5 rounded-lg border border-red-900/80 text-[10px] text-left font-mono text-slate-300 break-all space-y-1">
              <div><span className="text-red-400">URL Tentada:</span> {blockedState.attemptedUrl}</div>
              <div><span className="text-red-400">Status:</span> <span className="bg-red-900 text-red-200 px-1 rounded">REJEITADO (HTTP 403 Forbidden)</span></div>
              <div><span className="text-red-400">Regra de Segurança:</span> Multi-App Enterprise Kiosk Sandbox</div>
              <div><span className="text-red-400">Auditoria:</span> Incidente registrado no console central do Administrador</div>
            </div>

            <button
              onClick={() => {
                const safeUrl = 'https://intranet.alfalog.com.br';
                setUrlInput(safeUrl);
                navigateTo(safeUrl);
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Retornar à Intranet Segura
            </button>
          </div>
        ) : (
          /* INTRANET INTERNAL WEBPAGE VIEW */
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border border-blue-700/60 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700">
                  Portal Corporativo AlfaLog
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> SSL 256-bit
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">Bem-vindo à Intranet AlfaLog</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Acesse procedimentos operacionais padrão, comunicados internos e relatórios gerenciais da companhia.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2.5">
                <h5 className="text-[11px] font-bold text-cyan-300">Normas de Segurança</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Procedimentos de guarda do aparelho e prevenção a vazamentos.</p>
              </div>
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2.5">
                <h5 className="text-[11px] font-bold text-emerald-300">Holerite e Ponto</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Acesso direto ao portal de Recursos Humanos integrado.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
              <h5 className="text-xs font-bold text-slate-200">Comunicados Recentes</h5>
              <div className="text-[10px] text-slate-300 border-l-2 border-cyan-500 pl-2 py-0.5">
                <span className="font-semibold text-white">Nova Tabela de Comissões Q3</span>
                <p className="text-slate-400">Valores atualizados para equipes de vendas externas.</p>
              </div>
              <div className="text-[10px] text-slate-300 border-l-2 border-emerald-500 pl-2 py-0.5">
                <span className="font-semibold text-white">Atualização do KioskGuard MDM</span>
                <p className="text-slate-400">Novas camadas de criptografia implantadas com sucesso.</p>
              </div>
            </div>

            {/* Test Blocked Link Simulator */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate-400 mb-1.5">Teste o Bloqueio Ativo de URLs externas:</p>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {['youtube.com', 'facebook.com', 'tiktok.com', 'bet365.com'].map((site) => (
                  <button
                    key={site}
                    onClick={() => {
                      setUrlInput(`https://${site}`);
                      navigateTo(`https://${site}`);
                    }}
                    className="bg-red-950/70 hover:bg-red-900 text-red-300 text-[10px] px-2 py-1 rounded border border-red-800 flex items-center gap-1"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {site}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
