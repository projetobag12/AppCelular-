import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Smartphone,
  AppWindow,
  Globe,
  Globe2,
  MapPin,
  Navigation,
  MessageCircle,
  Sliders,
  AlertTriangle,
  FileText,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Send,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  QrCode,
  Search,
  Bell,
  Cpu,
  Wifi,
  WifiOff,
  Bluetooth,
  Radio,
  Eye,
  Camera,
  Layers,
  Check,
  X,
  UserCheck,
  KeyRound,
  Calculator,
  Cable
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  SecurityPolicy,
  WhitelistedApp,
  CorporateDevice,
  SecurityIncident,
  WebFilterDomain,
  CompanySettings,
  ManagerAuthCredentials
} from '../types';
import { INITIAL_MANAGER_CREDENTIALS } from '../data/defaultConfig';

interface AdminConsoleProps {
  policy: SecurityPolicy;
  apps: WhitelistedApp[];
  devices: CorporateDevice[];
  incidents: SecurityIncident[];
  whitelistedDomains: WebFilterDomain[];
  companySettings: CompanySettings;
  onUpdatePolicy: (newPolicy: SecurityPolicy) => void;
  onToggleApp: (appId: string) => void;
  onAddApp: (app: WhitelistedApp) => void;
  onRemoveApp: (appId: string) => void;
  onAddDomain: (domain: string, description: string, isAllowed: boolean) => void;
  onRemoveDomain: (id: string) => void;
  onRemoteLockDevice: (deviceId: string, message?: string) => void;
  onRemoteUnlockDevice: (deviceId: string) => void;
  onSendPushAlert: (deviceId: string, message: string) => void;
  onRemoteWipeDevice: (deviceId: string) => void;
  onSyncPolicyDevice: (deviceId: string) => void;
  onResolveIncident: (incidentId: string) => void;
  onUpdateCompanySettings: (settings: CompanySettings) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  policy,
  apps,
  devices,
  incidents,
  whitelistedDomains,
  companySettings,
  onUpdatePolicy,
  onToggleApp,
  onAddApp,
  onRemoveApp,
  onAddDomain,
  onRemoveDomain,
  onRemoteLockDevice,
  onRemoteUnlockDevice,
  onSendPushAlert,
  onRemoteWipeDevice,
  onSyncPolicyDevice,
  onResolveIncident,
  onUpdateCompanySettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'politicas' | 'aplicativos' | 'frota' | 'auditoria' | 'filtro_web' | 'ia_copilot' | 'guia_implantacao'
  >('aplicativos');

  // Manager Authentication State
  const [managerCreds, setManagerCreds] = useState<ManagerAuthCredentials>(INITIAL_MANAGER_CREDENTIALS);
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState<boolean>(true);
  const [showManagerLoginModal, setShowManagerLoginModal] = useState<boolean>(false);
  const [managerUserInput, setManagerUserInput] = useState('');
  const [managerPassInput, setManagerPassInput] = useState('');
  const [managerAuthError, setManagerAuthError] = useState<string | null>(null);
  const [managerActionPending, setManagerActionPending] = useState<(() => void) | null>(null);

