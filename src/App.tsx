import React, { useState, useEffect } from 'react';
import {
  INITIAL_SECURITY_POLICY,
  INITIAL_WHITELISTED_APPS,
  INITIAL_DEVICES,
  INITIAL_INCIDENTS,
  INITIAL_WEB_FILTER_DOMAINS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CRM_CUSTOMERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_FIELD_REPORTS,
} from './data/defaultConfig';
import {
  SecurityPolicy,
  WhitelistedApp,
  CorporateDevice,
  SecurityIncident,
  WebFilterDomain,
  CompanySettings,
  ChatMessage,
  CrmCustomer,
  SupportTicket,
  FieldInspectionReport,
} from './types';
import { Header } from './components/Header';
import { PhoneSimulator } from './components/PhoneSimulator';
import { AdminConsole } from './components/AdminConsole';
import { DownloadAndHostingModal } from './components/DownloadAndHostingModal';
import { db, doc, setDoc, onSnapshot } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<'kiosk' | 'admin' | 'split'>('split');
  const [policy, setPolicy] = useState<SecurityPolicy>(INITIAL_SECURITY_POLICY);
  const [apps, setApps] = useState<WhitelistedApp[]>(INITIAL_WHITELISTED_APPS);
  const [devices, setDevices] = useState<CorporateDevice[]>(INITIAL_DEVICES);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [whitelistedDomains, setWhitelistedDomains] = useState<WebFilterDomain[]>(INITIAL_WEB_FILTER_DOMAINS);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Corporate Apps State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [crmCustomers, setCrmCustomers] = useState<CrmCustomer[]>(INITIAL_CRM_CUSTOMERS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [fieldReports, setFieldReports] = useState<FieldInspectionReport[]>(INITIAL_FIELD_REPORTS);

  // Sync with Firebase Firestore on mount
  useEffect(() => {
    try {
      const policyDocRef = doc(db, 'policies', 'current');
      const unsubscribe = onSnapshot(
        policyDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<SecurityPolicy>;
            setPolicy((prev) => ({ ...prev, ...data }));
          } else {
            // Seed initial policy to firestore
            setDoc(policyDocRef, INITIAL_SECURITY_POLICY, { merge: true }).catch(() => {});
          }
        },
        (err) => {
          console.log('Firebase policy listener info:', err.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.log('Firebase sync local fallback active:', e);
    }
  }, []);

  // Active Device for the Phone Simulator
  const activeDevice = devices[0];

  // Handler to Record Security Incident
  const handleRecordIncident = (
    eventType: any,
    details: string,
    targetResource?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ) => {
    const newInc: SecurityIncident = {
      id: `inc-${Date.now()}`,
      deviceId: activeDevice.id,
      deviceName: `${activeDevice.model} (${activeDevice.assetTag})`,
      employeeName: activeDevice.assignedEmployee,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventType,
      details,
      targetResource,
      severity,
      resolved: false,
    };
    setIncidents((prev) => [newInc, ...prev]);
  };

  // Chat message send
  const handleSendMessage = (text: string, channel: 'geral' | 'vendas' | 'suporte' | 'avisos') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: activeDevice.assignedEmployee,
      senderRole: 'Representante Comercial',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text,
      channel,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Policy updates from Admin
  const handleUpdatePolicy = (newPolicy: SecurityPolicy) => {
    setPolicy(newPolicy);
    // Update fleet devices to match new policy version
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        policyVersion: newPolicy.version,
        lastSync: 'Agora mesmo',
      }))
    );
    // Persist to Firestore
    try {
      setDoc(doc(db, 'policies', 'current'), newPolicy, { merge: true }).catch(() => {});
    } catch (e) {}
  };

  // App toggle
  const handleToggleApp = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  // Add App
  const handleAddApp = (newApp: WhitelistedApp) => {
    setApps((prev) => [...prev, newApp]);
  };

  // Remove App
  const handleRemoveApp = (appId: string) => {
    setApps((prev) => prev.filter((a) => a.id !== appId));
  };

  // Domain whitelist actions
  const handleAddDomain = (domain: string, description: string, isAllowed: boolean) => {
    const newDom: WebFilterDomain = {
      id: `dom-${Date.now()}`,
      domain,
      description,
      isAllowed,
      category: isAllowed ? 'intranet' : 'bloqueado_geral',
    };
    setWhitelistedDomains((prev) => [newDom, ...prev]);
  };

  const handleRemoveDomain = (id: string) => {
    setWhitelistedDomains((prev) => prev.filter((d) => d.id !== id));
  };

  // Remote Device Controls
  const handleRemoteLockDevice = (deviceId: string, message?: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              isRemotelyLocked: true,
              lockMessage: message || 'Dispositivo bloqueado remotamente pelo Administrador de TI.',
              complianceStatus: 'locked',
            }
          : d
      )
    );
    handleRecordIncident(
      'tamper_attempt',
      `Bloqueio remoto disparado pelo Administrador no dispositivo ${deviceId}`,
      'Remote Command Lock',
      'medium'
    );
  };

  const handleRemoteUnlockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, isRemotelyLocked: false, lockMessage: undefined, complianceStatus: 'compliant' }
          : d
      )
    );
  };

  const handleSendPushAlert = (deviceId: string, message: string) => {
    handleRecordIncident(
      'tamper_attempt',
      `Push enviado para tela do celular: "${message}"`,
      'Notification Channel',
      'low'
    );
  };

  const handleRemoteWipeDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              complianceStatus: 'locked',
              isRemotelyLocked: true,
              lockMessage: 'Dispositivo em processo de Wipe e Redefinição Corporativa Segura.',
            }
          : d
      )
    );
    handleRecordIncident(
      'tamper_attempt',
      `Comando de Limpeza Remota (Remote Wipe) executado com sucesso no dispositivo ${deviceId}`,
      'Factory Reset DPC',
      'critical'
    );
  };

  const handleSyncPolicyDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, lastSync: 'Agora mesmo', policyVersion: policy.version } : d
      )
    );
  };

  const handleResolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, resolved: true } : i))
    );
  };

  const unresolvedCount = incidents.filter((i) => !i.resolved).length;

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-200 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onChangeView={setCurrentView}
        companySettings={companySettings}
        activeDevice={activeDevice}
        policy={policy}
        unresolvedIncidentsCount={unresolvedCount}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Main Responsive Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        {currentView === 'kiosk' && (
          <div className="flex justify-center items-center py-2 animate-in fade-in duration-300">
            <PhoneSimulator
              policy={policy}
              apps={apps}
              activeDevice={activeDevice}
              companySettings={companySettings}
              whitelistedDomains={whitelistedDomains}
              chatMessages={chatMessages}
              crmCustomers={crmCustomers}
              supportTickets={supportTickets}
              fieldReports={fieldReports}
              onSendMessage={handleSendMessage}
              onRecordIncident={handleRecordIncident}
              onEmergencyUnlock={() => setCurrentView('admin')}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="w-full h-full animate-in fade-in duration-300">
            <AdminConsole
              policy={policy}
              apps={apps}
              devices={devices}
              incidents={incidents}
              whitelistedDomains={whitelistedDomains}
              companySettings={companySettings}
              onUpdatePolicy={handleUpdatePolicy}
              onToggleApp={handleToggleApp}
              onAddApp={handleAddApp}
              onRemoveApp={handleRemoveApp}
              onAddDomain={handleAddDomain}
              onRemoveDomain={handleRemoveDomain}
              onRemoteLockDevice={handleRemoteLockDevice}
              onRemoteUnlockDevice={handleRemoteUnlockDevice}
              onSendPushAlert={handleSendPushAlert}
              onRemoteWipeDevice={handleRemoteWipeDevice}
              onSyncPolicyDevice={handleSyncPolicyDevice}
              onResolveIncident={handleResolveIncident}
              onUpdateCompanySettings={setCompanySettings}
            />
          </div>
        )}

        {currentView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            {/* Left: Phone Simulator (Kiosk) */}
            <div className="lg:col-span-5 flex justify-center sticky top-20">
              <PhoneSimulator
                policy={policy}
                apps={apps}
                activeDevice={activeDevice}
                companySettings={companySettings}
                whitelistedDomains={whitelistedDomains}
                chatMessages={chatMessages}
                crmCustomers={crmCustomers}
                supportTickets={supportTickets}
                fieldReports={fieldReports}
                onSendMessage={handleSendMessage}
                onRecordIncident={handleRecordIncident}
                onEmergencyUnlock={() => setCurrentView('admin')}
              />
            </div>

            {/* Right: Admin MDM Management Console */}
            <div className="lg:col-span-7">
              <AdminConsole
                policy={policy}
                apps={apps}
                devices={devices}
                incidents={incidents}
                whitelistedDomains={whitelistedDomains}
                companySettings={companySettings}
                onUpdatePolicy={handleUpdatePolicy}
                onToggleApp={handleToggleApp}
                onAddApp={handleAddApp}
                onRemoveApp={handleRemoveApp}
                onAddDomain={handleAddDomain}
                onRemoveDomain={handleRemoveDomain}
                onRemoteLockDevice={handleRemoteLockDevice}
                onRemoteUnlockDevice={handleRemoteUnlockDevice}
                onSendPushAlert={handleSendPushAlert}
                onRemoteWipeDevice={handleRemoteWipeDevice}
                onSyncPolicyDevice={handleSyncPolicyDevice}
                onResolveIncident={handleResolveIncident}
                onUpdateCompanySettings={setCompanySettings}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#12141A] border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>SECURE<span className="text-blue-500">MDM</span> Enterprise</strong> — Sistema de Bloqueio e Conformidade Corporativa.
          </span>
          <span className="font-mono text-[11px] text-blue-400">
            Android Enterprise Device Owner • LGPD & ISO 27001 Compliant
          </span>
        </div>
      </footer>

      {/* Download & Free Cloud Hosting Center Modal */}
      <DownloadAndHostingModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
