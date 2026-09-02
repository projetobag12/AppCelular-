import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { EnrollmentQrModal } from './components/EnrollmentQrModal';
import { DeviceDetailsModal } from './components/DeviceDetailsModal';

// Views
import { DashboardView } from './views/DashboardView';
import { DevicesView } from './views/DevicesView';
import { EmployeesView } from './views/EmployeesView';
import { TeamsView } from './views/TeamsView';
import { ApplicationsView } from './views/ApplicationsView';
import { PoliciesView } from './views/PoliciesView';
import { AlertsView } from './views/AlertsView';
import { EventsView } from './views/EventsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

// Initial Data & Types
import {
  INITIAL_DEVICES,
  INITIAL_EMPLOYEES,
  INITIAL_TEAMS,
  INITIAL_APPLICATIONS,
  INITIAL_POLICIES,
  INITIAL_ALERTS,
  INITIAL_EVENTS,
  INITIAL_COMPANY_INFO
} from './data/initialData';

import {
  Device,
  Employee,
  Team,
  Application,
  Policy,
  Alert,
  AuditEvent,
  CompanyInfo
} from './types';

import { db, collection, onSnapshot, doc, setDoc, deleteDoc } from './lib/firebase';
import { firestoreService } from './lib/firestoreService';

function MainApp() {
  const { currentUser, role } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // State Collections
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY_INFO);

  // Modals
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedDeviceForDetails, setSelectedDeviceForDetails] = useState<Device | null>(null);

  // Firestore Sync Listeners (with graceful fallback to initial local state)
  useEffect(() => {
    try {
      // Sync Devices
      const unsubDevs = onSnapshot(
        collection(db, 'devices'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Device));
            setDevices(list);
          }
        },
        () => {}
      );

      // Sync Policies
      const unsubPols = onSnapshot(
        collection(db, 'policies'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Policy));
            setPolicies(list);
          }
        },
        () => {}
      );

      // Sync Applications
      const unsubApps = onSnapshot(
        collection(db, 'applications'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Application));
            setApplications(list);
          }
        },
        () => {}
      );

      // Sync Employees
      const unsubEmps = onSnapshot(
        collection(db, 'employees'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Employee));
            setEmployees(list);
          }
        },
        () => {}
      );

      // Sync Teams
      const unsubTeams = onSnapshot(
        collection(db, 'teams'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Team));
            setTeams(list);
          }
        },
        () => {}
      );

      // Sync Alerts
      const unsubAlerts = onSnapshot(
        collection(db, 'alerts'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Alert));
            setAlerts(list);
          }
        },
        () => {}
      );

      // Sync Events
      const unsubEvents = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as AuditEvent));
            setEvents(list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
          }
        },
        () => {}
      );

      return () => {
        unsubDevs();
        unsubPols();
        unsubApps();
        unsubEmps();
        unsubTeams();
        unsubAlerts();
        unsubEvents();
      };
    } catch {}
  }, []);

  // -------------------------------------------------------------
  // CRUD & ACTION HANDLERS
  // -------------------------------------------------------------

  // Save / Update Device
  const handleSaveDevice = async (device: Device) => {
    const isNew = !devices.some((d) => d.id === device.id);
    const updatedDevices = isNew
      ? [device, ...devices]
      : devices.map((d) => (d.id === device.id ? device : d));

    setDevices(updatedDevices);

    try {
      await setDoc(doc(db, 'devices', device.id), device);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isNew ? 'DEVICE_REGISTERED' : 'DEVICE_UPDATED',
      targetType: 'DEVICE',
      targetId: device.id,
      targetName: `${device.name} (${device.model})`,
      newValue: `Status: ${device.status}, Política: ${device.policyName || 'Nenhuma'}`
    });
  };

  // Delete Device
  const handleDeleteDevice = async (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));

    try {
      await deleteDoc(doc(db, 'devices', deviceId));
    } catch {}

    if (dev) {
      await firestoreService.logAuditEvent({
        userId: currentUser?.uid || 'user-admin',
        userName: currentUser?.name || 'Administrador',
        action: 'DEVICE_DELETED',
        targetType: 'DEVICE',
        targetId: deviceId,
        targetName: dev.name
      });
    }
  };

  // Apply Policy to Device
  const handleApplyPolicyToDevice = async (deviceId: string, policyId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const pol = policies.find((p) => p.id === policyId);
    if (!dev || !pol) return;

    const previousPolicy = dev.policyName;
    const updatedDevice: Device = {
      ...dev,
      policyId: pol.id,
      policyName: pol.name,
      lastSync: new Date().toISOString()
    };

    setDevices((prev) => prev.map((d) => (d.id === deviceId ? updatedDevice : d)));

    try {
      await setDoc(doc(db, 'devices', deviceId), updatedDevice);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: 'POLICY_APPLIED_DEVICE',
      targetType: 'DEVICE',
      targetId: dev.id,
      targetName: dev.name,
      previousValue: previousPolicy,
      newValue: pol.name
    });
  };

  // Lock / Unlock Device
  const handleToggleDeviceLock = async (device: Device, lockReason?: string) => {
    const isLocking = device.status !== 'BLOQUEADO';
    const updatedStatus = isLocking ? 'BLOQUEADO' : 'ATIVO';

    const updatedDevice: Device = {
      ...device,
      status: updatedStatus,
      lastSync: new Date().toISOString()
    };

    setDevices((prev) => prev.map((d) => (d.id === device.id ? updatedDevice : d)));

    try {
      await setDoc(doc(db, 'devices', device.id), updatedDevice);
    } catch {}

    // Gera alerta se foi bloqueado
    if (isLocking) {
      const newAlert: Alert = {
        id: `alt-${Date.now()}`,
        deviceId: device.id,
        deviceName: device.name,
        employeeId: device.employeeId,
        employeeName: device.employeeName,
        type: 'DEVICE_LOCKED',
        severity: 'ALTA',
        message: `Dispositivo bloqueado remotamente pelo Administrador`,
        details: lockReason || 'Bloqueio preventivo de smartphone corporativo Multivale.',
        suggestedAction: 'Verificar com o gestor da equipe antes de desbloquear.',
        resolved: false,
        createdAt: new Date().toISOString()
      };

      setAlerts((prev) => [newAlert, ...prev]);
      try {
        await setDoc(doc(db, 'alerts', newAlert.id), newAlert);
      } catch {}
    }

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isLocking ? 'DEVICE_LOCKED' : 'DEVICE_UNLOCKED',
      targetType: 'DEVICE',
      targetId: device.id,
      targetName: device.name,
      newValue: isLocking ? `Bloqueado. Motivo: ${lockReason || 'Preventivo'}` : 'Desbloqueado com sucesso'
    });
  };

  // Save Employee
  const handleSaveEmployee = async (emp: Employee) => {
    const isNew = !employees.some((e) => e.id === emp.id);
    const updated = isNew ? [emp, ...employees] : employees.map((e) => (e.id === emp.id ? emp : e));
    setEmployees(updated);

    try {
      await setDoc(doc(db, 'employees', emp.id), emp);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isNew ? 'EMPLOYEE_CREATED' : 'EMPLOYEE_UPDATED',
      targetType: 'EMPLOYEE',
      targetId: emp.id,
      targetName: emp.name,
      newValue: `Equipe: ${emp.teamName}, Cargo: ${emp.jobTitle}`
    });
  };

  // Delete Employee
  const handleDeleteEmployee = async (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    setEmployees((prev) => prev.filter((e) => e.id !== empId));

    try {
      await deleteDoc(doc(db, 'employees', empId));
    } catch {}

    if (emp) {
      await firestoreService.logAuditEvent({
        userId: currentUser?.uid || 'user-admin',
        userName: currentUser?.name || 'Administrador',
        action: 'EMPLOYEE_DELETED',
        targetType: 'EMPLOYEE',
        targetId: empId,
        targetName: emp.name
      });
    }
  };

  // Save Team
  const handleSaveTeam = async (team: Team) => {
    const isNew = !teams.some((t) => t.id === team.id);
    const updated = isNew ? [team, ...teams] : teams.map((t) => (t.id === team.id ? team : t));
    setTeams(updated);

    try {
      await setDoc(doc(db, 'teams', team.id), team);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isNew ? 'TEAM_CREATED' : 'TEAM_UPDATED',
      targetType: 'TEAM',
      targetId: team.id,
      targetName: team.name,
      newValue: `Região: ${team.region}`
    });
  };

  // Apply Policy to Team
  const handleApplyPolicyToTeam = async (teamId: string, policyId: string) => {
    const team = teams.find((t) => t.id === teamId);
    const policy = policies.find((p) => p.id === policyId);
    if (!team || !policy) return;

    const updatedTeam: Team = {
      ...team,
      defaultPolicyId: policy.id
    };

    setTeams((prev) => prev.map((t) => (t.id === teamId ? updatedTeam : t)));

    try {
      await setDoc(doc(db, 'teams', teamId), updatedTeam);
    } catch {}

    // Atualiza todos os aparelhos vinculados à equipe
    const teamDevices = devices.filter((d) => d.teamId === teamId);
    for (const dev of teamDevices) {
      const updatedDev: Device = {
        ...dev,
        policyId: policy.id,
        policyName: policy.name,
        lastSync: new Date().toISOString()
      };
      setDevices((prev) => prev.map((d) => (d.id === dev.id ? updatedDev : d)));
      try {
        await setDoc(doc(db, 'devices', dev.id), updatedDev);
      } catch {}
    }

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: 'POLICY_APPLIED_TEAM',
      targetType: 'TEAM',
      targetId: team.id,
      targetName: team.name,
      newValue: `Política Aplicada: ${policy.name} (${teamDevices.length} aparelhos sincronizados)`
    });
  };

  // Save Application
  const handleSaveApplication = async (app: Application) => {
    const isNew = !applications.some((a) => a.id === app.id);
    const updated = isNew ? [app, ...applications] : applications.map((a) => (a.id === app.id ? app : a));
    setApplications(updated);

    try {
      await setDoc(doc(db, 'applications', app.id), app);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isNew ? 'APP_CATALOG_CREATED' : 'APP_CATALOG_UPDATED',
      targetType: 'APPLICATION',
      targetId: app.id,
      targetName: `${app.name} (${app.packageName})`,
      newValue: `Status: ${app.status}, Categoria: ${app.category}`
    });
  };

  // Delete Application
  const handleDeleteApplication = async (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));

    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch {}

    if (app) {
      await firestoreService.logAuditEvent({
        userId: currentUser?.uid || 'user-admin',
        userName: currentUser?.name || 'Administrador',
        action: 'APP_CATALOG_DELETED',
        targetType: 'APPLICATION',
        targetId: appId,
        targetName: `${app.name} (${app.packageName})`
      });
    }
  };

  // Toggle App Status (Autorizado / Bloqueado)
  const handleToggleAppStatus = async (app: Application) => {
    const newStatus = app.status === 'AUTORIZADO' ? 'BLOQUEADO' : 'AUTORIZADO';
    const updatedApp: Application = {
      ...app,
      status: newStatus,
      riskLevel: newStatus === 'AUTORIZADO' ? 'BAIXO' : 'ALTO'
    };

    setApplications((prev) => prev.map((a) => (a.id === app.id ? updatedApp : a)));

    try {
      await setDoc(doc(db, 'applications', app.id), updatedApp);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: newStatus === 'AUTORIZADO' ? 'APP_AUTHORIZED' : 'APP_BLOCKED',
      targetType: 'APPLICATION',
      targetId: app.id,
      targetName: app.name,
      previousValue: app.status,
      newValue: newStatus
    });
  };

  // Save Policy
  const handleSavePolicy = async (policy: Policy) => {
    const isNew = !policies.some((p) => p.id === policy.id);
    const updated = isNew ? [policy, ...policies] : policies.map((p) => (p.id === policy.id ? policy : p));
    setPolicies(updated);

    try {
      await setDoc(doc(db, 'policies', policy.id), policy);
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: isNew ? 'POLICY_CREATED' : 'POLICY_UPDATED',
      targetType: 'POLICY',
      targetId: policy.id,
      targetName: policy.name,
      newValue: `Modelo: ${policy.securityModel}, Apps Permitidos: ${policy.allowedAppPackageNames.length}`
    });
  };

  // Delete Policy
  const handleDeletePolicy = async (policyId: string) => {
    const pol = policies.find((p) => p.id === policyId);
    setPolicies((prev) => prev.filter((p) => p.id !== policyId));

    try {
      await deleteDoc(doc(db, 'policies', policyId));
    } catch {}

    if (pol) {
      await firestoreService.logAuditEvent({
        userId: currentUser?.uid || 'user-admin',
        userName: currentUser?.name || 'Administrador',
        action: 'POLICY_DELETED',
        targetType: 'POLICY',
        targetId: policyId,
        targetName: pol.name
      });
    }
  };

  // Duplicate Policy
  const handleDuplicatePolicy = async (pol: Policy) => {
    const duplicated: Policy = {
      ...pol,
      id: `pol-${Date.now()}`,
      name: `${pol.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await handleSavePolicy(duplicated);
  };

  // Resolve Alert
  const handleResolveAlert = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;

    const updated: Alert = {
      ...alert,
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser?.name || 'Administrador de TI'
    };

    setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));

    try {
      await setDoc(doc(db, 'alerts', alertId), updated, { merge: true });
    } catch {}

    await firestoreService.logAuditEvent({
      userId: currentUser?.uid || 'user-admin',
      userName: currentUser?.name || 'Administrador',
      action: 'ALERT_RESOLVED',
      targetType: 'ALERT',
      targetId: alertId,
      targetName: alert.message
    });
  };

  // Save Company Info
  const handleSaveCompanyInfo = async (info: CompanyInfo) => {
    setCompanyInfo(info);
    try {
      await setDoc(doc(db, 'systemSettings', 'company'), info, { merge: true });
    } catch {}
  };

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-[#0E1015] text-slate-200 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unresolvedAlertsCount={unresolvedCount}
        onOpenEnrollment={() => setIsEnrollmentModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header
          companyInfo={companyInfo}
          onOpenEnrollmentModal={() => setIsEnrollmentModalOpen(true)}
          onNavigateToDevices={() => setCurrentTab('devices')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              devices={devices}
              employees={employees}
              teams={teams}
              applications={applications}
              policies={policies}
              alerts={alerts}
              events={events}
              onNavigate={setCurrentTab}
              onSelectDevice={(device) => setSelectedDeviceForDetails(device)}
              onOpenEnrollmentModal={() => setIsEnrollmentModalOpen(true)}
            />
          )}

          {currentTab === 'devices' && (
            <DevicesView
              devices={devices}
              employees={employees}
              teams={teams}
              policies={policies}
              applications={applications}
              onSaveDevice={handleSaveDevice}
              onDeleteDevice={handleDeleteDevice}
              onApplyPolicyToDevice={handleApplyPolicyToDevice}
              onToggleDeviceLock={handleToggleDeviceLock}
              onOpenEnrollmentModal={() => setIsEnrollmentModalOpen(true)}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              teams={teams}
              devices={devices}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onSelectDevice={(device) => setSelectedDeviceForDetails(device)}
            />
          )}

          {currentTab === 'teams' && (
            <TeamsView
              teams={teams}
              devices={devices}
              employees={employees}
              policies={policies}
              onSaveTeam={handleSaveTeam}
              onApplyPolicyToTeam={handleApplyPolicyToTeam}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsView
              applications={applications}
              onSaveApplication={handleSaveApplication}
              onDeleteApplication={handleDeleteApplication}
              onToggleStatus={handleToggleAppStatus}
            />
          )}

          {currentTab === 'policies' && (
            <PoliciesView
              policies={policies}
              applications={applications}
              devices={devices}
              teams={teams}
              onSavePolicy={handleSavePolicy}
              onDeletePolicy={handleDeletePolicy}
              onDuplicatePolicy={handleDuplicatePolicy}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              devices={devices}
              onResolveAlert={handleResolveAlert}
              onSelectDevice={(device) => setSelectedDeviceForDetails(device)}
            />
          )}

          {currentTab === 'events' && <EventsView events={events} />}

          {currentTab === 'reports' && (
            <ReportsView
              devices={devices}
              employees={employees}
              teams={teams}
              applications={applications}
              policies={policies}
              alerts={alerts}
              events={events}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              companyInfo={companyInfo}
              onSaveCompanyInfo={handleSaveCompanyInfo}
              onOpenEnrollmentModal={() => setIsEnrollmentModalOpen(true)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="bg-[#11141A] border-t border-slate-800/80 py-3.5 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              © 2026 <strong>MULTIVALE MOBILE CONTROL</strong> — Administração e Gestão de Dispositivos Corporativos.
            </span>
            <span className="font-mono text-[11px] text-blue-400">
              Arquitetura Android Enterprise • Google Cloud Firestore
            </span>
          </div>
        </footer>
      </div>

      {/* Modal de Provisionamento Oficial Android Enterprise */}
      <EnrollmentQrModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        companyInfo={companyInfo}
      />

      {/* Modal Global de Detalhes do Dispositivo */}
      {selectedDeviceForDetails && (
        <DeviceDetailsModal
          isOpen={!!selectedDeviceForDetails}
          onClose={() => setSelectedDeviceForDetails(null)}
          device={selectedDeviceForDetails}
          policies={policies}
          employees={employees}
          teams={teams}
          applications={applications}
          onApplyPolicy={async (devId, polId) => {
            await handleApplyPolicyToDevice(devId, polId);
            const updated = devices.find((d) => d.id === devId);
            if (updated) setSelectedDeviceForDetails({ ...updated, policyId: polId });
          }}
          onLockDevice={async (devId, reason) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              await handleToggleDeviceLock(dev, reason);
              setSelectedDeviceForDetails({ ...dev, status: 'BLOQUEADO' });
            }
          }}
          onUnlockDevice={async (devId) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              await handleToggleDeviceLock(dev);
              setSelectedDeviceForDetails({ ...dev, status: 'ATIVO' });
            }
          }}
          onSyncDevice={async (devId) => {
            const dev = devices.find((d) => d.id === devId);
            if (dev) {
              const updated = { ...dev, lastSync: new Date().toISOString() };
              await handleSaveDevice(updated);
              setSelectedDeviceForDetails(updated);
            }
          }}
          onOpenEnrollment={() => {
            setSelectedDeviceForDetails(null);
            setIsEnrollmentModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
