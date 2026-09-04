import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Lock,
  FolderCheck,
  FolderLock,
  FileText,
  Phone,
  MessageSquare,
  MapPin,
  Camera,
  Calculator,
  Compass,
  AlertTriangle,
  RotateCcw,
  Wifi,
  BatteryCharging,
  KeyRound,
  CheckCircle2,
  X,
  ExternalLink,
  Send,
  Eye,
  Download,
  Search,
  UserCheck,
  ArrowLeft,
  Info,
  ChevronRight,
  Sparkles,
  Usb,
  Share2,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { Device, Policy, Application, Employee } from '../types';
import { GestorLoginModal } from '../components/GestorLoginModal';
import { db, doc, setDoc } from '../lib/firebase';

interface CollaboratorKioskViewProps {
  devices: Device[];
  policies: Policy[];
  applications: Application[];
  employees: Employee[];
  currentDeviceId?: string;
  onSelectDevice?: (deviceId: string) => void;
  onExitKiosk: () => void;
  onSendAlert: (deviceId: string, message: string, severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA') => Promise<void>;
}

export const CollaboratorKioskView: React.FC<CollaboratorKioskViewProps> = ({
  devices,
  policies,
  applications,
  employees,
  currentDeviceId,
  onSelectDevice,
  onExitKiosk,
  onSendAlert
}) => {
  // Dispositivo selecionado para a visualização do colaborador
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    currentDeviceId || devices[0]?.id || 'dev-001'
  );

  const currentDevice = (devices || []).find((d) => d?.id === selectedDeviceId) || devices?.[0];
  const currentPolicy = (policies || []).find((p) => p?.id === currentDevice?.policyId) || policies?.[0];
  const currentEmployee = (employees || []).find((e) => e?.id === currentDevice?.employeeId);

  // Estados de navegação interna do Kiosk
  const [activeTab, setActiveTab] = useState<'apps' | 'folders' | 'device' | 'sos'>('apps');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Modal de Login do Gestor
  const [isGestorLoginOpen, setIsGestorLoginOpen] = useState(false);

  // Estados de Simulação de Apps
  const [openedApp, setOpenedApp] = useState<Application | null>(null);
  const [blockedAttemptApp, setBlockedAttemptApp] = useState<string | null>(null);
  const [phoneDialerNumber, setPhoneDialerNumber] = useState('');
  const [calcInput, setCalcInput] = useState('0');
  const [osFormSubmitted, setOsFormSubmitted] = useState(false);
  const [cameraCaptured, setCameraCaptured] = useState(false);

  // Estados de Pastas e Arquivos
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<{ name: string; size: string; type: string; date: string; content?: string } | null>(null);

  // Estados de SOS
  const [sosMessage, setSosMessage] = useState('');
  const [sosSent, setSosSent] = useState(false);
  const [sosCategory, setSosCategory] = useState<string>('');

