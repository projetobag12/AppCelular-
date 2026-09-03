import React, { useState } from 'react';
import {
  QrCode,
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  Info,
  ExternalLink,
  ShieldCheck,
  Layers,
  Code,
  AlertTriangle,
  Settings2,
  HelpCircle,
  DownloadCloud,
  Sparkles,
  Server
} from 'lucide-react';
import { CompanyInfo } from '../types';

interface EnrollmentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
}

type ProvisioningMode = 'google_dpc' | 'test_dpc' | 'custom_apk';

export const EnrollmentQrModal: React.FC<EnrollmentQrModalProps> = ({
  isOpen,
  onClose,
  companyInfo
}) => {
  const [provisioningMode, setProvisioningMode] = useState<ProvisioningMode>('google_dpc');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [customApkUrl, setCustomApkUrl] = useState(
    'https://app.multivale.com.br/agent/multivale-agent-dpc.apk'
  );
  const [customChecksum, setCustomChecksum] = useState(
    '09a8f7e6d5c4b3a2109876543210fedcba9876543210fedcba9876543210fedc'
  );

  if (!isOpen) return null;

  // Gerar o JSON conforme o modo selecionado
  const getDpcPayload = () => {
    if (provisioningMode === 'google_dpc') {
      // Modo Nativo Google Android Device Policy (Download oficial e automático do Google)
      return {
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME': 'com.google.android.apps.work.clouddpc',
        'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
          'com.google.android.apps.work.clouddpc.EXTRA_ENROLLMENT_TOKEN': companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99',
          enterprise_name: companyInfo.name || 'Multivale Telecomunicações',
          server_url: typeof window !== 'undefined' ? window.location.origin : 'https://multivale-mobilecontrol.web.app'
        }
      };
    }

    if (provisioningMode === 'test_dpc') {
      // Modo Google TestDPC (APK oficial do Google para testes de Device Owner e Kiosk)
      return {
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': 'com.afwsamples.testdpc/com.afwsamples.testdpc.DeviceAdminReceiver',
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME': 'com.afwsamples.testdpc',
        'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
          organization: 'Multivale Telecom',
          token: companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99'
        }
      };
    }

    // Modo Custom APK Multivale
    return {
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': `${
        companyInfo.dpcPackageName || 'br.com.multivale.mobilecontrol.agent'
      }/br.com.multivale.mobilecontrol.DeviceAdminReceiver`,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': customChecksum,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': customApkUrl,
      'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
        server_url: typeof window !== 'undefined' ? window.location.origin : 'https://multivale-mobilecontrol.web.app',
        company_id: 'multivale-telecom',
        enrollment_token: companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99'
      }
    };
  };

  const dpcConfigJson = JSON.stringify(getDpcPayload(), null, 2);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    dpcConfigJson
  )}&bgcolor=141820&color=38bdf8`;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(companyInfo.dpcEnrollmentToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(dpcConfigJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Provisionamento Android Enterprise (Device Owner / DPC)</h3>
              <p className="text-[10px] text-slate-400">Padrão Oficial do Google para Inscrição de Aparelhos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-300 overflow-y-auto">
          {/* Seletor de Modo de Provisionamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-2">
              Selecione o Método do Agente Android para o QR Code:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvisioningMode('google_dpc')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'google_dpc'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Google DPC</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold">Recomendado</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Download 100% automático pelos servidores do Google Play. Sem falhas de link.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvisioningMode('test_dpc')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'test_dpc'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Google TestDPC</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300 font-bold">Oficial APK</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  APK aberto de referência do Google para homologação de travas e Kiosk.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvisioningMode('custom_apk')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'custom_apk'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" />
                    <span>APK Próprio</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">Personalizado</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Insira a URL HTTPS do seu arquivo APK hospedado no seu servidor.
                </p>
              </button>
            </div>
          </div>

          {/* Status Note: Explicação do modo ativo */}
          <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs">
                {provisioningMode === 'google_dpc' && 'Modo Google Android Device Policy Selecionado'}
                {provisioningMode === 'test_dpc' && 'Modo Google TestDPC Selecionado (APK Direto do GitHub do Google)'}
                {provisioningMode === 'custom_apk' && 'Modo APK Próprio Multivale'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {provisioningMode === 'google_dpc' &&
                  'Este QR Code instrui o assistente do Android a baixar o aplicativo do agente diretamente da infraestrutura do Google Play, sem depender de links externos.'}
                {provisioningMode === 'test_dpc' &&
                  'Este QR Code aponta para o release oficial do TestDPC no repositório de engenharia do Google com a assinatura criptográfica SHA-256 correta.'}
                {provisioningMode === 'custom_apk' &&
                  'Certifique-se de que a URL informada abaixo seja acessível pelo celular através da rede Wi-Fi.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* QR Code Column */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="bg-[#11141A] p-3 rounded-2xl border-2 border-blue-500/30 shadow-lg shadow-blue-950/40 mb-2">
                <img
                  src={qrImageUrl}
                  alt="QR Code de Provisionamento Android Device Owner"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-400 text-xs select-all">
                  {companyInfo.dpcEnrollmentToken}
                </span>
                <button
                  onClick={handleCopyToken}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copiar Token"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedToken && <span className="text-[10px] text-emerald-400 mt-1">Token copiado!</span>}
            </div>

            {/* Instructions Column */}
            <div className="md:col-span-7 bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instruções no Aparelho:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  Ligue o smartphone na tela inicial <strong>"Bem-vindo"</strong> (aparelho novo ou formatado).
                </li>
                <li>
                  Toque <strong>6 vezes seguidas</strong> no espaço vazio da tela para abrir o leitor.
                </li>
                <li>
                  Conecte ao Wi-Fi e aponte a câmera para o QR Code ao lado.
                </li>
                <li>
                  O celular fará o download e prosseguirá para a conclusão da inscrição.
                </li>
              </ol>

              {/* Botões de Download Direto do APK */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 block">Opções para Obter o Aplicativo:</span>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.afwsamples.testdpc"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-md shadow-emerald-950/40"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Baixar Oficial na Google Play Store</span>
                  </a>
                  <a
                    href="https://github.com/googlesamples/android-testdpc/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] transition"
                  >
                    <span>Ver Releases no GitHub Oficial</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Configuração avançada quando custom_apk está selecionado */}
          {provisioningMode === 'custom_apk' && (
            <div className="bg-[#11141A] p-4 rounded-2xl border border-amber-800/40 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <h5 className="font-bold text-white text-xs">Configurar Link do APK e Checksum SHA-256</h5>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">URL Direta do APK (HTTPS):</label>
                  <input
                    type="text"
                    value={customApkUrl}
                    onChange={(e) => setCustomApkUrl(e.target.value)}
                    placeholder="https://meudominio.com/agent.apk"
                    className="w-full bg-[#0E1015] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SHA-256 Checksum do APK:</label>
                  <input
                    type="text"
                    value={customChecksum}
                    onChange={(e) => setCustomChecksum(e.target.value)}
                    placeholder="Hash SHA-256 de 64 caracteres"
                    className="w-full bg-[#0E1015] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DPC Payload Preview */}
          <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span>Payload de Provisionamento Android DPC (JSON Atual)</span>
              </span>
              <button
                onClick={handleCopyJson}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0A0C10] rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
              {dpcConfigJson}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#11141A] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
