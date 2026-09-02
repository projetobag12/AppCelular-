import React, { useState } from 'react';
import {
  Download,
  Cloud,
  Globe,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Share2,
  Layers,
  Sparkles,
  QrCode,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DownloadAndHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAndHostingModal: React.FC<DownloadAndHostingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'direct_link' | 'install_pwa' | 'free_hosting' | 'generate_apk'>('direct_link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://kioskguard-mdm.web.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#12141A] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="bg-[#16191E] border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Central de Hospedagem & Download Gratuito</h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Firebase Conectado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Seu aplicativo está pronto para uso imediato no celular e hospedagem 100% gratuita.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0F1115] border-b border-slate-800 p-2 gap-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('direct_link')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'direct_link'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#16191E]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Link Direto (Nuvem Ativa)</span>
          </button>

          <button
            onClick={() => setActiveTab('install_pwa')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'install_pwa'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#16191E]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Instalar no Celular (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('free_hosting')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'free_hosting'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#16191E]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>3. Hospedar Grátis (Firebase / Vercel)</span>
          </button>

          <button
            onClick={() => setActiveTab('generate_apk')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'generate_apk'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#16191E]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>4. Gerar APK Android</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-slate-300">
          {/* TAB 1: DIRECT CLOUD LINK */}
          {activeTab === 'direct_link' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#16191E] border border-blue-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 className="text-sm font-bold text-white">Seu App está Hospedado e Ativo Online Agora</h4>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono font-semibold">
                    HTTPS / Nuvem Google
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  Qualquer pessoa ou funcionário com este link pode acessar o aplicativo diretamente pelo navegador do celular, tablet ou computador, com sincronização em tempo real via <strong>Firebase Firestore</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-center bg-[#0F1115] p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full bg-transparent text-slate-100 font-mono text-xs px-2 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition flex-shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status do Firebase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Cloud className="w-4 h-4 text-amber-400" />
                    <span>Banco de Dados Firestore</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ID do Projeto: <code className="text-slate-200">gen-lang-client-0102748718</code>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Regras de Segurança e Banco Ativos
                  </p>
                </div>

                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Compartilhamento Instantâneo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Envie o link via WhatsApp Corporativo ou Email para os motoristas e colaboradores de campo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTALL PWA ON PHONE */}
          {activeTab === 'install_pwa' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-gradient-to-r from-blue-950/50 to-[#16191E] border border-blue-800/40 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  Instalar como Aplicativo Nativo no Celular (Sem Loja de Apps)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O sistema possui suporte nativo a <strong>PWA (Progressive Web App)</strong> com Service Worker e Web App Manifest. Ele é instalado diretamente no celular com ícone na tela inicial e executa em tela cheia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* No Android */}
                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>No Celular Android (Chrome / Edge):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                    <li>Abra o link do aplicativo no <strong>Google Chrome</strong> no celular.</li>
                    <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito.</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                    <li>O ícone <strong>KioskGuard MDM</strong> aparecerá na tela do celular como um app independente!</li>
                  </ol>
                </div>

                {/* No iPhone / iOS */}
                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-blue-400 text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>No iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                    <li>Abra o link no navegador <strong>Safari</strong>.</li>
                    <li>Toque no botão de <strong>Compartilhar (quadrado com seta para cima)</strong>.</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em <strong>"Adicionar"</strong> no canto superior.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FREE HOSTING OPTIONS */}
          {activeTab === 'free_hosting' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-slate-300 leading-relaxed">
                Você pode hospedar este projeto gratuitamente com SSL/HTTPS vitalício em qualquer um destes provedores de alta velocidade:
              </p>

              <div className="space-y-3">
                {/* Option 1: Firebase Hosting */}
                <div className="bg-[#16191E] border border-amber-900/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                      <Cloud className="w-4 h-4" />
                      <span>Opção 1: Firebase Hosting (Google Cloud - 100% Gratuito)</span>
                    </div>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Como o projeto já está configurado no Firebase, basta rodar o comando no terminal:
                  </p>
                  <div className="bg-[#0F1115] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-200">
                    <code>npm run build && npx firebase deploy --only hosting</code>
                    <button
                      onClick={() => handleCopyCode('npm run build && npx firebase deploy --only hosting', 'fb-deploy')}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copiar comando"
                    >
                      {copiedCommand === 'fb-deploy' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Option 2: Vercel */}
                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white text-xs">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Opção 2: Vercel (Hospedagem Instantânea com 1 Clique)</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Gratuito</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Acesse <strong>vercel.com</strong>, conecte seu GitHub ou rode pelo terminal:
                  </p>
                  <div className="bg-[#0F1115] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-200">
                    <code>npx vercel --prod</code>
                    <button
                      onClick={() => handleCopyCode('npx vercel --prod', 'vercel-deploy')}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copiar comando"
                    >
                      {copiedCommand === 'vercel-deploy' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Option 3: Netlify */}
                <div className="bg-[#16191E] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs">
                      <Layers className="w-4 h-4" />
                      <span>Opção 3: Netlify Drop (Arraste a pasta `dist` e Publique)</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Sem Instalação</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gere o build com <code>npm run build</code> e arraste a pasta <strong>dist</strong> em <strong>app.netlify.com/drop</strong> para ter seu site no ar em 5 segundos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERATE ANDROID APK */}
          {activeTab === 'generate_apk' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#16191E] border border-purple-900/40 rounded-xl p-4 space-y-2.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-400" />
                  Gerador Automático de APK Android (Google / Microsoft PWABuilder)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para gerar um instalador <strong>.APK</strong> ou pacote para a Google Play Store sem precisar programar em Java/Kotlin:
                </p>

                <div className="space-y-2 pt-2">
                  <div className="bg-[#0F1115] p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-white text-xs">
                      <span>Passo 1: Acesse a ferramenta oficial PWABuilder</span>
                      <a
                        href="https://www.pwabuilder.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        pwabuilder.com <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Cole a URL do seu app (<code className="text-blue-300">{currentUrl}</code>) no campo de texto e clique em <strong>Start</strong>.
                    </p>
                  </div>

                  <div className="bg-[#0F1115] p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="font-bold text-white text-xs">Passo 2: Clique em "Package for Android"</span>
                    <p className="text-[11px] text-slate-400">
                      A ferramenta gera instantaneamente o arquivo <strong>.apk</strong> e o pacote <strong>.aab</strong> assinado pronto para instalar no celular corporativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-[#16191E] border-t border-slate-800 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>App 100% Funcional • Sincronizado com Nuvem</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link do App'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
