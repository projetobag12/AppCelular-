import React, { useState, useEffect } from 'react';
import {
  Shield,
  Wifi,
  Battery,
  Lock,
  Sparkles,
  AlertTriangle,
  X,
  PhoneCall,
  KeyRound,
  ArrowLeft,
  SlidersHorizontal,
  Globe,
  Globe2,
  MapPin,
  Navigation,
  MessageCircle,
  Send,
  Radio,
  Bluetooth,
  WifiOff,
  Briefcase,
  MessageSquare,
  ClipboardCheck,
  Headphones,
  Calculator,
  Calendar,
  Layers,
  Folder,
  Cable,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Bell,
  UserCheck
} from 'lucide-react';
import {
  SecurityPolicy,
  WhitelistedApp,
  CorporateDevice,
  CompanySettings,
  WebFilterDomain,
  ChatMessage,
  CrmCustomer,
  SupportTicket,
  FieldInspectionReport
} from '../types';

import { InternalChatApp } from './phone/InternalChatApp';
import { InternalCrmApp } from './phone/InternalCrmApp';
import { InternalBrowserApp } from './phone/InternalBrowserApp';
import { InternalFieldCheckApp } from './phone/InternalFieldCheckApp';
import { InternalTicketsApp } from './phone/InternalTicketsApp';
import { InternalCalcApp } from './phone/InternalCalcApp';
import { InternalCalendarApp } from './phone/InternalCalendarApp';
import { InternalSettingsApp } from './phone/InternalSettingsApp';
import { InternalGoogleEarthApp } from './phone/InternalGoogleEarthApp';
import { InternalGoogleMapsApp } from './phone/InternalGoogleMapsApp';
import { InternalWazeApp } from './phone/InternalWazeApp';
import { InternalWhatsAppCorpApp } from './phone/InternalWhatsAppCorpApp';
import { InternalTelegramCorpApp } from './phone/InternalTelegramCorpApp';
import { InternalFindSitesApp } from './phone/InternalFindSitesApp';
import { InternalFilesApp } from './phone/InternalFilesApp';

