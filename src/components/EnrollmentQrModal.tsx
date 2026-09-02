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
  AlertTriangle
} from 'lucide-react';
import { CompanyInfo } from '../types';

interface EnrollmentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
}

export const EnrollmentQrModal: React.FC<EnrollmentQrModalProps> = ({
  isOpen,
  onClose,
  companyInfo
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [customApkUrl, setCustomApkUrl] = useState('https://app.multivale.com.br/agent/multivale-agent-dpc.apk');

  if (!isOpen) return null;

  // JSON padrão de provisionamento do Android Enterprise Device Owner (afw#setup)
  const dpcConfigJson = JSON.stringify(
    {
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': `${companyInfo.dpcPackageName || 'br.com.multivale.mobilecontrol.agent'}/br.com.multivale.mobilecontrol.DeviceAdminReceiver`,
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': '09a8f7e6d5c4b3a2109876543210fedcba9876543210fedcba9876543210fedc',
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': customApkUrl,
      'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
        server_url: typeof window !== 'undefined' ? window.location.origin : 'https://multivale-mobilecontrol.web.app',
        company_id: 'multivale-telecom',
        enrollment_token: companyInfo.dpcEnrollmentToken || 'MV-DPC-2026-X99'
      }
    },
    null,
    2
  );

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
      <div className="bg-[#141820] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#11141A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Provisionamento Android Enterprise (Device Owner / DPC)</h3>
              <p className="text-[10px] text-slate-400">Padrão do Google Android para Administração de Frotas Corporativas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-300 overflow-y-auto">
          {/* Status Note: Android Enterprise Readiness */}
          <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs">Preparado para Conexão com Agente Android DPC</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Este painel MDM está configurado para emitir diretrizes de política em tempo real para o Agente Android Device Owner. 
                Ao escanear o QR Code de provisionamento em um celular novo ou restaurado de fábrica, o Android baixa e concede permissões exclusivas de administração de políticas ao pacote da Multivale.
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
                <span>Como provisionar no aparelho físico:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  Ligue o smartphone novo ou formatado na tela <strong>"Bem-vindo"</strong>.
                </li>
                <li>
                  Toque <strong>6 vezes seguidas</strong> rapidamente no espaço em branco da tela.
                </li>
                <li>
                  O leitor nativo de QR Code do Android será iniciado.
                </li>
                <li>
                  Conecte ao Wi-Fi e escaneie o código de provisionamento acima.
                </li>
                <li>
                  O Android registrará a Multivale como <strong>Device Owner</strong> exclusiva.
                </li>
              </ol>
            </div>
          </div>

          {/* DPC Payload Preview */}
          <div className="bg-[#11141A] p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span>Payload de Provisionamento Android DPC (JSON)</span>
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
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