  // Relógio do celular
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-registro e sincronização em tempo real com o Firestore para celulares reais
  useEffect(() => {
    const enrollAndSyncDevice = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Recupera ou gera um ID permanente para este aparelho
        let deviceId = localStorage.getItem('multivale_device_id');
        const isNewDevice = !deviceId;
        if (!deviceId) {
          deviceId = `dev-real-${Math.random().toString(36).substring(2, 8)}`;
          localStorage.setItem('multivale_device_id', deviceId);
        }

        // Detecta informações do aparelho
        const ua = navigator.userAgent || '';
        let detectedManufacturer = 'Motorola';
        let detectedModel = 'Moto G (Empresarial)';

        if (/Samsung|SM-|Galaxy/i.test(ua)) {
          detectedManufacturer = 'Samsung';
          detectedModel = 'Samsung Galaxy (Empresarial)';
        } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
          detectedManufacturer = 'Xiaomi';
          detectedModel = 'Xiaomi Redmi (Empresarial)';
        } else if (/Motorola|Moto/i.test(ua)) {
          detectedManufacturer = 'Motorola';
          detectedModel = 'Motorola Moto (Empresarial)';
        }

        let androidVer = '13.0';
        const match = ua.match(/Android\s([0-9\.]+)/);
        if (match && match[1]) {
          androidVer = match[1];
        }

        // Tenta obter bateria real do navegador
        let batteryPct = 85;
        try {
          // @ts-ignore
          if (navigator.getBattery) {
            // @ts-ignore
            const battery = await navigator.getBattery();
            batteryPct = Math.round(battery.level * 100);
          }
        } catch {}

        const realDeviceData: Device = {
          id: deviceId,
          name: `${detectedManufacturer} ${detectedModel}`,
          manufacturer: detectedManufacturer,
          model: detectedModel,
          androidVersion: androidVer,
          imei: '86' + (Math.abs(deviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 9876543) % 1000000000000).toString().padStart(13, '0'),
          serialNumber: `MV-${deviceId.replace('dev-', '').toUpperCase()}`,
          status: 'ATIVO',
          managementMode: 'DEVICE_OWNER',
          batteryLevel: batteryPct,
          isCharging: false,
          storageUsedGb: 34,
          storageTotalGb: 128,
          lastSync: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          policyId: 'pol-001',
          policyName: 'Operações Técnicas de Campo',
          teamId: 'team-001',
          teamName: 'Equipe Campo Cascavel',
          employeeId: 'emp-001',
          employeeName: 'Carlos Eduardo Mendes',
          ipAddress: '192.168.1.105',
          installedAppsCount: allowedApps.length || 6,
          isRemotelyLocked: false
        };

        // Salva ou atualiza no Firestore para aparecer instantaneamente no painel do Gestor
        await setDoc(doc(db, 'devices', deviceId), realDeviceData, { merge: true });
        setSelectedDeviceId(deviceId);
      } catch (err) {
        console.warn('Sync device error:', err);
      }
    };

    enrollAndSyncDevice();

    // Heartbeat a cada 30 segundos mantendo o status ONLINE no Gestor
    const syncInterval = setInterval(async () => {
      try {
        const deviceId = localStorage.getItem('multivale_device_id');
        if (deviceId) {
          await setDoc(
            doc(db, 'devices', deviceId),
            {
              lastSync: new Date().toISOString(),
              status: 'ATIVO'
            },
            { merge: true }
          );
        }
      } catch {}
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // Apps permitidos pela política
  const allowedApps = (applications || []).filter((app) => {
    if (!app) return false;
    if (!currentPolicy) return true;
    return currentPolicy.allowedAppPackageNames?.includes(app.packageName);
  });

  // Pastas liberadas pela política
  const allowedFolders = currentPolicy?.allowedFolders || [
    '/storage/emulated/0/MultivaleDocumentos',
    '/storage/emulated/0/MultivaleFotosCampo',
    '/storage/emulated/0/Download/Corporativo'
  ];

  // Permissão da entrada Tipo-C / Pendrive OTG na política atual
  const isUsbOtgAllowed = currentPolicy ? (currentPolicy.allowUsbOtgStorage ?? true) : true;
  const [isOtgConnected, setIsOtgConnected] = useState(true);

  // Arquivos dentro do Pendrive USB Tipo-C (OTG)
  const [otgFiles, setOtgFiles] = useState<Array<{ id: string; name: string; size: string; type: string; date: string; content: string }>>([
    {
      id: 'otg-1',
      name: 'OS_Campo_Instalacao_Cliente_9941.pdf',
      size: '840 KB',
      type: 'PDF',
      date: 'Hoje, 08:30',
      content: 'Ordem de Serviço #9941 com assinatura de aceite do cliente titular, dados de instalação FTTH na CTO-04 porta 6 e níveis ópticos (-18.7 dBm).'
    },
    {
      id: 'otg-2',
      name: 'Relatorio_Afericao_OTDR_Caixa_04.xlsx',
      size: '1.2 MB',
      type: 'Planilha',
      date: 'Hoje, 09:10',
      content: 'Curvas de atenuação óptica por quilômetro aferidas pelo refletômetro óptico (OTDR) no trecho Cascavel Leste.'
    },
    {
      id: 'otg-3',
      name: 'Fotos_Vistoria_Poste_Avenida_Brasil.zip',
      size: '18.4 MB',
      type: 'Compactado',
      date: 'Hoje, 09:45',
      content: 'Pacote com 12 fotos em alta resolução da fixação do drop, ancoragens e suporte BAP no poste da concessionária Copel.'
    },
    {
      id: 'otg-4',
      name: 'Projeto_AsBuilt_FTTH_Cascavel_Leste.dwg',
      size: '4.8 MB',
      type: 'CAD / DWG',
      date: 'Ontem, 16:30',
      content: 'Diagrama unifilar com rota de cabos ópticos, caixas de emenda CEO e posicionamento de splitters 1:8 e 1:16.'
    }
  ]);

  // Mensagens do WhatsApp Corporativo
  const [whatsAppMessages, setWhatsAppMessages] = useState<Array<{ id: string; sender: string; text: string; time: string; fileAttachment?: { name: string; size: string; type: string; fromOtg?: boolean } }>>([
    {
      id: 'wa-1',
      sender: 'Supervisão de Operações Multivale',
      text: 'Bom dia equipe! Ao finalizar as ordens de serviço ou leituras de OTDR no pendrive, enviem aqui no grupo para validação.',
      time: '08:00'
    },
    {
      id: 'wa-2',
      sender: 'Central de NOC & Suporte',
      text: 'Link do cliente Supermercado Paraná liberado no concentrador BNG. Aguardando foto da CTO e medição óptica.',
      time: '08:45'
    }
  ]);

  // Modal de Compartilhamento Direto para o WhatsApp
  const [sharingToWhatsAppFile, setSharingToWhatsAppFile] = useState<{
    name: string;
    size: string;
    type: string;
    content?: string;
    fromOtg?: boolean;
  } | null>(null);
  const [selectedWhatsAppTarget, setSelectedWhatsAppTarget] = useState('Central de NOC & Suporte (+55 41 3099-8800)');
  const [whatsAppCustomNote, setWhatsAppCustomNote] = useState('');

  // Toast de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showKioskToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Arquivos simulados por pasta (Estado dinâmico)
  const [folderFiles, setFolderFiles] = useState<Record<string, Array<{ name: string; size: string; type: string; date: string; content: string }>>>({
    '/storage/emulated/0/MultivaleDocumentos': [
      {
        name: 'Manual_Padrao_Instalacao_FTTH_2026.pdf',
        size: '2.4 MB',
        type: 'PDF',
        date: '01/09/2026',
        content: 'Procedimentos de fusão de fibra óptica monomodo (SM 9/125µm), padrões de fixação de drop flat nas caixas de terminação óptica (CTO) e níveis de sinal aceitáveis (-15 a -22 dBm).'
      },
      {
        name: 'Procedimento_Seguranca_Trabalho_Altura_NR35.pdf',
        size: '1.1 MB',
        type: 'PDF',
        date: '15/08/2026',
        content: 'Checklist obrigatório de EPIs: Capacete com jugular, cinto paraquedista com talabarte duplo, óculos de proteção UV e amarração adequada de escada de fibra.'
      },
      {
        name: 'Catalogo_Codigos_Erros_ONU_Roteadores.pdf',
        size: '3.8 MB',
        type: 'PDF',
        date: '20/08/2026',
        content: 'Guia de diagnóstico das luzes LED de ONUs ZTE, FiberHome e Huawei. LED LOS piscando em vermelho: sinal rompido ou inferior a -27 dBm.'
      }
    ],
    '/storage/emulated/0/MultivaleFotosCampo': [
      {
        name: 'Foto_CTO_Caixa_Atendimento_Rua_15.jpg',
        size: '4.2 MB',
        type: 'Imagem',
        date: 'Hoje, 09:15',
        content: 'Registro fotográfico da ancoragem do cabo drop e conectorização na porta 06 da CTO-04.'
      },
      {
        name: 'Evidencia_Potencia_Sinal_Optico_-19dB.jpg',
        size: '3.1 MB',
        type: 'Imagem',
        date: 'Hoje, 10:40',
        content: 'Foto do display do Power Meter aferindo -19.4 dBm na ponta do conector SC-APC verde.'
      },
      {
        name: 'Assinatura_Cliente_OS_98122.png',
        size: '850 KB',
        type: 'Imagem',
        date: 'Hoje, 11:20',
        content: 'Termo de aceite e entrega de equipamentos assinado pelo cliente titular.'
      }
    ],
    '/storage/emulated/0/Download/Corporativo': [
      {
        name: 'Ordem_Servico_Diaria_Cascavel_Leste.pdf',
        size: '640 KB',
        type: 'PDF',
        date: 'Hoje, 07:30',
        content: 'Itinerário de 6 instalações FTTH e 2 manutenções de link corporativo agendadas para o período matutino e vespertino.'
      },
      {
        name: 'Lista_Contatos_Supervisores_Campo.vcf',
        size: '12 KB',
        type: 'Contato',
        date: '01/09/2026',
        content: 'Ramais e contatos de rádio direto com o NOC Curitiba e Supervisão Regional Oeste.'
      }
    ]
  });

  // Copiar arquivo do Pendrive OTG para a Memória do Celular
  const handleCopyOtgToPhone = (file: { name: string; size: string; type: string; date: string; content: string }) => {
    const targetFolder = '/storage/emulated/0/MultivaleDocumentos';
    setFolderFiles((prev) => {
      const existing = prev[targetFolder] || [];
      if (existing.some((f) => f.name === file.name)) {
        showKioskToast(`O arquivo "${file.name}" já está na pasta corporativa.`);
        return prev;
      }
      return {
        ...prev,
        [targetFolder]: [{ ...file, date: 'Agora (via OTG)' }, ...existing]
      };
    });
    showKioskToast(`Arquivo "${file.name}" copiado com sucesso para /MultivaleDocumentos!`);
  };

  // Copiar arquivo do Celular para o Pendrive Tipo-C
  const handleCopyPhoneToOtg = (file: { name: string; size: string; type: string; date: string; content: string }) => {
    if (!isUsbOtgAllowed) {
      showKioskToast('A entrada Tipo-C está bloqueada para pendrives pela política do Gestor.');
      return;
    }
    if (!isOtgConnected) {
      showKioskToast('Conecte o pendrive USB Tipo-C para transferir o arquivo.');
      return;
    }
    setOtgFiles((prev) => {
      if (prev.some((f) => f.name === file.name)) {
        showKioskToast(`O arquivo "${file.name}" já existe no pendrive Tipo-C.`);
        return prev;
      }
      return [
        {
          id: `otg-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          date: 'Agora (do Celular)',
          content: file.content || 'Arquivo transferido da pasta corporativa do celular.'
        },
        ...prev
      ];
    });
    showKioskToast(`Arquivo "${file.name}" transferido com sucesso para o Pendrive Tipo-C!`);
  };

  // Enviar arquivo para o WhatsApp
  const handleSendFileToWhatsApp = () => {
    if (!sharingToWhatsAppFile) return;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `wa-${Date.now()}`,
      sender: currentEmployee ? currentEmployee.name : 'Técnico de Campo',
      text: whatsAppCustomNote || `Segue em anexo o arquivo "${sharingToWhatsAppFile.name}" extraído via ${sharingToWhatsAppFile.fromOtg ? 'Pendrive USB Tipo-C (OTG)' : 'pasta corporativa'} para validação da OS.`,
      time: nowTime,
      fileAttachment: {
        name: sharingToWhatsAppFile.name,
        size: sharingToWhatsAppFile.size,
        type: sharingToWhatsAppFile.type,
        fromOtg: sharingToWhatsAppFile.fromOtg
      }
    };
    setWhatsAppMessages((prev) => [...prev, newMsg]);
    showKioskToast(`Arquivo "${sharingToWhatsAppFile.name}" enviado com sucesso via WhatsApp Corporativo para ${selectedWhatsAppTarget}!`);
    setSharingToWhatsAppFile(null);
    setWhatsAppCustomNote('');
  };

  // Disparo de chamado SOS
  const handleTriggerSos = async () => {
    if (!sosMessage.trim()) return;
    const fullMsg = sosCategory ? `[${sosCategory}] ${sosMessage}` : sosMessage;
    await onSendAlert(
      currentDevice.id,
      `SOS Colaborador (${currentEmployee?.name || 'Técnico'}): ${fullMsg}`,
      'ALTA'
    );
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      setSosMessage('');
      setSosCategory('');
    }, 4000);
  };

  return (
    <div className="min-h-screen w-full bg-[#080B11] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Container Responsivo para Celular / Tablet */}
      <div className="w-full max-w-xl mx-auto min-h-screen flex flex-col bg-[#0B0F17] sm:border-x sm:border-slate-800/80 sm:shadow-2xl relative">
        
        {/* ========================================================================= */}
        {/* 1. BARRA DE TOPO: BRANDING MULTIVALE + BOTÃO ÁREA DO GESTOR */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-30 bg-[#0E131E]/95 backdrop-blur-md border-b border-slate-800/90 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-900/40">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">MULTIVALE</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MDM Travado
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Modo Corporativo Colaborador
              </span>
            </div>
          </div>

          {/* Botão de Acesso do Gestor com Cadeado */}
          <button
            onClick={() => setIsGestorLoginOpen(true)}
            className="bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/60 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
            title="Área com senha e login para gestores"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Área do Gestor</span>
          </button>
        </header>

        {/* ========================================================================= */}
        {/* 2. CARD DO COLABORADOR & APRELHO */}
        {/* ========================================================================= */}
        <div className="p-4 pb-2 space-y-3">
          <div className="bg-gradient-to-r from-[#121724] to-[#151C2C] border border-slate-800/90 rounded-2xl p-3.5 shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base flex-shrink-0 shadow-inner">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-white truncate leading-tight">
                    {currentEmployee?.name || 'Carlos Silva'}
                  </h1>
                  <p className="text-xs text-slate-300 truncate">
                    {currentEmployee?.jobTitle || 'Técnico de Instalação FTTH'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Matrícula: {currentEmployee?.registrationNumber || 'MV-8821'} • {currentDevice?.teamName || 'Cascavel Leste'}
                  </p>
                </div>
              </div>

              {/* Status Rápido do Aparelho */}
              <div className="flex flex-col items-end flex-shrink-0 text-right">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" />
                  4G Vivo
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  88%
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {currentDevice?.model || 'Galaxy A15'}
                </span>
              </div>
            </div>

            {/* Política Ativa Banner */}
            <div className="bg-black/40 rounded-xl px-3 py-2 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-semibold truncate">Política: {currentPolicy?.name || 'Operacional Campo'}</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex-shrink-0">
                {(allowedApps || []).length} Apps Liberados
              </span>
            </div>
          </div>

          {/* Seletor de Aparelho (Útil para testes no sistema) */}
          {(devices || []).length > 1 && (
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Alternar Celular de Teste:</span>
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  onSelectDevice?.(e.target.value);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.employeeName || d.name} ({d.model})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 3. ABAS DE NAVEGAÇÃO DO CELULAR (GRANDES E FÁCEIS DE TOCAR COM O DEDO) */}
          {/* ======================================================================= */}
          <nav className="grid grid-cols-4 gap-1.5 bg-[#121622] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('apps')}
              className={`py-2.5 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                activeTab === 'apps'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span>Apps</span>
            </button>

            <button
              onClick={() => setActiveTab('folders')}
              className={`py-2.5 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                activeTab === 'folders'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderCheck className="w-5 h-5" />
              <span>Pastas</span>
            </button>

            <button
              onClick={() => setActiveTab('device')}
              className={`py-2.5 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                activeTab === 'device'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Status</span>
            </button>

            <button
              onClick={() => setActiveTab('sos')}
              className={`py-2.5 px-1 rounded-xl text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                activeTab === 'sos'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>SOS TI</span>
            </button>
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* 4. CONTEÚDO PRINCIPAL (ÁREA CENTRAL COM SCROLL CONFORTÁVEL) */}
        {/* ========================================================================= */}
        <main className="flex-1 p-4 pt-2 pb-24 overflow-y-auto custom-scrollbar">

          {/* ----------------------------------------------------------------------- */}
          {/* ABA 1: APLICATIVOS LIBERADOS */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'apps' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Aplicativos de Trabalho Autorizados</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Toque no aplicativo para abrir
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                  {(allowedApps || []).length} Homologados
                </span>
              </div>

              {/* Grade de Aplicativos em Tamanho Confortável para Dedo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allowedApps.map((app) => {
                  const appName = app?.name || app?.packageName || 'Aplicativo';
                  const nameLower = (app?.name || '').toLowerCase();
                  const pkgLower = (app?.packageName || '').toLowerCase();
                  const isWhats = nameLower.includes('whats') || pkgLower.includes('whatsapp');
                  const isMaps = nameLower.includes('maps') || nameLower.includes('waze') || nameLower.includes('rotas') || pkgLower.includes('maps');
                  const isPhone = nameLower.includes('telef') || nameLower.includes('chamad') || pkgLower.includes('dialer');
                  const isCamera = nameLower.includes('camer') || nameLower.includes('foto') || pkgLower.includes('camera');
                  const isCalc = nameLower.includes('calc') || pkgLower.includes('calc');

                  return (
                    <button
                      key={app.id}
                      onClick={() => setOpenedApp(app)}
                      className="bg-[#121622] hover:bg-[#181F2E] border border-slate-800 hover:border-blue-500/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 transition active:scale-95 text-center shadow-md group relative min-h-[120px]"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                          isWhats
                            ? 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-emerald-900/30'
                            : isMaps
                            ? 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-sky-900/30'
                            : isPhone
                            ? 'bg-gradient-to-tr from-blue-700 to-indigo-500 text-white shadow-blue-900/30'
                            : isCamera
                            ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-900/30'
                            : isCalc
                            ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-900/30'
                            : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-900/30'
                        }`}
                      >
                        {isWhats ? (
                          <MessageSquare className="w-7 h-7" />
                        ) : isMaps ? (
                          <Compass className="w-7 h-7" />
                        ) : isPhone ? (
                          <Phone className="w-7 h-7" />
                        ) : isCamera ? (
                          <Camera className="w-7 h-7" />
                        ) : isCalc ? (
                          <Calculator className="w-7 h-7" />
                        ) : (
                          <FileText className="w-7 h-7" />
                        )}
                      </div>

                      <div className="w-full">
                        <span className="text-xs sm:text-sm font-bold text-white block truncate leading-tight group-hover:text-blue-300">
                          {app.name || app.packageName || 'Aplicativo'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                          Liberado
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Seção de Demonstração de Aplicativos Bloqueados */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Aplicativos Bloqueados pelo MDM Multivale:</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Teste o bloqueio</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: 'YouTube', type: 'Vídeos Pessoais' },
                    { name: 'Instagram', type: 'Rede Social' },
                    { name: 'TikTok', type: 'Rede Social' },
                    { name: 'Play Store', type: 'Instalação Bloqueada' },
                    { name: 'Jogos / Games', type: 'Lazer' },
                    { name: 'Ajustes Android', type: 'Sistema Travado' }
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setBlockedAttemptApp(item.name)}
                      className="bg-rose-950/20 hover:bg-rose-900/40 border border-rose-800/40 rounded-xl p-2.5 text-left transition flex items-center gap-2 group active:scale-95"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-900/50 text-rose-300 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-rose-200 block truncate group-hover:text-white">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-rose-400/80 block truncate">
                          Bloqueado
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ABA 2: PASTAS E ARQUIVOS LIBERADOS */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'folders' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Card Específico: ENTRADA USB TIPO-C & PENDRIVE OTG */}
              {isUsbOtgAllowed ? (
                <div className="bg-emerald-950/30 border border-emerald-800/70 rounded-2xl p-4 space-y-3 shadow-lg shadow-emerald-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Usb className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white">
                            Entrada USB Tipo-C: Pendrive OTG
                          </h3>
                          <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                            LIBERADO
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-300/80 block">
                          SanDisk Ultra Dual Drive USB-C (64 GB) • FAT32
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isOtgConnected;
                          setIsOtgConnected(nextState);
                          showKioskToast(
                            nextState
                              ? 'Pendrive USB Tipo-C conectado com sucesso!'
                              : 'Pendrive USB Tipo-C ejetado com segurança.'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isOtgConnected
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        }`}
                      >
                        <Usb className="w-3.5 h-3.5" />
                        <span>{isOtgConnected ? 'Ejetar com Segurança' : 'Conectar Pendrive'}</span>
                      </button>
                    </div>
                  </div>

                  {isOtgConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-bold flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Arquivos no Pendrive Tipo-C ({(otgFiles || []).length})</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Passe para o celular ou envie direto p/ WhatsApp
                        </span>
                      </div>

                      <div className="space-y-2">
                        {otgFiles.map((file) => (
                          <div
                            key={file.id}
                            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div
                              onClick={() => setViewingFile(file)}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-white font-bold text-xs truncate block hover:text-emerald-300">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {file.date} • {file.size} • {file.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              {/* Botão Principal: Enviar Direto para o WhatsApp */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSharingToWhatsAppFile({ ...file, fromOtg: true });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                                title="Enviar este arquivo do pendrive para o WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Enviar p/ WhatsApp</span>
                              </button>

                              {/* Botão: Copiar para o Celular */}
                              <button
                                type="button"
                                onClick={() => handleCopyOtgToPhone(file)}
                                className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
                                title="Copiar arquivo para a memória corporativa do smartphone"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Salvar no Celular</span>
                              </button>

                              {/* Visualizar */}
                              <button
                                type="button"
                                onClick={() => setViewingFile(file)}
                                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                                title="Visualizar"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                      <Usb className="w-8 h-8 text-slate-500 mx-auto" />
                      <span className="text-xs font-bold text-slate-300 block">Nenhum pendrive Tipo-C conectado</span>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Espete um pendrive USB Tipo-C na entrada do celular para ler medições, relatórios e fotos de campo.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtgConnected(true);
                          showKioskToast('Pendrive USB Tipo-C conectado!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Simular Conexão de Pendrive Tipo-C
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-2xl p-4 text-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-900/40 text-rose-400 flex items-center justify-center">
                        <Usb className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Entrada USB Tipo-C: Bloqueada pelo Gestor</h4>
                        <span className="text-[10px] text-rose-400 font-mono">Restrição de Segurança Android Enterprise</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-900 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700">
                      BLOQUEADO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-rose-900/40">
                    A leitura e transferência de arquivos via pendrive OTG na porta Tipo-C está <strong className="text-rose-400">bloqueada</strong> pela política corporativa. A porta Tipo-C aceita somente carregador de bateria.
                  </p>
                </div>
              )}

              <div className="bg-amber-950/20 border border-amber-800/50 rounded-2xl p-3.5 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <FolderLock className="w-4 h-4" />
                  <span>Pastas Oficiais na Memória do Celular</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  O colaborador tem acesso somente às pastas oficiais de trabalho abaixo. Todas as outras pastas da memória interna, fotos pessoais e downloads gerais estão protegidas e bloqueadas.
                </p>
              </div>

              {/* Lista de Pastas Liberadas */}
              <div className="space-y-3">
                {allowedFolders.map((folderPath) => {
                  const folderName = folderPath.split('/').filter(Boolean).pop() || folderPath;
                  const files = folderFiles[folderPath] || [];

                  return (
                    <div
                      key={folderPath}
                      className="bg-[#121622] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                            <FolderCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-white truncate">
                              /{folderName}
                            </h3>
                            <span className="font-mono text-[11px] text-slate-400 block truncate">
                              {folderPath}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-amber-300 font-semibold bg-amber-950/70 border border-amber-800/70 px-2.5 py-1 rounded-lg font-mono flex-shrink-0">
                          {(files || []).length} arquivos
                        </span>
                      </div>

                      {/* Lista de Arquivos da Pasta */}
                      <div className="space-y-2 pt-1 border-t border-slate-800/90">
                        {files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 transition text-xs group gap-2"
                          >
                            <div
                              onClick={() => setViewingFile(file)}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                            >
                              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="text-slate-200 group-hover:text-blue-300 font-medium truncate block text-xs sm:text-sm">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {file.date} • {file.type} • {file.size}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              {/* Enviar Direto para o WhatsApp */}
                              <button
                                type="button"
                                onClick={() => setSharingToWhatsAppFile({ ...file, fromOtg: false })}
                                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
                                title="Enviar pelo WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </button>

                              {/* Copiar para Pendrive OTG se liberado */}
                              {isUsbOtgAllowed && isOtgConnected && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhoneToOtg(file)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs px-2 py-1.5 rounded-lg flex items-center gap-1 transition"
                                  title="Copiar para Pendrive USB Tipo-C"
                                >
                                  <Usb className="w-3 h-3 text-emerald-400" />
                                  <span className="hidden sm:inline">Copiar p/ Pendrive</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setViewingFile(file)}
                                className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                                title="Visualizar"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aviso de Bloqueio das Demais Pastas */}
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-3.5 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Raiz do Android e Pastas Pessoais Travadas</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Pastas como <code className="text-rose-300">/DCIM/Camera_Pessoal</code>, <code className="text-rose-300">/WhatsApp/Media</code> e arquivos de sistema ficam inacessíveis sem autorização expressa do Gestor.
                </p>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ABA 3: STATUS DO DISPOSITIVO */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'device' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Parâmetros do Celular Corporativo</h2>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conforme
                </span>
              </div>

              <div className="bg-[#121622] border border-slate-800 rounded-2xl p-4 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Modelo do Smartphone:</span>
                  <span className="font-bold text-white">{currentDevice?.manufacturer} {currentDevice?.model}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Versão do Android:</span>
                  <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    Android {currentDevice?.androidVersion || '14'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">IMEI Registrado:</span>
                  <span className="font-mono text-blue-400">{currentDevice?.imei}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Número da Linha:</span>
                  <span className="font-mono text-white">{currentDevice?.phoneNumber || '(45) 99821-4401'}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Operadora Corporativa:</span>
                  <span className="text-white font-medium">{currentDevice?.operator || 'Claro Corporativo'}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Status no Cloud Firestore:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Conectado em Tempo Real</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Localização GPS:</span>
                  <span className="font-mono text-slate-300 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    Cascavel, PR (-24.955, -53.459)
                  </span>
                </div>
              </div>

              {/* Botão de Sincronização */}
              <button
                type="button"
                onClick={() => {
                  alert('Políticas checadas com o servidor central da Multivale. Dispositivo em total conformidade!');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/30 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Checar Atualizações de Políticas MDM</span>
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* ABA 4: SOS / SUPORTE TI */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'sos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Central de Emergência e Suporte de Campo</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Envie um alerta prioritário direto para o painel dos gestores de TI e frota em caso de imprevisto, falha no sinal óptico, pane no veículo ou necessidade de liberação de aplicativo.
                </p>
              </div>

              {sosSent ? (
                <div className="bg-emerald-950/70 border border-emerald-800 rounded-2xl p-6 text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Alerta Enviado para os Gestores!</h4>
                  <p className="text-xs text-slate-300">
                    Sua localização GPS e mensagem foram registradas no painel da central.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-[#121622] p-4 rounded-2xl border border-slate-800">
                  {/* Categorias Rápidas */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Motivo do Chamado:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        'Sem Sinal Óptico (Fibra)',
                        'Problema no Veículo',
                        'App Travando',
                        'Dúvida com Cliente'
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSosCategory(cat)}
                          className={`p-2 rounded-xl text-left font-medium transition border ${
                            sosCategory === cat
                              ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Descrição da Solicitação:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explique o que aconteceu para o gestor..."
                      value={sosMessage}
                      onChange={(e) => setSosMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerSos}
                    disabled={!sosMessage.trim()}
                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Disparar Alerta para a Gestão</span>
                  </button>
                </div>
              )}

              {/* Botão de Ligação Rápida para o Suporte */}
              <div className="pt-2">
                <a
                  href="tel:4130998800"
                  className="w-full bg-[#121622] hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-3.5 flex items-center justify-between text-xs sm:text-sm text-slate-200 transition"
                >
                  <span className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Central de Suporte TI Multivale</span>
                      <span className="text-[11px] text-slate-400">Atendimento 24/7 para técnicos em campo</span>
                    </div>
                  </span>
                  <span className="font-mono text-xs text-blue-400 font-bold">(41) 3099-8800</span>
                </a>
              </div>
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* MODAL: SIMULADOR DE APP EM EXECUÇÃO */}
        {/* ========================================================================= */}
        {openedApp && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-[#10141E] border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Header do App com Botão Voltar Bem Grande */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setOpenedApp(null)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Kiosk</span>
                </button>

                <div className="text-right">
                  <h3 className="text-sm font-bold text-white">{openedApp.name || openedApp.packageName || 'Aplicativo'}</h3>
                  <span className="text-[10px] font-mono text-emerald-400">App Homologado</span>
                </div>
              </div>

              {/* Conteúdo do Aplicativo */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs sm:text-sm">
                {(() => {
                  const openedAppName = (openedApp?.name || openedApp?.packageName || '').toLowerCase();
                  const openedAppPkg = (openedApp?.packageName || '').toLowerCase();
                  const isOpenedWhats = openedAppName.includes('whats') || openedAppPkg.includes('whatsapp');
                  const isOpenedField = openedAppName.includes('ordem') || openedAppName.includes('campo') || openedAppPkg.includes('campo');
                  const isOpenedPhone = openedAppName.includes('telef') || openedAppName.includes('chamad') || openedAppPkg.includes('dialer');
                  const isOpenedCamera = openedAppName.includes('camer') || openedAppName.includes('foto') || openedAppPkg.includes('camera');

                  if (isOpenedWhats) {
                    return (
                      <div className="space-y-3">
                        <div className="bg-[#121b22] border border-emerald-800/40 rounded-2xl p-3 text-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs block text-white">Central Multivale & Campo</span>
                              <span className="text-[10px] text-emerald-400">Online • Criptografia Corporativa</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                            WhatsApp Integrado
                          </span>
                        </div>

                        {/* Chat Messages */}
                        <div className="bg-[#0b141a] rounded-2xl p-3 border border-slate-800 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                          {whatsAppMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                                msg.sender.includes('Técnico') || msg.sender === currentEmployee?.name
                                  ? 'ml-auto bg-[#005c4b] text-white rounded-tr-none'
                                  : 'mr-auto bg-[#202c33] text-slate-200 rounded-tl-none'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-[11px] text-emerald-300">{msg.sender}</span>
                                <span className="text-[9px] text-slate-400">{msg.time}</span>
                              </div>
                              <p className="leading-relaxed">{msg.text}</p>

                              {/* Se tiver arquivo anexo */}
                              {msg.fileAttachment && (
                                <div className="mt-2 p-2 bg-black/30 rounded-lg border border-white/10 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {msg.fileAttachment.fromOtg ? (
                                      <Usb className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-mono text-[11px] font-bold truncate block text-white">
                                        {msg.fileAttachment.name}
                                      </span>
                                      <span className="text-[9px] text-emerald-200 block font-mono">
                                        {msg.fileAttachment.size} • {msg.fileAttachment.fromOtg ? 'Via Pendrive USB Tipo-C (OTG)' : 'Arquivo Interno'}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showKioskToast(`Visualizando anexo ${msg.fileAttachment?.name}`);
                                    }}
                                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white font-bold"
                                  >
                                    Abrir
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Barra de Ações Rápidas: Anexar do Pendrive OTG */}
                        {isUsbOtgAllowed && isOtgConnected && (
                          <div className="bg-[#121622] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Usb className="w-3.5 h-3.5" />
                              <span>Anexar Arquivo do Pendrive USB Tipo-C</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {otgFiles.slice(0, 3).map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => {
                                    setSharingToWhatsAppFile({ ...f, fromOtg: true });
                                  }}
                                  className="bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition truncate max-w-[200px]"
                                >
                                  <FileText className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                  <span className="truncate">{f.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <a
                          href="https://wa.me/554130998800"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-[#00a884] hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Abrir no Aplicativo WhatsApp Externo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  }

                  if (isOpenedField) {
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 text-blue-200">
                          <span className="font-bold text-sm block mb-1">Ordem de Serviço #98122 - Em Andamento</span>
                          <p className="text-xs text-slate-300">
                            Cliente: Supermercado Paraná Ltda • Instalação Fibra 500 Mbps • Av. Brasil, 4500
                          </p>
                        </div>

                        {osFormSubmitted ? (
                          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-6 text-center space-y-2">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                            <h4 className="text-sm font-bold text-white">Ordem Concluída e Assinada!</h4>
                            <p className="text-xs text-slate-300">
                              Dados sincronizados com o sistema central de faturamento.
                            </p>
                            <button
                              onClick={() => setOsFormSubmitted(false)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl mt-2"
                            >
                              Editar Dados da OS
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                            <div>
                              <label className="text-xs text-slate-400 font-bold block mb-1">Potência Óptica Medida (dBm):</label>
                              <input
                                type="text"
                                defaultValue="-19.4 dBm"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-slate-400 font-bold block mb-1">Serial da ONU Instalada:</label>
                              <input
                                type="text"
                                defaultValue="ZTEGC1829910"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                              />
                            </div>

                            <button
                              onClick={() => setOsFormSubmitted(true)}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 transition shadow"
                            >
                              Salvar e Concluir Instalação
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (isOpenedPhone) {
                    return (
                      <div className="space-y-4 text-center">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-2xl font-bold text-white tracking-widest min-h-[50px] flex items-center justify-center">
                          {phoneDialerNumber || '(41) 3099-8800'}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((n) => (
                            <button
                              key={n}
                              onClick={() => setPhoneDialerNumber((prev) => prev + n)}
                              className="h-12 bg-slate-800/80 hover:bg-slate-700 text-white font-mono font-bold text-lg rounded-xl transition"
                            >
                              {n}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setPhoneDialerNumber('')}
                            className="flex-1 bg-slate-800 text-rose-400 font-bold py-3 rounded-xl text-xs"
                          >
                            Limpar
                          </button>
                          <a
                            href={`tel:${phoneDialerNumber || '4130998800'}`}
                            className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Chamar Linha</span>
                          </a>
                        </div>
                      </div>
                    );
                  }

                  if (isOpenedCamera) {
                    return (
                      <div className="space-y-4 text-center">
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl h-56 flex flex-col items-center justify-center p-4">
                          {cameraCaptured ? (
                            <div className="space-y-2">
                              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                              <span className="font-bold text-white text-sm block">Foto Salva na Pasta Corporativa!</span>
                              <span className="text-xs text-slate-400 font-mono block">/MultivaleFotosCampo/IMG_2026_0903.jpg</span>
                            </div>
                          ) : (
                            <div className="space-y-2 text-slate-400">
                              <Camera className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                              <span className="text-xs block">Visor da Câmera Operacional</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setCameraCaptured(!cameraCaptured)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition"
                        >
                          {cameraCaptured ? 'Capturar Nova Foto' : 'Tirar Foto do Ponto de Fixação'}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                      <Smartphone className="w-12 h-12 text-blue-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">{openedApp.name || openedApp.packageName || 'Aplicativo'}</h4>
                      <p className="text-xs text-slate-300">
                        Aplicativo operando sob conformidade com o agente Android Device Owner da Multivale Telecom.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: AVISO DE APLICATIVO BLOQUEADO */}
        {/* ========================================================================= */}
        {blockedAttemptApp && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#121622] border border-rose-800/80 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl shadow-rose-950/50">
              <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Acesso Não Autorizado</h3>
                <span className="text-xs text-rose-400 font-bold block mt-1">
                  {blockedAttemptApp}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                Este aplicativo está <strong className="text-rose-300">bloqueado</strong> pelas políticas de segurança da Multivale Telecom para o perfil de trabalho deste smartphone.
              </p>

              <button
                onClick={() => setBlockedAttemptApp(null)}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Entendi e Voltar
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: VISUALIZADOR DE ARQUIVO */}
        {/* ========================================================================= */}
        {viewingFile && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#10141E] border border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{viewingFile.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{viewingFile.size} • {viewingFile.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => setViewingFile(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-blue-400 block uppercase tracking-wider">Conteúdo do Arquivo:</span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {viewingFile.content || 'Documento homologado pela Diretoria de Operações e TI da Multivale Telecom.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const fileToShare = viewingFile;
                      const fromOtg = otgFiles.some((f) => f.name === fileToShare.name);
                      setViewingFile(null);
                      setSharingToWhatsAppFile({ ...fileToShare, fromOtg });
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar este Arquivo para o WhatsApp</span>
                  </button>

                  {isUsbOtgAllowed && isOtgConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyPhoneToOtg(viewingFile as any);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs border border-slate-700"
                    >
                      <Usb className="w-4 h-4 text-emerald-400" />
                      <span>Copiar p/ Pendrive USB Tipo-C</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      showKioskToast(`Arquivo ${viewingFile.name} salvo na pasta de downloads.`);
                      setViewingFile(null);
                    }}
                    className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs border border-blue-500/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Cópia na Memória Interna</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: COMPARTILHAR ARQUIVO DIRETAMENTE NO WHATSAPP */}
        {/* ========================================================================= */}
        {sharingToWhatsAppFile && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#10141E] border border-emerald-700/60 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 bg-emerald-950/60 border-b border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Enviar para o WhatsApp</h4>
                    <span className="text-[10px] text-emerald-300">Integração de Campo Multivale</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSharingToWhatsAppFile(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs sm:text-sm">
                {/* Card do Arquivo Sendo Enviado */}
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Arquivo Anexo:</span>
                    {sharingToWhatsAppFile.fromOtg ? (
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1 font-mono">
                        <Usb className="w-3 h-3" />
                        Via Pendrive USB Tipo-C (OTG)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800 flex items-center gap-1 font-mono">
                        <FolderCheck className="w-3 h-3" />
                        Memória Corporativa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate text-xs sm:text-sm">
                        {sharingToWhatsAppFile.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {sharingToWhatsAppFile.size} • {sharingToWhatsAppFile.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seleção do Destinatário */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Destinatário do WhatsApp:</label>
                  <select
                    value={selectedWhatsAppTarget}
                    onChange={(e) => setSelectedWhatsAppTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Central de NOC & Suporte (+55 41 3099-8800)">Central de NOC & Suporte (+55 41 3099-8800)</option>
                    <option value="Supervisão Regional de Operações Oeste">Supervisão Regional de Operações Oeste</option>
                    <option value="Engenharia de Redes & FTTH">Engenharia de Redes & FTTH</option>
                    <option value="Cliente da OS (Supermercado Paraná)">Cliente da OS (Supermercado Paraná)</option>
                  </select>
                </div>

                {/* Mensagem / Observação */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Mensagem de Acompanhamento (Opcional):</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Segue relatório extraído do pendrive OTG após medição no poste..."
                    value={whatsAppCustomNote}
                    onChange={(e) => setWhatsAppCustomNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSendFileToWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar Envio pelo WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSharingToWhatsAppFile(null)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOAST DE FEEDBACK FLUTUANTE */}
        {/* ========================================================================= */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/70 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-100">{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: LOGIN / SENHA DO GESTOR (ÁREA RESTRITA) */}
        {/* ========================================================================= */}
        <GestorLoginModal
          isOpen={isGestorLoginOpen}
          onClose={() => setIsGestorLoginOpen(false)}
          onSuccess={() => {
            setIsGestorLoginOpen(false);
            onExitKiosk();
          }}
        />

      </div>
    </div>
  );
};
