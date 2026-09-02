// MULTIVALE MOBILE CONTROL - Modelos de Dados e Tipos TypeScript

export type UserRole = 'ADMINISTRADOR' | 'GESTOR' | 'VISUALIZACAO' | 'admin' | 'employee';

export interface User {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'ATIVO' | 'INATIVO';
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Employee {
  id: string;
  name: string;
  registrationNumber: string; // Matrícula ou ID interno
  teamId: string;
  teamName: string;
  associatedDeviceIds: string[];
  status: 'ATIVO' | 'INATIVO';
  email: string;
  phone: string;
  jobTitle: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string; // Ex: Curitiba, Cascavel, Londrina, Maringá, Ponta Grossa, Rede Externa
  region: string;
  description: string;
  defaultPolicyId?: string;
  memberCount: number;
  deviceCount: number;
  createdAt: string;
}

export type DeviceStatus = 'ATIVO' | 'OFFLINE' | 'BLOQUEADO' | 'PENDENTE' | 'ERRO';
export type ManagementMode = 'DEVICE_OWNER' | 'PROFILE_OWNER' | 'UNMANAGED';

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  androidVersion: string;
  imei: string;
  serialNumber: string;
  phoneNumber?: string;
  operator?: string; // Ex: Vivo Empresas, Claro Corporativo, TIM
  employeeId?: string;
  employeeName?: string;
  teamId?: string;
  teamName?: string;
  policyId?: string;
  policyName?: string;
  status: DeviceStatus;
  managementMode: ManagementMode;
  batteryLevel: number;
  isCharging?: boolean;
  storageUsedGb: number;
  storageTotalGb: number;
  lastSync: string;
  createdAt: string;
  isRemotelyLocked?: boolean;
  lockReason?: string;
  ipAddress?: string;
  wifiSsid?: string;
  installedAppsCount?: number;
  securityPatchDate?: string;
}

export type AppCategory = 
  | 'Comunicação'
  | 'Produtividade'
  | 'Navegação e Mapas'
  | 'Operações e Campo'
  | 'Vendas e CRM'
  | 'Utilidades'
  | 'Redes Sociais'
  | 'Streaming e Vídeo'
  | 'Jogos e Lazer';

export type AppStatus = 'AUTORIZADO' | 'BLOQUEADO';

export interface Application {
  id: string;
  name: string;
  packageName: string; // Ex: com.google.android.apps.maps, com.whatsapp
  category: AppCategory;
  description: string;
  status: AppStatus;
  icon?: string;
  isSystemApp?: boolean;
  minAndroidVersion?: string;
  riskLevel?: 'BAIXO' | 'MEDIO' | 'ALTO';
  createdAt: string;
}

export type SecurityModel = 'ALLOWLIST' | 'DENYLIST';

export interface Policy {
  id: string;
  name: string;
  description: string;
  securityModel: SecurityModel; // Preferencialmente ALLOWLIST
  allowedAppPackageNames: string[];
  blockedAppPackageNames: string[];
  associatedDeviceIds: string[];
  associatedTeamIds: string[];
  blockPlayStore: boolean;
  blockUsbData: boolean;
  blockHotspot: boolean;
  blockFactoryReset: boolean;
  blockDeveloperMode: boolean;
  blockCamera?: boolean;
  blockScreenshots?: boolean;
  enforceKioskMode?: boolean;
  autoLaunchAppPackage?: string;
  status: 'ATIVO' | 'INATIVO';
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAssignment {
  id: string;
  policyId: string;
  policyName: string;
  targetType: 'DEVICE' | 'TEAM';
  targetId: string;
  targetName: string;
  assignedBy: string;
  assignedAt: string;
  syncStatus: 'APLICADO' | 'PENDENTE' | 'ERRO';
}

export type AlertType = 
  | 'NO_SYNC'
  | 'POLICY_FAILURE'
  | 'UNAUTHORIZED_APP'
  | 'PENDING_POLICY'
  | 'UNMANAGED_DEVICE'
  | 'DEVICE_LOCKED'
  | 'COMMUNICATION_ERROR';

export type AlertSeverity = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Alert {
  id: string;
  deviceId?: string;
  deviceName?: string;
  employeeId?: string;
  employeeName?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  suggestedAction?: string;
}

export type AuditAction = 
  | 'POLICY_CREATED'
  | 'POLICY_UPDATED'
  | 'POLICY_DELETED'
  | 'POLICY_DUPLICATED'
  | 'POLICY_ASSIGNED'
  | 'POLICY_REMOVED'
  | 'POLICY_APPLIED_DEVICE'
  | 'POLICY_APPLIED_TEAM'
  | 'APPLICATION_ALLOWED'
  | 'APPLICATION_BLOCKED'
  | 'APPLICATION_CREATED'
  | 'APPLICATION_DELETED'
  | 'APP_CATALOG_CREATED'
  | 'APP_CATALOG_UPDATED'
  | 'APP_CATALOG_DELETED'
  | 'APP_AUTHORIZED'
  | 'APP_BLOCKED'
  | 'DEVICE_REGISTERED'
  | 'DEVICE_UPDATED'
  | 'DEVICE_DELETED'
  | 'DEVICE_DISABLED'
  | 'DEVICE_ACTIVATED'
  | 'DEVICE_LOCKED'
  | 'DEVICE_UNLOCKED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_DELETED'
  | 'TEAM_CREATED'
  | 'TEAM_UPDATED'
  | 'ALERT_RESOLVED'
  | 'VIOLATION_BLOCKED';

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export enum AndroidFeatureSupport {
  AVAILABLE = 'AVAILABLE',
  SUPPORTED = 'SUPPORTED',
  BLOCKED = 'BLOCKED',
  ALLOWED = 'ALLOWED',
  REQUIRES_DEVICE_OWNER = 'REQUIRES_DEVICE_OWNER',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  domain: string;
  supportPhone: string;
  supportEmail: string;
  dpcPackageName: string;
  dpcEnrollmentToken: string;
}

// -------------------------------------------------------------
// Tipos de Compatibilidade Legada
// -------------------------------------------------------------
export type SecurityPolicy = any;
export type WhitelistedApp = any;
export type CorporateDevice = any;
export type SecurityIncident = any;
export type WebFilterDomain = any;
export type CompanySettings = any;
export type ChatMessage = any;
export type CrmCustomer = any;
export type SupportTicket = any;
export type FieldInspectionReport = any;
export type ManagerAuthCredentials = any;
export type EmployeeProfile = any;