interface PhoneSimulatorProps {
  policy: SecurityPolicy;
  apps: WhitelistedApp[];
  activeDevice: CorporateDevice;
  companySettings: CompanySettings;
  whitelistedDomains: WebFilterDomain[];
  chatMessages: ChatMessage[];
  crmCustomers: CrmCustomer[];
  supportTickets: SupportTicket[];
  fieldReports: FieldInspectionReport[];
  onSendMessage: (text: string, channel: 'geral' | 'vendas' | 'suporte' | 'avisos') => void;
  onRecordIncident: (eventType: any, details: string, target?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  onEmergencyUnlock: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  policy,
  apps,
  activeDevice,
  companySettings,
  whitelistedDomains,
  chatMessages,
  crmCustomers,
  supportTickets,
  fieldReports,
  onSendMessage,
  onRecordIncident,
  onEmergencyUnlock,
}) => {
  const [currentTime, setCurrentTime] = useState('12:00');
  const [currentDate, setCurrentDate] = useState('Quarta-feira, 2 de Setembro');
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [adminPinSuccess, setAdminPinSuccess] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [devicePushAlert, setDevicePushAlert] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Icon Resolver
  const renderAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe2':
        return <Globe2 className="w-6 h-6 text-white" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-white" />;
      case 'Navigation':
        return <Navigation className="w-6 h-6 text-white" />;
      case 'MessageCircle':
        return <MessageCircle className="w-6 h-6 text-white" />;
      case 'Send':
        return <Send className="w-6 h-6 text-white" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-white" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6 text-white" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-white" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-white" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-6 h-6 text-white" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-white" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-white" />;
      case 'Calendar':
        return <Calendar className="w-6 h-6 text-white" />;
      case 'Folder':
        return <Folder className="w-6 h-6 text-white" />;
      case 'Cable':
        return <Cable className="w-6 h-6 text-white" />;
      case 'SlidersHorizontal':
        return <SlidersHorizontal className="w-6 h-6 text-white" />;
      default:
        return <Layers className="w-6 h-6 text-white" />;
    }
  };

  const handleTriggerSecurityViolation = (
    title: string,
    desc: string,
    eventType: any,
    targetResource: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) => {
    setShowViolationModal({ title, desc, type: eventType });
    onRecordIncident(eventType, desc, targetResource, severity);
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === policy.masterAdminBypassPin) {
      setAdminPinSuccess(true);
      setAdminPinError(false);
      setTimeout(() => {
        setAdminPinSuccess(false);
        setShowAdminUnlockModal(false);
        setAdminPinInput('');
        onEmergencyUnlock();
      }, 1200);
    } else {
      setAdminPinError(true);
      onRecordIncident('failed_pin', `Tentativa com PIN incorreto: "${adminPinInput}"`, 'Lockscreen DPC', 'medium');
    }
  };

  // Render active open app component
  const renderOpenedApp = () => {
    switch (openAppId) {
      case 'app-earth':
        return <InternalGoogleEarthApp />;
      case 'app-maps':
        return <InternalGoogleMapsApp device={activeDevice} onRecordIncident={onRecordIncident} />;
      case 'app-waze':
        return <InternalWazeApp />;
      case 'app-whatsapp':
        return <InternalWhatsAppCorpApp />;
      case 'app-telegram':
        return <InternalTelegramCorpApp />;
      case 'app-findsites':
        return <InternalFindSitesApp />;
      case 'app-files':
        return <InternalFilesApp />;
      case 'app-chat':
        return <InternalChatApp messages={chatMessages} onSendMessage={onSendMessage} />;
      case 'app-crm':
        return <InternalCrmApp customers={crmCustomers} />;
      case 'app-browser':
        return (
          <InternalBrowserApp
            whitelistedDomains={whitelistedDomains}
            onTriggerViolation={(url) =>
              handleTriggerSecurityViolation(
                'Navegação Externa Bloqueada',
                `Tentativa de acesso ao domínio restrito: ${url}`,
                'blocked_url',
                url,
                'medium'
              )
            }
          />
        );
      case 'app-field':
        return <InternalFieldCheckApp reports={fieldReports} />;
      case 'app-tickets':
        return <InternalTicketsApp tickets={supportTickets} supportPhone={companySettings.supportPhone} />;
      case 'app-calc':
        return <InternalCalcApp />;
      case 'app-calendar':
        return <InternalCalendarApp />;
      case 'app-settings':
        return (
          <InternalSettingsApp
            policy={policy}
            device={activeDevice}
            companySettings={companySettings}
            onAdminBypassRequest={() => setShowAdminUnlockModal(true)}
            onTriggerViolation={(action) =>
              handleTriggerSecurityViolation(
                'Menu Restrito Bloqueado',
                `Tentativa de acesso não autorizada a: ${action}`,
                'blocked_settings',
                action,
                'high'
              )
            }
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-300">
            <Layers className="w-12 h-12 text-blue-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Aplicativo Corporativo Homologado</h4>
            <p className="text-xs text-slate-400 mt-1">Executando em ambiente seguro e isolado (Sandbox).</p>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center transition-all ${isMaximized ? 'w-full' : 'max-w-md mx-auto'}`}>
      {/* Remote Lock Full Overlay if device was locked from Admin Console */}
      {activeDevice.isRemotelyLocked && (
        <div className="fixed inset-0 z-50 bg-red-950/95 flex flex-col items-center justify-center p-6 text-center text-white backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-4 animate-pulse shadow-2xl">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">DISPOSITIVO BLOQUEADO REMOTAMENTE</h2>
          <p className="text-base text-red-200 mt-2 max-w-lg font-medium">
            {activeDevice.lockMessage || 'Este smartphone foi bloqueado pelo Administrador MDM da empresa por motivo de segurança ou perda.'}
          </p>
          <div className="mt-6 bg-black/60 p-4 rounded-xl border border-red-800 text-xs font-mono text-slate-300 max-w-md w-full text-left space-y-1">
            <p><span className="text-red-400">Patrimônio:</span> {activeDevice.assetTag}</p>
            <p><span className="text-red-400">IMEI:</span> {activeDevice.imei}</p>
            <p><span className="text-red-400">Suporte:</span> {companySettings.supportPhone} ({companySettings.supportEmail})</p>
          </div>
          <button
            onClick={() => setShowAdminUnlockModal(true)}
            className="mt-6 bg-white text-red-900 font-bold px-6 py-2.5 rounded-xl text-sm shadow-xl hover:bg-slate-200 transition flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Desbloquear via PIN do Administrador
          </button>
        </div>
      )}

      {/* Control Strip above Phone */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-semibold text-slate-200">Terminal em Modo Quiosque Ativo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg bg-[#1A1D23] hover:bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-800 transition"
            title={isMaximized ? 'Tamanho Padrão' : 'Expandir'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isMaximized ? 'Compactar' : 'Expandir'}
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Chassis / Frame */}
      <div
        className={`relative bg-[#0F1115] border-[8px] border-[#1A1D23] rounded-[42px] shadow-2xl overflow-hidden kiosk-phone-shadow transition-all duration-300 ${
          isMaximized ? 'w-full max-w-xl h-[780px]' : 'w-[370px] sm:w-[390px] h-[720px]'
        }`}
        style={{
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Top Punch Hole Camera & Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#0F1115] rounded-b-xl z-40 flex items-center justify-center gap-3 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16191E] border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900"></div>
          </div>
          <div className="w-10 h-1 bg-[#1A1D23] rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className="relative w-full h-full flex flex-col bg-[#0F1115] text-slate-100 overflow-hidden">
          
          {/* Status Bar */}
          <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 select-none bg-[#12141A]/90 backdrop-blur-sm border-b border-slate-800/60">
            <span className="font-mono tracking-tight">{currentTime}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-[9px] text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/60 font-mono font-semibold">
                <Lock className="w-2.5 h-2.5" /> VPN
              </span>
              <span className="flex items-center gap-0.5 text-[9px] text-blue-300" title="Bluetooth Liberado para uso profissional">
                <Bluetooth className="w-3 h-3 text-blue-400" />
              </span>
              <span className="flex items-center gap-0.5 text-[9px] text-emerald-400" title="Cabo USB / MTP Liberado para Arquivos">
                <Cable className="w-3 h-3 text-emerald-400" />
              </span>
              <span className="flex items-center gap-0.5 text-[9px] text-red-400" title="Roteamento / Hotspot Bloqueado">
                <WifiOff className="w-2.5 h-2.5 text-red-400" />
              </span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span>{activeDevice.batteryLevel}%</span>
                <Battery className="w-4 h-4 text-emerald-400 fill-emerald-500/30" />
              </div>
            </div>
          </div>

          {/* Active Push Banner if received */}
          {devicePushAlert && (
            <div className="bg-amber-500 text-slate-950 px-3 py-2 text-xs font-bold flex items-center justify-between animate-bounce z-40 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>{devicePushAlert}</span>
              </div>
              <button onClick={() => setDevicePushAlert(null)} className="p-1 hover:bg-amber-600 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Screen Content: Either App Runner OR Kiosk Launcher Home */}
          {openAppId ? (
            /* APP RUNNER WINDOW */
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className="flex-1 overflow-hidden">{renderOpenedApp()}</div>
              {/* Bottom Gesture Bar to return to Kiosk Home */}
              <div className="bg-[#12141A] border-t border-slate-800 p-2 flex items-center justify-between px-4 z-20">
                <button
                  onClick={() => setOpenAppId(null)}
                  className="bg-[#1A1D23] hover:bg-slate-800 text-slate-200 px-3 py-1 rounded-lg text-xs flex items-center gap-1 font-semibold transition shadow-sm border border-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Início Kiosk
                </button>
                <div className="w-20 h-1 bg-slate-700 rounded-full mx-auto self-center"></div>
                <button
                  onClick={() => setShowAdminUnlockModal(true)}
                  className="text-slate-400 hover:text-blue-400 p-1"
                  title="Painel Admin"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* KIOSK LAUNCHER HOME SCREEN */
            <div className="flex-1 flex flex-col p-4 justify-between overflow-y-auto z-10 select-none">
              {/* Company Branding & Clock Header */}
              <div className="space-y-2.5 pt-1">
                <div className="bg-[#16191E] border border-slate-800 rounded-2xl p-3 text-center shadow-lg relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[10px] font-semibold mb-1.5">
                    <Shield className="w-3 h-3 text-blue-400" />
                    KioskGuard Enterprise Enforced
                  </div>

                  <h1 className="text-2xl font-extrabold font-mono tracking-tight text-white mb-0.5">
                    {currentTime}
                  </h1>
                  <p className="text-[11px] text-slate-400 capitalize">{currentDate}</p>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 truncate max-w-[170px]">
                      {companySettings.companyName}
                    </span>
                    <span className="text-emerald-400 font-mono">Conforme ✓</span>
                  </div>
                </div>

                {/* Connectivity & Policy Pills */}
                <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                  <div className="bg-[#16191E] border border-slate-800 rounded-lg px-2 py-1 flex items-center gap-1 text-blue-300">
                    <Bluetooth className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="truncate">BT: <strong className="text-blue-300">Livre</strong></span>
                  </div>
                  <div className="bg-[#16191E] border border-slate-800 rounded-lg px-2 py-1 flex items-center gap-1 text-emerald-300">
                    <Cable className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Cabo: <strong className="text-emerald-300">Livre</strong></span>
                  </div>
                  <div className="bg-[#16191E] border border-slate-800 rounded-lg px-2 py-1 flex items-center gap-1 text-red-300">
                    <WifiOff className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="truncate">Hotspot: <strong className="text-red-300">Off</strong></span>
                  </div>
                </div>
              </div>

              {/* Whitelisted App Grid */}
              <div className="my-auto py-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Apps Homologados ({apps.filter((a) => a.isEnabled).length}):
                  </p>
                  <span className="text-[9px] text-emerald-400 font-mono">MDM Restrito</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {apps
                    .filter((a) => a.isEnabled)
                    .map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setOpenAppId(app.id)}
                        className="flex flex-col items-center gap-1 group transition transform active:scale-95 text-center focus:outline-none"
                      >
                        <div
                          className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${app.color} p-2.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all border border-white/10`}
                        >
                          {renderAppIcon(app.icon)}
                          {app.badgeCount && app.badgeCount > 0 ? (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                              {app.badgeCount}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[10px] font-medium text-slate-200 group-hover:text-blue-400 line-clamp-1 leading-tight mt-0.5">
                          {app.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Bottom Quick Tools & Emergency SOS */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-200 rounded-xl p-2 text-xs flex items-center justify-center gap-1.5 font-semibold transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                    SOS / Suporte
                  </button>
                  <button
                    onClick={() => setShowAdminUnlockModal(true)}
                    className="bg-[#1A1D23] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-2 text-xs flex items-center justify-center gap-1.5 font-semibold transition"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    Acesso Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Test Drawer Below Phone */}
      <div className="w-full mt-4 bg-[#16191E] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-100">Simulador de Tentativas de Bloqueio & Testes:</span>
          </div>
          <span className="text-[10px] bg-[#12141A] px-2 py-0.5 rounded text-slate-400 border border-slate-800">Auditoria Ativa</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Clique nos botões abaixo para simular as tentativas de burlar o bloqueio corporativo e verificar a resposta do sistema em tempo real:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Roteamento de Internet (Hotspot) Bloqueado',
                'Tentativa de ativar o Roteador Wi-Fi / Tethering para compartilhar dados móveis do chip corporativo.',
                'blocked_hotspot',
                'Android Tethering Service',
                'high'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Tentar Rotear Internet (Hotspot)
          </button>
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Download Bloqueado - Requer Login da Gerência',
                'Tentativa de baixar novo aplicativo na Play Store sem credenciais autenticadas da gerência.',
                'blocked_install',
                'com.android.vending (PlayStore)',
                'high'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Baixar App sem Login Gerência
          </button>
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Instalação de APK Bloqueada',
                'Tentativa de download e instalação de aplicativo externo não autorizado (WhatsApp_GB.apk)',
                'blocked_install',
                'package:com.whatsapp.gb.mod',
                'high'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Instalar APK Não Aprovado
          </button>
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Rede Social / YouTube Bloqueado',
                'Tentativa de acesso a domínio de rede social externa (instagram.com)',
                'blocked_url',
                'https://instagram.com',
                'medium'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Acessar Rede Social Externa
          </button>
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Conexão USB / MTP Bloqueada',
                'Tentativa de extração de dados via cabo USB (Depuração ADB / MTP)',
                'blocked_usb',
                'USB Port: Hardware MTP',
                'high'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Plugar Cabo USB / MTP
          </button>
          <button
            onClick={() =>
              handleTriggerSecurityViolation(
                'Printscreen Bloqueado',
                'Tentativa de captura de tela em tela com dados confidenciais de clientes (FLAG_SECURE ativo)',
                'blocked_screenshot',
                'Window: FLAG_SECURE',
                'low'
              )
            }
            className="bg-[#12141A] hover:bg-red-950/80 text-red-300 border border-red-900/60 p-2.5 rounded-lg text-[11px] font-medium transition text-left"
          >
            🚫 Tirar Printscreen / Foto
          </button>
        </div>
      </div>

      {/* Security Violation Modal Alert */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#16191E] border-2 border-red-600 rounded-xl max-w-md w-full p-5 space-y-4 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mx-auto border border-red-500 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-red-300 tracking-wide uppercase">
                {showViolationModal.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {showViolationModal.desc}
              </p>
            </div>
            <div className="bg-[#0F1115] p-3 rounded-lg border border-red-900/80 text-[11px] text-left font-mono text-slate-300 space-y-1">
              <div><span className="text-red-400 font-bold">Ação do KioskGuard:</span> Execução cancelada imediatamente</div>
              <div><span className="text-red-400 font-bold">Norma Violada:</span> Política #POL-BR-CORP-2026</div>
              <div><span className="text-red-400 font-bold">Auditoria:</span> Log registrado no Painel de Conformidade do Administrador</div>
            </div>
            <button
              onClick={() => setShowViolationModal(null)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-lg"
            >
              Compreendi e Retornar ao Kiosk
            </button>
          </div>
        </div>
      )}

      {/* Admin Unlock Bypass PIN Modal */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#16191E] border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-blue-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-100">Desbloqueio Administrativo</h3>
              </div>
              <button onClick={() => setShowAdminUnlockModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Digite o PIN mestre do Administrador de TI para manutenção ou liberação do aparelho (PIN padrão de demonstração: <strong className="text-blue-400 font-mono">9988</strong>).
            </p>

            {adminPinSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-600 rounded-lg p-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                PIN Válido! Acessando Console do Administrador...
              </div>
            ) : (
              <form onSubmit={handleVerifyAdminPin} className="space-y-3">
                <div>
                  <input
                    type="password"
                    maxLength={8}
                    placeholder="Digite o PIN Mestre (ex: 9988)"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full bg-[#12141A] border border-slate-700 rounded-lg p-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  {adminPinError && (
                    <p className="text-[11px] text-red-400 mt-1.5 text-center font-semibold">
                      PIN incorreto! Incidente registrado na auditoria.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminUnlockModal(false)}
                    className="flex-1 bg-[#1A1D23] hover:bg-slate-800 text-slate-300 py-2 rounded-lg text-xs font-semibold border border-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold transition shadow"
                  >
                    Desbloquear
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#16191E] border border-red-800/80 rounded-xl max-w-sm w-full p-5 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center mx-auto border border-red-500">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Contatos de Emergência & Suporte</h3>
            <div className="bg-[#12141A] p-3 rounded-lg border border-slate-800 text-xs text-left space-y-2">
              <div>
                <p className="text-[10px] text-slate-500">Central de Suporte TI:</p>
                <p className="font-bold text-slate-200">{companySettings.supportPhone}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Plantão de Segurança Patrimonial:</p>
                <p className="font-bold text-red-400">{companySettings.emergencyContact}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">E-mail de Contato:</p>
                <p className="font-mono text-blue-400">{companySettings.supportEmail}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full bg-[#1A1D23] hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition border border-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