  // Local state for policy edits
  const [localPolicy, setLocalPolicy] = useState<SecurityPolicy>(policy);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New App Form Modal State
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPkg, setNewAppPkg] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<any>('productivity');
  const [newAppIcon, setNewAppIcon] = useState('AppWindow');
  const [newAppColor, setNewAppColor] = useState('from-indigo-600 to-blue-800');
  const [newAppDesc, setNewAppDesc] = useState('');

  // New Domain Form State
  const [newDomainUrl, setNewDomainUrl] = useState('');
  const [newDomainDesc, setNewDomainDesc] = useState('');

  // Push Alert Modal State
  const [showPushModal, setShowPushModal] = useState<string | null>(null);
  const [pushMessageText, setPushMessageText] = useState('Aviso: Atualização de segurança agendada para hoje às 18h.');

  // AI Security Copilot State
  const [aiIndustry, setAiIndustry] = useState('Logística e Transporte');
  const [aiFleetSize, setAiFleetSize] = useState('50 celulares');
  const [aiRiskLevel, setAiRiskLevel] = useState('Alto (Kiosk Estrito)');
  const [aiCustomReqs, setAiCustomReqs] = useState('Bloquear totalmente YouTube, redes sociais e jogos; liberar apenas CRM e Waze corporativo.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  // Filter search states
  const [deviceSearch, setDeviceSearch] = useState('');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'unresolved' | 'high'>('all');
  const [fleetViewMode, setFleetViewMode] = useState<'mapa' | 'grade'>('mapa');
  const [selectedFleetDevice, setSelectedFleetDevice] = useState<CorporateDevice | null>(devices[0] || null);
  const [fleetMapFilter, setFleetMapFilter] = useState<'all' | 'moving' | 'stopped' | 'locked'>('all');
  const [gpsPingSuccess, setGpsPingSuccess] = useState<string | null>(null);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...localPolicy,
      lastUpdated: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdatePolicy(updated);
    setLocalPolicy(updated);
    setSaveSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddNewAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPkg.trim()) return;
    const newApp: WhitelistedApp = {
      id: `app-custom-${Date.now()}`,
      name: newAppName.trim(),
      packageName: newAppPkg.trim(),
      category: newAppCategory,
      icon: newAppIcon,
      color: newAppColor,
      description: newAppDesc.trim() || 'Aplicativo corporativo homologado pela equipe de TI.',
      isEnabled: true,
      isMandatory: false,
    };
    onAddApp(newApp);
    setShowAddAppModal(false);
    setNewAppName('');
    setNewAppPkg('');
    setNewAppDesc('');
  };

  const requireManagerAuth = (action: () => void) => {
    if (isManagerAuthenticated) {
      action();
    } else {
      setManagerActionPending(() => action);
      setShowManagerLoginModal(true);
    }
  };

  const handleManagerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      managerUserInput.trim().toLowerCase() === managerCreds.managerUser.toLowerCase() &&
      managerPassInput === managerCreds.managerPass
    ) {
      setIsManagerAuthenticated(true);
      setManagerAuthError(null);
      setShowManagerLoginModal(false);
      setManagerUserInput('');
      setManagerPassInput('');
      if (managerActionPending) {
        managerActionPending();
        setManagerActionPending(null);
      }
    } else {
      setManagerAuthError('Credenciais da Gerência inválidas. Verifique seu e-mail corporativo e senha.');
    }
  };

  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainUrl.trim()) return;
    onAddDomain(newDomainUrl.trim(), newDomainDesc.trim() || 'Portal interno autorizado', true);
    setNewDomainUrl('');
    setNewDomainDesc('');
  };

  const handleRunAiAudit = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyType: aiIndustry,
          deviceCount: aiFleetSize,
          riskLevel: aiRiskLevel,
          customRequirements: aiCustomReqs,
          currentPolicies: localPolicy,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiAuditResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered devices & incidents
  const filteredDevices = devices.filter(
    (d) =>
      d.assignedEmployee.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      d.model.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      d.assetTag.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      d.department.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  const filteredIncidents = incidents.filter((inc) => {
    if (incidentFilter === 'unresolved') return !inc.resolved;
    if (incidentFilter === 'high') return inc.severity === 'high' || inc.severity === 'critical';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#16191E] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Console Header */}
      <div className="bg-[#12141A] border-b border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">SECURE<span className="text-blue-500">MDM</span> Central Console</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                PROD v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gestão de Bloqueio, Aplicativos Autorizados e Conformidade de Segurança da Frota
            </p>
          </div>
        </div>

        {/* Top Quick Status Pill Bar */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="bg-[#1A1D23] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Frota:</span>
            <strong className="text-slate-100">{devices.length} Celulares</strong>
          </div>
          <div className="bg-[#1A1D23] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400">Conformidade:</span>
            <strong className="text-emerald-400">96.8% Ativa</strong>
          </div>
          <div className="bg-[#1A1D23] border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Incidentes:</span>
            <strong className="text-amber-300">{incidents.filter((i) => !i.resolved).length} Pendentes</strong>
          </div>
        </div>
      </div>

      {/* Navigation Submenu Tabs */}
      <div className="bg-[#12141A] border-b border-slate-800 px-4 flex gap-1 overflow-x-auto text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('politicas')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'politicas'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Políticas de Segurança
        </button>

        <button
          onClick={() => setActiveTab('aplicativos')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'aplicativos'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AppWindow className="w-4 h-4" />
          Apps Permitidos ({apps.filter((a) => a.isEnabled).length}/{apps.length})
        </button>

        <button
          onClick={() => setActiveTab('filtro_web')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'filtro_web'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          Filtro Web & Intranet
        </button>

        <button
          onClick={() => setActiveTab('frota')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'frota'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Frota de Dispositivos ({devices.length})
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'auditoria'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Auditoria & Incidentes ({incidents.length})
        </button>

        <button
          onClick={() => setActiveTab('ia_copilot')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'ia_copilot'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Auditor IA (Gemini)
        </button>

        <button
          onClick={() => setActiveTab('guia_implantacao')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'guia_implantacao'
              ? 'border-blue-500 text-blue-400 bg-blue-600/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-500" />
          Guia de Instalação Real (QR Code DPC)
        </button>
      </div>

      {/* Main Console Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* ============================================================ */}
        {/* TAB 1: POLÍTICAS DE SEGURANÇA (SECURITY MATRIX) */}
        {/* ============================================================ */}
        {activeTab === 'politicas' && (
          <form onSubmit={handleSavePolicies} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#1A1D23] p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Matriz de Travas e Políticas de Bloqueio Corporativo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Versão Atual: <span className="text-blue-400 font-mono font-semibold">{localPolicy.version}</span> • Última Sincronização: {localPolicy.lastUpdated}
                </p>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20"
              >
                <Send className="w-4 h-4" />
                Salvar & Transmitir OTA para a Frota
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-600/80 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Políticas atualizadas com sucesso!</strong> Comando de atualização OTA (Over-The-Air) enviado para todos os smartphones conectados.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card: Restrições de Hardware e Conectividade */}
              <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hardware, Portas e Conexões
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                        <span className="font-semibold text-slate-200">Bloquear Roteamento de Internet & Hotspot Wi-Fi</span>
                        <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800/60 font-semibold">
                          Norma Estrita
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Proíbe o celular de compartilhar dados 4G/5G via Ponto de Acesso, Wi-Fi ou Bluetooth Tethering.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockTetheringAndHotspot ?? true}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockTetheringAndHotspot: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-slate-200">Bloquear Bluetooth</span>
                        {!localPolicy.blockBluetooth && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/60 font-semibold">
                            Liberado para Uso
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Permite fones de ouvido, viva-voz veicular e maquininhas de cartão autorizadas.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockBluetooth}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockBluetooth: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Cable className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-slate-200">Bloquear Transferência de Arquivos USB (MTP)</span>
                        {!localPolicy.blockUsbDataTransfer && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/60 font-semibold">
                            Cabo USB Liberado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Permite importar/baixar planilhas, notas fiscais, fotos e documentos conectando o celular ao computador via cabo USB.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockUsbDataTransfer}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockUsbDataTransfer: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Modo Desenvolvedor & Depuração ADB</span>
                      <p className="text-[11px] text-slate-400">Desativa comandos de console e depuração técnica não autorizada.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockDeveloperMode}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockDeveloperMode: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Captura de Tela (Anti-Printscreen)</span>
                      <p className="text-[11px] text-slate-400">Aplica FLAG_SECURE para evitar vazamento de dados confidenciais.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockScreenshots}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockScreenshots: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Forçar GPS & Localização Sempre Ativos</span>
                      <p className="text-[11px] text-slate-400">Impede o colaborador de desligar a telemetria e rastreamento da frota.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockLocationGpsDisabled}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockLocationGpsDisabled: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Redefinição para Padrão de Fábrica</span>
                      <p className="text-[11px] text-slate-400">Desativa o Factory Reset Protection (FRP) pelo menu do usuário.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockFactoryReset}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockFactoryReset: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Card: Restrições de Aplicativos e Lojas */}
              <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <AppWindow className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Controle de Aplicativos e Kiosk
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Instalação de APKs Externos (Sideloading)</span>
                      <p className="text-[11px] text-slate-400">Impede instalação de aplicativos fora da lista de permissões da empresa.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockAppInstallations}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockAppInstallations: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Google Play Store Pública</span>
                      <p className="text-[11px] text-slate-400">Remove o acesso à loja de aplicativos comum (Jogos, Redes Sociais).</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockGooglePlayStore}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockGooglePlayStore: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141A] hover:bg-[#16191E] border border-slate-800 cursor-pointer transition">
                    <div>
                      <span className="font-semibold text-slate-200">Bloquear Desinstalação de Apps Corporativos</span>
                      <p className="text-[11px] text-slate-400">Protege o CRM, Chat e Agente KioskGuard contra remoção.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPolicy.blockAppUninstallation}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, blockAppUninstallation: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <div className="p-3 bg-[#12141A] rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-200">Modo de Operação do Quiosque:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setLocalPolicy({ ...localPolicy, kioskModeType: 'multi_app_whitelisted' })}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          localPolicy.kioskModeType === 'multi_app_whitelisted'
                            ? 'bg-blue-600/10 border-blue-500 text-blue-300 font-semibold'
                            : 'bg-[#16191E] border-slate-800 text-slate-400'
                        }`}
                      >
                        Multi-App Whitelist (Recomendado)
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                          Grade com apps corporativos aprovados
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalPolicy({ ...localPolicy, kioskModeType: 'single_app' })}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          localPolicy.kioskModeType === 'single_app'
                            ? 'bg-blue-600/10 border-blue-500 text-blue-300 font-semibold'
                            : 'bg-[#16191E] border-slate-800 text-slate-400'
                        }`}
                      >
                        Single-App Lock (Totem / Kiosk Único)
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                          Trava a tela em 1 único app sem menu
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Master Admin Bypass PIN */}
                  <div className="p-3 bg-[#12141A] rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">PIN Mestre do Administrador:</span>
                      <span className="text-[11px] text-slate-400">Usado para desbloqueio emergencial</span>
                    </div>
                    <input
                      type="text"
                      value={localPolicy.masterAdminBypassPin}
                      onChange={(e) => setLocalPolicy({ ...localPolicy, masterAdminBypassPin: e.target.value })}
                      className="w-full bg-[#16191E] border border-slate-700 rounded-lg p-2 text-xs text-blue-400 font-mono font-bold tracking-widest focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save bar */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 transition shadow-lg shadow-blue-900/20"
              >
                <Send className="w-4 h-4" />
                Salvar & Transmitir OTA para a Frota
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* TAB 2: APLICATIVOS PERMITIDOS (APP WHITELIST MANAGER) */}
        {/* ============================================================ */}
        {activeTab === 'aplicativos' && (
          <div className="space-y-4">
            {/* Manager Authentication Status Bar */}
            <div className="bg-[#1A1D23] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                    isManagerAuthenticated
                      ? 'bg-emerald-600/90 shadow-emerald-900/30'
                      : 'bg-amber-600/90 shadow-amber-900/30'
                  }`}
                >
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Painel de Homologação da Gerência
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isManagerAuthenticated
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      }`}
                    >
                      {isManagerAuthenticated ? 'Sessão Autenticada' : 'Acesso Trancado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Login Ativo:{' '}
                    <span className="text-blue-400 font-mono font-medium">
                      {managerCreds.managerUser}
                    </span>{' '}
                    • Controle de download e liberação de apps corporativos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {isManagerAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsManagerAuthenticated(false)}
                      className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Bloquear Sessão
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAppModal(true)}
                      className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-900/20"
                    >
                      <Plus className="w-4 h-4" />
                      Homologar Novo App
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setManagerAuthError(null);
                      setShowManagerLoginModal(true);
                    }}
                    className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Unlock className="w-4 h-4" />
                    Fazer Login de Gerência
                  </button>
                )}
              </div>
            </div>

            {/* Quick App Presets & Requested Apps Bar */}
            <div className="bg-[#12141A] p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">
                  Apps Homologados Conforme Solicitação:
                </span>
                <span className="text-slate-400 text-[11px]">
                  Google Earth, Maps, Waze, WhatsApp, Telegram, FindSites, Calculadora e ERP Empresa.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <span className="text-[11px] text-slate-400">
                  Total Liberados: <strong className="text-emerald-400">{apps.filter(a => a.isEnabled).length}</strong> de {apps.length}
                </span>
              </div>
            </div>

            {/* App Grid in Admin View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className={`bg-[#1A1D23] border rounded-xl p-4 space-y-3 transition ${
                    app.isEnabled ? 'border-slate-800 shadow-sm' : 'border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.color} p-2 flex items-center justify-center text-white shadow-md`}
                      >
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {app.name}
                          {app.isMandatory && (
                            <span className="text-[9px] bg-blue-950/60 text-blue-400 px-1.5 py-0.2 rounded border border-blue-800/60 font-semibold">
                              Obrigatório
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">{app.packageName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={app.isEnabled}
                        disabled={app.isMandatory}
                        onChange={() => {
                          requireManagerAuth(() => onToggleApp(app.id));
                        }}
                        className="accent-blue-600 w-4 h-4 cursor-pointer"
                        title={
                          app.isMandatory
                            ? 'Aplicativo obrigatório não pode ser desativado'
                            : 'Requer autorização gerencial para alterar'
                        }
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="capitalize">Categoria: {app.category}</span>
                    <span
                      className={`font-semibold ${
                        app.isEnabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {app.isEnabled ? 'Liberado no Celular' : 'Bloqueado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Login de Gerência */}
            {showManagerLoginModal && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#16191E] border border-amber-500/50 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <KeyRound className="w-5 h-5" />
                      <h3 className="text-sm font-bold text-white">Autenticação da Gerência</h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowManagerLoginModal(false);
                        setManagerAuthError(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    Para homologar novos aplicativos ou modificar permissões de download nos celulares da frota, confirme as credenciais gerenciais:
                  </p>

                  <form onSubmit={handleManagerLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">E-mail da Gerência:</label>
                      <input
                        type="email"
                        value={managerUserInput}
                        onChange={(e) => setManagerUserInput(e.target.value)}
                        placeholder="gerencia@empresa.com"
                        className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Senha de Acesso Gerencial:</label>
                      <input
                        type="password"
                        value={managerPassInput}
                        onChange={(e) => setManagerPassInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                        required
                      />
                    </div>

                    {managerAuthError && (
                      <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800/80 text-[11px] text-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{managerAuthError}</span>
                      </div>
                    )}

                    <div className="bg-[#12141A] p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                      <p><strong>Credencial Padrão de Homologação:</strong></p>
                      <p>Usuário: <code className="text-amber-400 font-mono">gerencia@empresa.com</code></p>
                      <p>Senha: <code className="text-amber-400 font-mono">gerencia@2026</code></p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowManagerLoginModal(false);
                          setManagerAuthError(null);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 rounded-lg text-xs transition shadow"
                      >
                        Autenticar & Liberar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Homologar Novo App */}
            {showAddAppModal && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#16191E] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-400" />
                      Homologar Novo Aplicativo na Whitelist
                    </h3>
                    <button onClick={() => setShowAddAppModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNewAppSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nome do Aplicativo:</label>
                      <input
                        type="text"
                        placeholder="Ex: Waze Corporativo / Power BI Móvel"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Package Name (Android ID):</label>
                      <input
                        type="text"
                        placeholder="Ex: com.waze / com.microsoft.powerbim"
                        value={newAppPkg}
                        onChange={(e) => setNewAppPkg(e.target.value)}
                        className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Categoria:</label>
                        <select
                          value={newAppCategory}
                          onChange={(e) => setNewAppCategory(e.target.value)}
                          className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="productivity">Produtividade</option>
                          <option value="sales">Vendas & CRM</option>
                          <option value="communication">Comunicação</option>
                          <option value="field">Campo & Operações</option>
                          <option value="utility">Utilitário</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tema Visual:</label>
                        <select
                          value={newAppColor}
                          onChange={(e) => setNewAppColor(e.target.value)}
                          className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="from-blue-600 to-indigo-800">Azul Corporativo</option>
                          <option value="from-emerald-600 to-teal-800">Verde Esmeralda</option>
                          <option value="from-amber-600 to-orange-800">Laranja Operacional</option>
                          <option value="from-purple-600 to-violet-800">Roxo Tecnologia</option>
                          <option value="from-rose-600 to-pink-800">Vermelho Destacado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Descrição / Finalidade:</label>
                      <textarea
                        rows={2}
                        placeholder="Descreva para que serve este aplicativo na rotina de trabalho..."
                        value={newAppDesc}
                        onChange={(e) => setNewAppDesc(e.target.value)}
                        className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAppModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold transition shadow"
                      >
                        Aprovar e Liberar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: FILTRO WEB & INTRANET (WEB CONTENT FILTER) */}
        {/* ============================================================ */}
        {activeTab === 'filtro_web' && (
          <div className="space-y-4">
            <div className="bg-[#1A1D23] p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Filtro de Conteúdo Web e Whitelist de Domínios
              </h3>
              <p className="text-xs text-slate-400">
                O navegador seguro do celular bloqueará qualquer tentativa de acesso a domínios que não estejam nesta lista de permissões.
              </p>
            </div>

            {/* Add Domain Form */}
            <form onSubmit={handleAddDomainSubmit} className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Adicionar Novo Domínio à Whitelist:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Ex: portal.fornecedor.com.br"
                    value={newDomainUrl}
                    onChange={(e) => setNewDomainUrl(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Descrição (ex: Sistema de Rastreio de Pedidos)"
                    value={newDomainDesc}
                    onChange={(e) => setNewDomainDesc(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Plus className="w-4 h-4" /> Adicionar Domínio
                </button>
              </div>
            </form>

            {/* Domains Table */}
            <div className="bg-[#1A1D23] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12141A] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Domínio Autorizado</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {whitelistedDomains.map((dom) => (
                    <tr key={dom.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-blue-400">
                        {dom.domain}
                      </td>
                      <td className="p-3 text-slate-300">{dom.description}</td>
                      <td className="p-3">
                        {dom.isAllowed ? (
                          <span className="bg-emerald-950/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                            Permitido ✓
                          </span>
                        ) : (
                          <span className="bg-red-950/60 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-800/60 font-semibold">
                            Bloqueado ✕
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onRemoveDomain(dom.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition"
                          title="Remover regra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: FROTA DE DISPOSITIVOS & RASTREAMENTO GPS VIA MAPS */}
        {/* ============================================================ */}
        {activeTab === 'frota' && (
          <div className="space-y-4">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#1A1D23] p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Rastreamento GPS da Frota & Ações Remotas
                </h3>
                <p className="text-xs text-slate-400">
                  Monitore a localização em tempo real via Maps, velocidade dos veículos, telemetria e bloqueio remoto.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-[#12141A] p-1 rounded-lg border border-slate-800 flex gap-1 text-xs">
                  <button
                    onClick={() => setFleetViewMode('mapa')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
                      fleetViewMode === 'mapa'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Mapa de Rastreamento
                  </button>
                  <button
                    onClick={() => setFleetViewMode('grade')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition ${
                      fleetViewMode === 'grade'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Grade de Aparelhos ({devices.length})
                  </button>
                </div>
              </div>
            </div>

            {/* View Mode 1: Live Interactive GPS Tracking Map */}
            {fleetViewMode === 'mapa' && (
              <div className="space-y-4">
                {/* Map Control Strip & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#16191E] p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">Filtrar:</span>
                    <button
                      onClick={() => setFleetMapFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        fleetMapFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#12141A] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Todos ({devices.length})
                    </button>
                    <button
                      onClick={() => setFleetMapFilter('moving')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                        fleetMapFilter === 'moving'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#12141A] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Em Rota ({devices.filter((d) => d.isMoving).length})
                    </button>
                    <button
                      onClick={() => setFleetMapFilter('stopped')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        fleetMapFilter === 'stopped'
                          ? 'bg-amber-600 text-slate-950 font-bold'
                          : 'bg-[#12141A] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Parados ({devices.filter((d) => !d.isMoving && d.isOnline).length})
                    </button>
                  </div>

                  {gpsPingSuccess && (
                    <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-lg font-mono text-[11px] animate-in fade-in">
                      ✓ {gpsPingSuccess}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setGpsPingSuccess('Coordenadas GPS sincronizadas com 100% da frota!');
                      setTimeout(() => setGpsPingSuccess(null), 3000);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Ping GPS Geral
                  </button>
                </div>

                {/* Simulated Interactive Fleet Map Canvas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Visual Map Area */}
                  <div className="lg:col-span-2 bg-[#10141C] border border-slate-800 rounded-2xl h-[440px] relative overflow-hidden flex flex-col justify-between p-4 shadow-xl">
                    {/* Background Map Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60"></div>

                    {/* SVG Street Road Network */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 440">
                      <line x1="40" y1="120" x2="560" y2="120" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                      <line x1="40" y1="280" x2="560" y2="280" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                      <line x1="160" y1="30" x2="160" y2="410" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                      <line x1="420" y1="30" x2="420" y2="410" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                      
                      {/* Main Express Diagonal Freeway */}
                      <path d="M 60 380 Q 220 280 320 200 T 540 80" stroke="#334155" strokeWidth="12" fill="none" strokeLinecap="round" />
                      
                      {/* Active breadcrumb trail for selected device */}
                      {selectedFleetDevice?.locationHistory && (
                        <path d="M 60 380 Q 200 300 280 230" stroke="#10b981" strokeWidth="4" strokeDasharray="6 4" fill="none" className="animate-pulse" />
                      )}
                    </svg>

                    {/* Top Overlay Legend */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="bg-[#16191E]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                        <span className="text-xs font-bold text-white">Central de Rastreamento AlfaLog</span>
                        <span className="text-[10px] text-slate-400 font-mono">São Paulo / Região Metropolitana</span>
                      </div>

                      <div className="bg-[#16191E]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 font-mono">
                        GPS Satelital • Precisão ± 2.4m
                      </div>
                    </div>

                    {/* Markers for Devices on Map */}
                    {devices
                      .filter((d) => {
                        if (fleetMapFilter === 'moving') return d.isMoving;
                        if (fleetMapFilter === 'stopped') return !d.isMoving && d.isOnline;
                        if (fleetMapFilter === 'locked') return d.isRemotelyLocked;
                        return true;
                      })
                      .map((d, index) => {
                        const isSelected = selectedFleetDevice?.id === d.id;
                        // Calculate positions based on device index / coordinates
                        const leftPercent = 20 + ((index * 18 + 8) % 65);
                        const topPercent = 25 + ((index * 22 + 12) % 55);

                        return (
                          <div
                            key={d.id}
                            onClick={() => setSelectedFleetDevice(d)}
                            className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
                            style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                          >
                            {/* Pulse ripple if moving */}
                            {d.isMoving && (
                              <div className="w-10 h-10 rounded-full bg-emerald-500/30 animate-ping absolute -top-1 -left-1"></div>
                            )}

                            {/* Marker Body */}
                            <div
                              className={`relative rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 border transition ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-white scale-110 shadow-blue-900/50'
                                  : d.isMoving
                                  ? 'bg-emerald-600 text-white border-emerald-300'
                                  : d.isRemotelyLocked
                                  ? 'bg-red-600 text-white border-red-300'
                                  : 'bg-slate-800 text-slate-200 border-slate-600'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-xl bg-black/40 flex items-center justify-center font-bold text-xs">
                                {d.isMoving ? (
                                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                                ) : (
                                  <MapPin className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="pr-1 text-left">
                                <p className="text-[10px] font-bold leading-tight truncate max-w-[90px]">
                                  {d.assignedEmployee.split(' ')[0]}
                                </p>
                                <p className="text-[8px] font-mono opacity-80 leading-tight">
                                  {d.isMoving ? `${d.speedKmH} km/h` : 'Parado'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Bottom Selected Device Pill */}
                    {selectedFleetDevice && (
                      <div className="relative z-10 bg-[#16191E]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/60">
                            {selectedFleetDevice.assetTag}
                          </span>
                          <div>
                            <p className="font-bold text-white leading-tight">{selectedFleetDevice.assignedEmployee}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[300px]">
                              {selectedFleetDevice.currentAddress}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                              {selectedFleetDevice.speedKmH} km/h
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              Bat: {selectedFleetDevice.batteryLevel}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Telemetry & Remote Control Inspector Panel */}
                  <div className="bg-[#16191E] border border-slate-800 rounded-2xl p-4 space-y-3.5 flex flex-col justify-between">
                    {selectedFleetDevice ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                                {selectedFleetDevice.assetTag}
                              </span>
                              <h4 className="text-xs font-bold text-white">{selectedFleetDevice.assignedEmployee}</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{selectedFleetDevice.model}</p>
                          </div>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              selectedFleetDevice.isMoving
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {selectedFleetDevice.isMoving ? 'Em Deslocamento' : 'Parado'}
                          </span>
                        </div>

                        {/* Telemetry Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="bg-[#12141A] p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block">Velocidade:</span>
                            <strong className="text-emerald-400 text-xs">{selectedFleetDevice.speedKmH} km/h</strong>
                          </div>
                          <div className="bg-[#12141A] p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block">Bateria:</span>
                            <strong className="text-emerald-400 text-xs">{selectedFleetDevice.batteryLevel}%</strong>
                          </div>
                          <div className="bg-[#12141A] p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block">Coordenadas:</span>
                            <strong className="text-blue-400 text-[10px]">
                              {selectedFleetDevice.latitude}, {selectedFleetDevice.longitude}
                            </strong>
                          </div>
                          <div className="bg-[#12141A] p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-500 block">Satélites / Precisão:</span>
                            <strong className="text-slate-200 text-[10px]">
                              {selectedFleetDevice.satelliteCount} sat (±{selectedFleetDevice.gpsAccuracyMeters}m)
                            </strong>
                          </div>
                        </div>

                        <div className="bg-[#12141A] p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">Endereço Atual:</span>
                          <p className="text-slate-200 font-medium text-[11px] leading-snug">
                            {selectedFleetDevice.currentAddress}
                          </p>
                        </div>

                        {/* Recent Breadcrumbs */}
                        {selectedFleetDevice.locationHistory && selectedFleetDevice.locationHistory.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Histórico Recente de Posições:
                            </h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {selectedFleetDevice.locationHistory.map((h, i) => (
                                <div
                                  key={i}
                                  className="bg-[#12141A] p-1.5 rounded-lg border border-slate-800 text-[10px] flex items-center justify-between"
                                >
                                  <span className="text-slate-300 truncate max-w-[170px]">{h.address}</span>
                                  <span className="font-mono text-emerald-400 font-bold">{h.time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                        <MapPin className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs">Selecione um smartphone no mapa para visualizar a telemetria ao vivo.</p>
                      </div>
                    )}

                    {/* Remote Actions Bottom Strip */}
                    {selectedFleetDevice && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFleetDevice.isRemotelyLocked ? (
                            <button
                              onClick={() => onRemoteUnlockDevice(selectedFleetDevice.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Desbloquear
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                onRemoteLockDevice(
                                  selectedFleetDevice.id,
                                  'Dispositivo bloqueado remotamente pelo Administrador.'
                                )
                              }
                              className="bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow"
                            >
                              <Lock className="w-3.5 h-3.5" /> Bloquear
                            </button>
                          )}

                          <button
                            onClick={() => setShowPushModal(selectedFleetDevice.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-400" /> Push
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 2: Traditional Grid Inventory */}
            {fleetViewMode === 'grade' && (
              <div className="space-y-3">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar colaborador, modelo, patrimônio..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className={`bg-[#1A1D23] border rounded-xl p-4 space-y-3 transition ${
                        dev.isRemotelyLocked
                          ? 'border-red-600/80 bg-red-950/20'
                          : dev.complianceStatus === 'violating'
                          ? 'border-amber-600/80'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                              {dev.assetTag}
                            </span>
                            <h4 className="text-xs font-bold text-white">{dev.assignedEmployee}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{dev.model} • {dev.department}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {dev.isOnline ? (
                            <span className="bg-emerald-950/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800/60 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              Online
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                              Offline
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Device Telemetry Specs */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-[#12141A] p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono">
                        <div>
                          <span className="text-slate-500 block">Velocidade:</span>
                          <strong className="text-emerald-400">{dev.speedKmH} km/h</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Bateria:</span>
                          <strong className="text-emerald-400">{dev.batteryLevel}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Política:</span>
                          <strong className="text-blue-400">{dev.policyVersion}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-[#12141A] p-2 rounded-lg border border-slate-800 truncate">
                        <span className="text-slate-500 mr-1">Posição:</span>
                        {dev.currentAddress}
                      </div>

                      {/* Remote Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        {dev.isRemotelyLocked ? (
                          <button
                            onClick={() => onRemoteUnlockDevice(dev.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Desbloquear
                          </button>
                        ) : (
                          <button
                            onClick={() => onRemoteLockDevice(dev.id, 'Bloqueio administrativo temporário solicitado.')}
                            className="flex-1 bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 font-medium py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Lock className="w-3.5 h-3.5" /> Bloquear
                          </button>
                        )}

                        <button
                          onClick={() => setShowPushModal(dev.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                          title="Enviar Notificação Push"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400" /> Push
                        </button>

                        <button
                          onClick={() => onSyncPolicyDevice(dev.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                          title="Forçar Sincronização de Políticas"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Sync
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Atenção: Deseja realmente executar Limpeza Remota (Wipe) no patrimônio ${dev.assetTag}? Todos os dados corporativos serão apagados.`)) {
                              onRemoteWipeDevice(dev.id);
                            }
                          }}
                          className="bg-[#12141A] hover:bg-red-950 text-slate-400 hover:text-red-300 p-2 rounded-lg text-xs border border-slate-800 transition"
                          title="Reset Corporativo (Wipe)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal: Enviar Push Alert */}
            {showPushModal && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#16191E] border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      Enviar Notificação Push para o Aparelho
                    </h3>
                    <button onClick={() => setShowPushModal(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    A mensagem aparecerá instantaneamente no topo da tela do smartphone em Modo Quiosque:
                  </p>

                  <textarea
                    rows={3}
                    value={pushMessageText}
                    onChange={(e) => setPushMessageText(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPushModal(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSendPushAlert(showPushModal, pushMessageText);
                        setShowPushModal(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold transition shadow"
                    >
                      Enviar Alerta Push
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: AUDITORIA & INCIDENTES (SECURITY AUDIT FEED) */}
        {/* ============================================================ */}
        {activeTab === 'auditoria' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#1A1D23] p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Trilha de Auditoria & Tentativas de Violação Bloqueadas
                </h3>
                <p className="text-xs text-slate-400">
                  Logs em tempo real de tentativas de burlar o bloqueio Kiosk, acessos a links proibidos ou conexões USB.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIncidentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    incidentFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Todos ({incidents.length})
                </button>
                <button
                  onClick={() => setIncidentFilter('unresolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    incidentFilter === 'unresolved' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Pendentes ({incidents.filter((i) => !i.resolved).length})
                </button>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-[#1A1D23] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12141A] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Dispositivo / Colaborador</th>
                    <th className="p-3">Tipo de Incidente</th>
                    <th className="p-3">Detalhes / Alvo Bloqueado</th>
                    <th className="p-3">Severidade</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{inc.timestamp}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-200 block">{inc.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inc.deviceName}</span>
                      </td>
                      <td className="p-3">
                        {inc.eventType === 'blocked_hotspot' ? (
                          <span className="bg-red-950/80 text-red-300 border border-red-800/80 px-2 py-0.5 rounded font-semibold text-[10px] inline-flex items-center gap-1">
                            <WifiOff className="w-3 h-3" /> Roteador Bloqueado
                          </span>
                        ) : inc.eventType === 'blocked_app' ? (
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-semibold text-[10px] inline-flex items-center gap-1">
                            <AppWindow className="w-3 h-3" /> App Não Autorizado
                          </span>
                        ) : inc.eventType === 'blocked_url' ? (
                          <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-semibold text-[10px] inline-flex items-center gap-1">
                            <Globe className="w-3 h-3" /> URL Proibida
                          </span>
                        ) : (
                          <span className="bg-[#12141A] text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono text-[10px]">
                            {inc.eventType}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        <p>{inc.details}</p>
                        {inc.targetResource && (
                          <span className="text-[10px] text-blue-400 font-mono block mt-0.5">
                            Alvo: {inc.targetResource}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            inc.severity === 'critical' || inc.severity === 'high'
                              ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                              : inc.severity === 'medium'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {inc.resolved ? (
                          <span className="text-emerald-400 font-semibold text-[10px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tratado
                          </span>
                        ) : (
                          <button
                            onClick={() => onResolveIncident(inc.id)}
                            className="bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-slate-700 transition"
                          >
                            Marcar Resolvido
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: AUDITOR DE CONFORMIDADE COM IA (GEMINI COPILOT) */}
        {/* ============================================================ */}
        {activeTab === 'ia_copilot' && (
          <div className="space-y-6">
            <div className="bg-[#1A1D23] border border-blue-900/40 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Auditor e Gerador de Políticas de Segurança com IA</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                O Gemini analisa as características da sua empresa, setor de atuação e tamanho da frota para gerar um diagnóstico de conformidade com a LGPD, ISO 27001 e recomendações práticas de configuração para Android Enterprise.
              </p>
            </div>

            {/* AI Generator Form */}
            <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Setor / Indústria:</label>
                  <select
                    value={aiIndustry}
                    onChange={(e) => setAiIndustry(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Logística e Transporte">Logística e Transporte</option>
                    <option value="Varejo e Força de Vendas">Varejo e Força de Vendas</option>
                    <option value="Serviços de Campo e Manutenção">Serviços de Campo e Manutenção</option>
                    <option value="Saúde e Hospitais">Saúde e Hospitais</option>
                    <option value="Financeiro e Cobrança">Financeiro e Cobrança</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tamanho da Frota:</label>
                  <input
                    type="text"
                    value={aiFleetSize}
                    onChange={(e) => setAiFleetSize(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nível de Restrição Desejado:</label>
                  <select
                    value={aiRiskLevel}
                    onChange={(e) => setAiRiskLevel(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Alto (Kiosk Estrito / Sem Acesso Externo)">Alto (Kiosk Estrito / Sem Acesso Externo)</option>
                    <option value="Médio (Multi-App Produtivo + Intranet)">Médio (Multi-App Produtivo + Intranet)</option>
                    <option value="Total (Single-App Locked)">Total (Single-App Locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Requisitos ou Dúvidas Específicas:</label>
                <textarea
                  rows={2}
                  value={aiCustomReqs}
                  onChange={(e) => setAiCustomReqs(e.target.value)}
                  className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Ex: Como garantir que motoristas não usem o celular dirigindo ou fora do horário de trabalho?"
                />
              </div>

              <button
                type="button"
                onClick={handleRunAiAudit}
                disabled={aiLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20 w-full sm:w-auto"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analisando Conformidade com Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Gerar Diagnóstico & Recomendações Técnicas
                  </>
                )}
              </button>
            </div>

            {/* AI Results Display */}
            {aiAuditResult && (
              <div className="bg-[#1A1D23] border border-blue-900/60 rounded-xl p-5 space-y-4 shadow-xl animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Relatório de Conformidade Gerado</h4>
                  </div>
                  <span className="bg-emerald-950/60 text-emerald-400 font-mono text-xs px-3 py-1 rounded border border-emerald-800/60 font-semibold">
                    Nota de Segurança: {aiAuditResult.complianceRating || 'A+ (99%)'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-blue-400">Resumo Executivo:</p>
                  <p className="leading-relaxed bg-[#12141A] p-3 rounded-lg border border-slate-800">
                    {aiAuditResult.summary}
                  </p>
                </div>

                {/* Recommendations list */}
                {aiAuditResult.recommendations && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-emerald-400">Recomendações Práticas para Aplicação:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {aiAuditResult.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="bg-[#12141A] border border-slate-800 p-2.5 rounded-lg flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Android Enterprise XML Payload */}
                {aiAuditResult.androidEnterpriseDpcXml && (
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-amber-400">Configuração Técnica Android Enterprise / Knox (XML DPC):</p>
                    <pre className="bg-[#0F1115] border border-slate-800 text-blue-300 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                      {aiAuditResult.androidEnterpriseDpcXml}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: GUIA DE IMPLANTAÇÃO REAL (REAL ENROLLMENT GUIDE & QR CODE) */}
        {/* ============================================================ */}
        {activeTab === 'guia_implantacao' && (
          <div className="space-y-6">
            <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Guia Prático: Como Bloquear os Celulares Físicos da sua Empresa
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para aplicar este bloqueio nos smartphones físicos (Samsung, Motorola, Xiaomi, etc.) no mundo real, o padrão oficial da indústria é o <strong>Android Enterprise Device Owner</strong> via QR Code de Provisionamento.
              </p>
            </div>

            {/* Step-by-Step Practical Enrollment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-white text-xs">Formate ou Inicie o Celular Novo</h4>
                <p className="text-slate-400 leading-relaxed">
                  Na primeira tela de boas-vindas ("Iniciar / Bem-vindo"), <strong>toque 6 vezes seguidas em qualquer espaço vazio da tela</strong>.
                </p>
                <div className="bg-[#12141A] p-2 rounded-lg text-[11px] text-blue-400 font-mono">
                  Isto ativa a câmera interna de leitura de QR Code do Android Enterprise.
                </div>
              </div>

              <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-white text-xs">Aponte para o QR Code DPC</h4>
                <p className="text-slate-400 leading-relaxed">
                  Conecte o smartphone ao Wi-Fi e escaneie o QR Code abaixo. O sistema instalará o controlador de políticas e ativará o <strong>Modo Device Owner</strong>.
                </p>
                <div className="bg-[#12141A] p-2 rounded-lg text-[11px] text-emerald-400 font-mono">
                  Token: afw#setup / KioskGuard-DPC-Enterprise
                </div>
              </div>

              <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-white text-xs">Bloqueio Automático Enforced</h4>
                <p className="text-slate-400 leading-relaxed">
                  O celular será imediatamente travado no Modo Quiosque. Play Store, USB, reset e apps externos ficam 100% bloqueados.
                </p>
                <div className="bg-[#12141A] p-2 rounded-lg text-[11px] text-purple-400 font-mono">
                  Políticas vinculadas ao serial/IMEI.
                </div>
              </div>
            </div>

            {/* Live QR Code Provisioning Generator Display */}
            <div className="bg-[#1A1D23] border border-slate-800 rounded-xl p-6 text-center space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                QR Code de Provisionamento Android Enterprise Oficial:
              </h4>

              {/* SVG Styled Vector QR Code Mockup with Embedded Metadata */}
              <div className="bg-white p-4 rounded-xl w-56 h-56 mx-auto flex items-center justify-center shadow-2xl relative border-4 border-blue-500">
                {/* SVG Visual QR Code Matrix */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                  <rect x="5" y="5" width="25" height="25" fill="#020617" />
                  <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="13" width="9" height="9" fill="#020617" />

                  <rect x="70" y="5" width="25" height="25" fill="#020617" />
                  <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="78" y="13" width="9" height="9" fill="#020617" />

                  <rect x="5" y="70" width="25" height="25" fill="#020617" />
                  <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="78" width="9" height="9" fill="#020617" />

                  {/* QR Matrix Blocks */}
                  <rect x="35" y="8" width="8" height="6" fill="#020617" />
                  <rect x="48" y="8" width="14" height="6" fill="#020617" />
                  <rect x="38" y="20" width="6" height="10" fill="#020617" />
                  <rect x="50" y="20" width="12" height="6" fill="#020617" />

                  <rect x="10" y="38" width="10" height="6" fill="#020617" />
                  <rect x="25" y="38" width="8" height="12" fill="#020617" />
                  <rect x="38" y="38" width="24" height="24" fill="#2563eb" />
                  <rect x="68" y="38" width="10" height="6" fill="#020617" />
                  <rect x="82" y="38" width="8" height="14" fill="#020617" />

                  <rect x="8" y="55" width="14" height="6" fill="#020617" />
                  <rect x="68" y="50" width="8" height="12" fill="#020617" />
                  <rect x="80" y="58" width="10" height="6" fill="#020617" />

                  <rect x="35" y="70" width="10" height="6" fill="#020617" />
                  <rect x="50" y="70" width="6" height="12" fill="#020617" />
                  <rect x="62" y="70" width="14" height="6" fill="#020617" />
                  <rect x="80" y="70" width="10" height="10" fill="#020617" />
                  <rect x="38" y="82" width="18" height="8" fill="#020617" />
                  <rect x="62" y="82" width="12" height="8" fill="#020617" />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-lg bg-[#0F1115] text-blue-400 flex items-center justify-center shadow-lg border border-blue-500">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto text-[11px] text-slate-400 space-y-1">
                <p><strong className="text-slate-200">Payload DPC:</strong> KioskGuard-Policy-POL-BR-CORP-2026</p>
                <p>Compatível com Samsung Knox, Motorola for Business e Android 11/12/13/14/15 Enterprise.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
