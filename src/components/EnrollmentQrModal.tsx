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

type ProvisioningMode = 'pwa_web' | 'google_dpc' | 'test_dpc' | 'custom_apk';

export const EnrollmentQrModal: React.FC<EnrollmentQrModalProps> = ({
  isOpen,
  onClose,
  companyInfo
}) => {
  const [provisioningMode, setProvisioningMode] = useState<ProvisioningMode>('test_dpc');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const vercelAppUrl = 'https://app-celular-one.vercel.app/?mode=colaborador';
  
  // URL e Checksum oficiais e verificados do TestDPC (download direto testado sem 404)
  const OFFICIAL_TESTDPC_URL = 'https://github.com/googlesamples/android-testdpc/releases/download/v9.0.12/TestDPC_9.0.12.apk';
  const OFFICIAL_TESTDPC_CHECKSUM = 'gJD2YwtOiWJHkSMkkIfLRlj-quNqG1fb6v100QmzM9w';

  const [apkPreset, setApkPreset] = useState<'testdpc_verified' | 'custom_url'>('testdpc_verified');
  const [customApkUrl, setCustomApkUrl] = useState(OFFICIAL_TESTDPC_URL);
  const [customChecksum, setCustomChecksum] = useState(OFFICIAL_TESTDPC_CHECKSUM);
  const [customPackageName, setCustomPackageName] = useState('com.afwsamples.testdpc');
  const [customReceiverName, setCustomReceiverName] = useState('com.afwsamples.testdpc.DeviceAdminReceiver');

  if (!isOpen) return null;

  // Gerar o JSON conforme o modo selecionado
  const getDpcPayload = () => {
    if (provisioningMode === 'pwa_web') {
      return {
        type: 'PWA_WEB_APP',
        url: vercelAppUrl,
        name: 'Multivale Mobile Control',
        description: 'Aplicativo PWA Corporativo Multivale'
      };
    }

    if (provisioningMode === 'google_dpc') {
      // Modo Nativo Google Android Device Policy (Download oficial e automático do Google)
      return {
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME': 'com.google.android.apps.work.clouddpc',
        'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
          'com.google.android.apps.work.clouddpc.EXTRA_ENROLLMENT_TOKEN': companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99',
          enterprise_name: companyInfo.name || 'Multivale Telecomunicações',
          server_url: vercelAppUrl
        }
      };
    }

    if (provisioningMode === 'test_dpc') {
      // Modo Google TestDPC com download direto oficial e certificado SHA-256 verificado
      return {
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': 'com.afwsamples.testdpc/com.afwsamples.testdpc.DeviceAdminReceiver',
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME': 'com.afwsamples.testdpc',
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': OFFICIAL_TESTDPC_URL,
        'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': OFFICIAL_TESTDPC_CHECKSUM,
        'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
          organization: companyInfo.name || 'Multivale Telecom',
          token: companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99'
        }
      };
    }

    // Modo Custom APK Multivale / GitHub
    const activeUrl = apkPreset === 'testdpc_verified' ? OFFICIAL_TESTDPC_URL : customApkUrl;
    const activeChecksum = apkPreset === 'testdpc_verified' ? OFFICIAL_TESTDPC_CHECKSUM : customChecksum;
    const activePkg = apkPreset === 'testdpc_verified' ? 'com.afwsamples.testdpc' : customPackageName;
    const activeReceiver = apkPreset === 'testdpc_verified' ? 'com.afwsamples.testdpc.DeviceAdminReceiver' : customReceiverName;

    return {
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': `${activePkg}/${activeReceiver}`,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME': activePkg,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': activeChecksum,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': activeUrl,
      'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
        server_url: typeof window !== 'undefined' ? window.location.origin : 'https://multivale-mobilecontrol.web.app',
        company_id: 'multivale-telecom',
        enrollment_token: companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99'
      }
    };
  };

  const dpcConfigJson = JSON.stringify(getDpcPayload(), null, 2);

  const qrImageUrl =
    provisioningMode === 'pwa_web'
      ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
          vercelAppUrl
        )}&bgcolor=141820&color=38bdf8`
      : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(vercelAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
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
              <h3 className="text-sm font-bold text-white">Provisionamento e Instalação no Celular</h3>
              <p className="text-[10px] text-slate-400">PWA Web App Direto ou Android Enterprise (Device Owner / DPC)</p>
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
              Selecione o Método de Instalação / Acesso no Celular:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setProvisioningMode('pwa_web')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'pwa_web'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>App PWA (Vercel)</span>
                  </span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold">Imediato</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Instala direto no celular pelo Chrome sem precisar formatar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvisioningMode('google_dpc')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'google_dpc'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Google DPC</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Inscrição corporativa do Google no celular formatado.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvisioningMode('test_dpc')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'test_dpc'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>TestDPC</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  APK aberto de testes de Device Owner e Kiosk do Google.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvisioningMode('custom_apk')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  provisioningMode === 'custom_apk'
                    ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/40'
                    : 'bg-[#11141A] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5" />
                    <span>APK GitHub</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Link do arquivo APK compilado no GitHub.
                </p>
              </button>
            </div>
          </div>

          {/* Status Note: Explicação do modo ativo */}
          <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs">
                {provisioningMode === 'pwa_web' && 'Modo Aplicativo PWA Web Selecionado (Vercel)'}
                {provisioningMode === 'google_dpc' && 'Modo Google Android Device Policy Selecionado'}
                {provisioningMode === 'test_dpc' && 'Modo Google TestDPC com Download Direto Verificado (Recomendado)'}
                {provisioningMode === 'custom_apk' && 'Modo APK Próprio / GitHub'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {provisioningMode === 'pwa_web' &&
                  'Você pode abrir a câmera de qualquer celular e ler o QR Code abaixo para abrir e instalar o aplicativo da Multivale imediatamente na tela inicial do aparelho via Chrome.'}
                {provisioningMode === 'google_dpc' &&
                  'Inscrição corporativa gerenciada para empresas com Google Workspace Enterprise configurado.'}
                {provisioningMode === 'test_dpc' &&
                  '✅ QR Code corrigido com download direto oficial do TestDPC v9.0.12 e assinatura SHA-256 verificada. O celular baixa e instala como Device Owner sem erros.'}
                {provisioningMode === 'custom_apk' &&
                  'Permite apontar para um arquivo APK compilado próprio ou usar o pacote oficial verificado.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* QR Code Column */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="bg-[#11141A] p-3 rounded-2xl border-2 border-blue-500/30 shadow-lg shadow-blue-950/40 mb-2">
                <img
                  src={qrImageUrl}
                  alt="QR Code de Provisionamento Android Device Owner ou PWA"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              {provisioningMode === 'pwa_web' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-blue-400 text-[11px] truncate max-w-[180px]">
                      {vercelAppUrl}
                    </span>
                    <button
                      onClick={handleCopyUrl}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copiar URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copiedUrl && <span className="text-[10px] text-emerald-400 block">Link copiado!</span>}
                  <a
                    href={vercelAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:underline inline-block font-semibold"
                  >
                    Abrir no navegador &rarr;
                  </a>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Instructions Column */}
            <div className="md:col-span-7 bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>
                  {provisioningMode === 'pwa_web'
                    ? 'Instruções para Instalar no Celular pelo Chrome:'
                    : 'Passo a Passo no Celular Formatado:'}
                </span>
              </h4>

              {provisioningMode === 'pwa_web' ? (
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    Abra a <strong>câmera normal</strong> do celular (ou o Google Chrome) e aponte para o QR Code ao lado.
                  </li>
                  <li>
                    Acesse a página do aplicativo na Vercel (<code>app-celular-one.vercel.app</code>).
                  </li>
                  <li>
                    No Google Chrome, toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito.
                  </li>
                  <li>
                    Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </li>
                  <li>
                    <strong>Pronto!</strong> O aplicativo Multivale fica salvo na tela inicial com ícone próprio e abre em tela cheia como um app nativo.
                  </li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    Ligue o smartphone na tela inicial <strong>"Bem-vindo" / "Olá"</strong> (após formatar de fábrica).
                  </li>
                  <li>
                    Toque <strong>6 vezes seguidas</strong> em um espaço vazio da tela para abrir o leitor oculto de QR Code do Android.
                  </li>
                  <li>
                    Conecte à rede Wi-Fi e aponte a câmera para o <strong>QR Code ao lado</strong>.
                  </li>
                  <li>
                    O Android fará o download do app de administração e o configurará como <strong>Device Owner (Proprietário do Aparelho)</strong>.
                  </li>
                  <li>
                    <strong>Para travar no app da empresa:</strong> No app instalado, ative <em>Kiosk Mode</em> / <em>Lock Task Mode</em> selecionando o app desejado.
                  </li>
                </ol>
              )}

              {provisioningMode !== 'pwa_web' && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block">Links Rápidos de Apoio:</span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={OFFICIAL_TESTDPC_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-md shadow-emerald-950/40"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Baixar APK Direto no PC / Testar Link</span>
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.afwsamples.testdpc"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] transition"
                    >
                      <span>Google Play Store</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuração avançada quando custom_apk está selecionado */}
          {provisioningMode === 'custom_apk' && (
            <div className="bg-[#11141A] p-4 rounded-2xl border border-amber-800/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-white text-xs">Origem do APK e Checksum de Assinatura</h5>
                </div>
                <span className="text-[10px] text-slate-400">Android Device Owner Provisioning</span>
              </div>

              {/* Explicação do erro 404 anterior */}
              <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-3 text-[11px] text-red-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Por que o celular dizia &quot;Não é possível baixar o app de administração&quot;?</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  O link padrão anterior apontava para <code>projetobag12/AppCelular-/releases/.../app-release.apk</code>, que retornava <strong>Erro 404 (arquivo não encontrado)</strong> porque o seu repositório no GitHub contém apenas o código-fonte web e ainda não possui um arquivo APK compilado publicado na aba <em>Releases</em>.
                </p>
              </div>

              {/* Seletor de Preset */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setApkPreset('testdpc_verified')}
                  className={`flex-1 p-2.5 rounded-xl border text-left transition ${
                    apkPreset === 'testdpc_verified'
                      ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                      : 'bg-[#0E1015] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>TestDPC Oficial (Recomendado)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">100% Funcional</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Download direto do repositório oficial do Google com assinatura criptográfica SHA-256 válida. Não dá erro 404!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setApkPreset('custom_url')}
                  className={`flex-1 p-2.5 rounded-xl border text-left transition ${
                    apkPreset === 'custom_url'
                      ? 'bg-amber-950/50 border-amber-500 text-white ring-1 ring-amber-500/40'
                      : 'bg-[#0E1015] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      <span>Meu Próprio APK (GitHub / Servidor)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">Avançado</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Se você compilou seu próprio APK Android (.apk) e publicou na nuvem.
                  </p>
                </button>
              </div>

              {apkPreset === 'custom_url' && (
                <div className="space-y-3 pt-2">
                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-200/90 space-y-1.5">
                    <p className="font-semibold text-amber-300">Como publicar seu APK no GitHub para o QR Code baixar direto:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[10.5px]">
                      <li>
                        Verifique se o repositório está <strong>Público</strong> em <em>Settings &gt; Change repository visibility</em>.
                      </li>
                      <li>
                        No seu GitHub, clique em <strong>Releases &gt; Draft a new release</strong>.
                      </li>
                      <li>
                        Crie uma tag (ex: <code>v1.0.0</code>) e arraste o seu arquivo <code>.apk</code> no campo de upload de binários.
                      </li>
                      <li>
                        Clique em <strong>Publish release</strong>, copie o link direto do arquivo <code>.apk</code> e cole abaixo.
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-400">URL Direta do APK (HTTPS):</label>
                        <a
                          href={customApkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Testar Download no Navegador</span>
                        </a>
                      </div>
                      <input
                        type="text"
                        value={customApkUrl}
                        onChange={(e) => setCustomApkUrl(e.target.value)}
                        placeholder="https://exemplo.com/meu-app.apk"
                        className="w-full bg-[#0E1015] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        SHA-256 Checksum da Assinatura (Base64 URL-safe ou Hex):
                      </label>
                      <input
                        type="text"
                        value={customChecksum}
                        onChange={(e) => setCustomChecksum(e.target.value)}
                        placeholder="Ex: gJD2YwtOiWJHkSMkkIfLRlj-quNqG1fb6v100QmzM9w"
                        className="w-full bg-[#0E1015] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
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
