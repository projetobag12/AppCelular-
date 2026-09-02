import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Wifi,
  Sun,
  Volume2,
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { SecurityPolicy, CorporateDevice, CompanySettings } from '../../types';

interface InternalSettingsAppProps {
  policy: SecurityPolicy;
  device: CorporateDevice;
  companySettings: CompanySettings;
  onAdminBypassRequest: () => void;
  onTriggerViolation: (attemptedAction: string) => void;
}

export const InternalSettingsApp: React.FC<InternalSettingsAppProps> = ({
  policy,
  device,
  companySettings,
  onAdminBypassRequest,
  onTriggerViolation,
}) => {
  const [activeTab, setActiveTab] = useState<'ajustes' | 'seguranca' | 'sobre'>('ajustes');
  const [brightness, setBrightness] = useState(85);
  const [volume, setVolume] = useState(70);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-[#16191E] border-b border-slate-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A1D23] text-blue-400 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Configurações Básicas</h3>
            <p className="text-[10px] text-slate-400">Modo Restrito MDM Homologado</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 text-emerald-400 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3 h-3" /> Seguro
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#12141A] border-b border-slate-800 p-1 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('ajustes')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'ajustes' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-[#1A1D23]'
          }`}
        >
          Ajustes Permitidos
        </button>
        <button
          onClick={() => setActiveTab('seguranca')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'seguranca' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-[#1A1D23]'
          }`}
        >
          Status de Segurança
        </button>
        <button
          onClick={() => setActiveTab('sobre')}
          className={`flex-1 py-1.5 rounded text-center transition ${
            activeTab === 'sobre' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-[#1A1D23]'
          }`}
        >
          Dispositivo & DPC
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'ajustes' && (
          <div className="space-y-2.5">
            {/* Wi-Fi Control (Restricted to Corporate SSIDs) */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Rede Wi-Fi Corporativa</h4>
                    <p className="text-[10px] text-slate-400">
                      {wifiEnabled ? `Conectado a: ${companySettings.allowedWifiSsid}` : 'Wi-Fi Desativado'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={wifiEnabled}
                  onChange={(e) => setWifiEnabled(e.target.checked)}
                  className="toggle-checkbox accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {policy.blockExternalWifiNetworks && (
                <div className="p-2 bg-cyan-950/40 rounded-lg border border-cyan-800/40 text-[10px] text-cyan-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                  <span>Redes públicas não autorizadas estão bloqueadas por política de segurança.</span>
                </div>
              )}
            </div>

            {/* Screen Brightness */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sun className="w-4 h-4 text-amber-400" /> Brilho da Tela:
                </span>
                <span className="font-mono text-amber-300 font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Volume */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Volume do Sistema & Chamadas:
                </span>
                <span className="font-mono text-emerald-300 font-bold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Blocked Settings Access Test */}
            <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <h4 className="text-xs font-bold">Ações Avançadas Bloqueadas</h4>
              </div>
              <p className="text-[10px] text-slate-300">
                Opções do Desenvolvedor, Depuração USB, Redefinição de Fábrica e Play Store estão sob controle estrito do administrador.
              </p>
              <button
                type="button"
                onClick={() => onTriggerViolation('com.android.settings.DeveloperOptions')}
                className="w-full bg-red-900/60 hover:bg-red-800 text-red-200 text-[10px] font-semibold py-1.5 rounded-lg border border-red-700 transition"
              >
                ⚠️ Testar Tentativa de Abrir "Opções do Desenvolvedor"
              </button>
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="space-y-2 text-xs">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Conformidade Ativa ({policy.version})
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Criptografia do Armazenamento:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Ativa (AES-256)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Modo Device Owner (DPC):</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Bloqueio Kiosk Ativo
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Bloqueio de APKs Externos:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Forçado
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Transferência Cabo USB (MTP):</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {policy.blockUsbDataTransfer ? 'Bloqueada' : 'Liberada (Arquivos)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Depuração USB / ADB:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Desativada
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Prevenção de Printscreen:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> FLAG_SECURE
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Filtro Web de Intranet:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Whitelist Estrita
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Bypass button */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <p className="text-[10px] text-slate-400">Necessita de manutenção ou suporte técnico presencial?</p>
              <button
                type="button"
                onClick={onAdminBypassRequest}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/60 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 mx-auto"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Desbloqueio com PIN do Administrador
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sobre' && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" /> Detalhes do Hardware & Patrimônio
            </h4>
            <div className="space-y-1 text-[10px] text-slate-300 font-mono">
              <p><span className="text-slate-500">Patrimônio:</span> {device.assetTag}</p>
              <p><span className="text-slate-500">Modelo:</span> {device.model}</p>
              <p><span className="text-slate-500">IMEI:</span> {device.imei}</p>
              <p><span className="text-slate-500">Nº de Série:</span> {device.serialNumber}</p>
              <p><span className="text-slate-500">Responsável:</span> {device.assignedEmployee}</p>
              <p><span className="text-slate-500">Departamento:</span> {device.department}</p>
              <p><span className="text-slate-500">Endereço IP:</span> {device.ipAddress}</p>
              <p><span className="text-slate-500">Empresa:</span> {companySettings.companyName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
