import React, { useState } from 'react';
import {
  Settings,
  Building,
  ShieldCheck,
  QrCode,
  Smartphone,
  EyeOff,
  Database,
  CheckCircle2,
  Lock,
  Save,
  KeyRound,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CompanyInfo, AndroidFeatureSupport } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  companyInfo: CompanyInfo;
  onSaveCompanyInfo: (info: CompanyInfo) => Promise<void>;
  onOpenEnrollmentModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyInfo,
  onSaveCompanyInfo,
  onOpenEnrollmentModal
}) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState<CompanyInfo>({ ...companyInfo });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveCompanyInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>Configurações do Sistema & Android Enterprise</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Parâmetros corporativos da Multivale, provisionamento DPC e diretrizes de privacidade.
        </p>
      </div>

      {/* Non-Spyware Security Pledge (Mandate Compliance) */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-800/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Compromisso de Não-Espionagem & Privacidade do Trabalhador</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">
                CONFORME LGPD
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O sistema <strong>MULTIVALE MOBILE CONTROL</strong> foi desenvolvido exclusivamente para administração de frota e controle de aplicativos autorizados para o trabalho. 
              <strong> É terminantemente proibida e tecnicamente bloqueada a coleta de:</strong>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem leitura de WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem gravação de chamadas</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem acesso a microfone/câmera</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem captura de senhas/teclado</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem acesso a fotos pessoais</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Sem invasão de privacidade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Android Enterprise & DPC Provisioning Guide */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Provisionamento Android Device Owner (DPC)</h3>
              <p className="text-[11px] text-slate-400">Método padrão do Google para controle estrito em nível de kernel Android</p>
            </div>
          </div>

          <button
            onClick={onOpenEnrollmentModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Exibir QR Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#11141A] p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Token de Inscrição DPC</span>
            <p className="font-mono text-blue-400 font-bold text-sm mt-0.5 select-all">
              {companyInfo.dpcEnrollmentToken}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Identificador do Agente Android</span>
            <p className="font-mono text-emerald-400 font-bold text-sm mt-0.5 select-all">
              {companyInfo.dpcPackageName}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-3">
          <p className="font-bold text-white">Como provisionar um celular corporativo:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed text-[11px]">
            <li>Ligue o aparelho novo ou após restauração de fábrica na tela "Bem-vindo".</li>
            <li>Toque 6 vezes seguidas em qualquer espaço em branco da tela de boas-vindas para abrir o leitor de QR Code do Android.</li>
            <li>Conecte ao Wi-Fi e aponte a câmera para o QR Code gerado pelo sistema.</li>
            <li>O agente <strong>MULTIVALE MOBILE CONTROL</strong> será instalado automaticamente como Device Owner.</li>
          </ol>
        </div>
      </div>

      {/* Company Details Form */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Dados da Empresa & Suporte TI</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Razão Social / Nome Fantasia</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">CNPJ</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Telefone Suporte TI</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail Suporte TI</label>
              <input
                type="email"
                disabled={!isAdmin}
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full bg-[#11141A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between pt-2">
              {isSaved ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-900/30"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Cloud Firestore Database Info */}
      <div className="bg-[#141820] border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Database className="w-4 h-4" />
          <span>Infraestrutura de Nuvem: Google Cloud Firestore</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          O sistema utiliza o Google Cloud Firestore em modo multi-região para sincronização bidirecional em tempo real de políticas, dispositivos e alertas sem latência. Todas as 9 coleções requeridas estão ativas e protegidas por regras de segurança no servidor.
        </p>
      </div>
    </div>
  );
};
