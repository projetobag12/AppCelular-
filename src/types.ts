export interface SecurityPolicy {
  id: string;
  policyName: string;
  version: string;
  lastUpdated: string;
  // Hardware & Connectivity Controls
  blockUsbDataTransfer: boolean;
  blockDeveloperMode: boolean;
  blockCamera: boolean;
  blockMicrophoneExternal: boolean;
  blockBluetooth: boolean; // False = Bluetooth permitido conforme solicitado
  blockTetheringAndHotspot: boolean; // Bloqueia rotear internet do celular (Hotspot/Tethering)
  blockLocationGpsDisabled: boolean;
  blockFactoryReset: boolean;
  blockScreenshots: boolean;
  blockExternalWifiNetworks: boolean; // Only company-approved Wi-Fi SSIDs
  forceVpnAlwaysOn: boolean;
  // App & Store Controls
  blockAppInstallations: boolean; // Blocks APK sideloading & external package managers
  blockGooglePlayStore: boolean;
  blockAppUninstallation: boolean;
  kioskModeType: 'single_app' | 'multi_app_whitelisted';
  autoLaunchDefaultAppId?: string;
  // Time & Work Shift Restrictions
  enableWorkShiftLockout: boolean;
  shiftStartTime: string; // "08:00"
  shiftEndTime: string; // "18:00"
  blockWeekends: boolean;
  // Lock screen & Security Credentials
  requirePinToUnlock: boolean;
  pinMinLength: number;
  inactivityLockTimeoutSeconds: number; // e.g. 60s
  masterAdminBypassPin: string; // e.g. "9988"
  // Web Content Filter
  enableWebFilter: boolean;
  blockSocialMedia: boolean;
  blockStreamingAndVideo: boolean;
  blockAdultAndGambling: boolean;
  blockFileDownloads: boolean;
}

export interface WhitelistedApp {
  id: string;
  name: string;
  packageName: string;
  category: 'productivity' | 'communication' | 'sales' | 'support' | 'field' | 'settings' | 'utility';
  icon: string; // Lucide icon name or identifier
  color: string; // Tailwind color class or hex
  description: string;
  isEnabled: boolean;
  isMandatory: boolean;
  isSystemApp?: boolean;
  badgeCount?: number;
  version?: string;
  allowedUrls?: string[];
}

export interface LocationHistoryPoint {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  address: string;
}

export interface GpsCheckInRecord {
  id: string;
  deviceId: string;
  employeeName: string;
  timestamp: string;
  address: string;
  lat: number;
  lng: number;
  notes?: string;
  type: 'chegada' | 'saida' | 'abastecimento' | 'alerta_panico';
}

export interface CorporateDevice {
  id: string;
  assetTag: string;
  model: string;
  serialNumber: string;
  imei: string;
  assignedEmployee: string;
  employeeEmail: string;
  department: 'Vendas Externas' | 'Logística e Frota' | 'Operações & Campo' | 'Suporte Técnico' | 'Diretoria';
  batteryLevel: number;
  isCharging: boolean;
  isOnline: boolean;
  lastSync: string;
  policyVersion: string;
  complianceStatus: 'compliant' | 'warning' | 'violating' | 'locked';
  ipAddress: string;
  cellularSignal: 'strong' | 'medium' | 'weak' | 'offline';
  wifiSsid: string;
  isKioskActive: boolean;
  isRemotelyLocked: boolean;
  lockMessage?: string;
  storageUsedGb: number;
  storageTotalGb: number;
  // GPS Tracking Real-Time Telemetry
  latitude: number;
  longitude: number;
  currentAddress: string;
  speedKmH: number;
  heading: string;
  satelliteCount: number;
  gpsAccuracyMeters: number;
  geofenceStatus: 'inside' | 'warning' | 'outside';
  isMoving: boolean;
  locationHistory?: LocationHistoryPoint[];
}

export interface SecurityIncident {
  id: string;
  deviceId: string;
  deviceName: string;
  employeeName: string;
  timestamp: string;
  eventType:
    | 'blocked_url'
    | 'blocked_install'
    | 'blocked_usb'
    | 'blocked_settings'
    | 'blocked_screenshot'
    | 'tamper_attempt'
    | 'failed_pin'
    | 'shift_lockout_bypass'
    | 'unauthorized_wifi'
    | 'blocked_hotspot';
  details: string;
  targetResource?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface ManagerAuthCredentials {
  managerUser: string;
  managerPass: string;
  managerName: string;
  lastLogin?: string;
}

export interface WebFilterDomain {
  id: string;
  domain: string;
  category: 'intranet' | 'erp' | 'crm' | 'suporte' | 'bloqueado_geral';
  isAllowed: boolean;
  description: string;
}

export interface CompanySettings {
  companyName: string;
  department: string;
  supportPhone: string;
  supportEmail: string;
  emergencyContact: string;
  kioskWallpaper: 'modern_dark' | 'corporate_blue' | 'slate_minimal' | 'cyber_shield';
  customWelcomeMessage: string;
  allowedWifiSsid: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  channel: 'geral' | 'vendas' | 'suporte' | 'avisos';
  isSystem?: boolean;
}

export interface CrmCustomer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: 'Ativo' | 'Em Negociação' | 'Pendente';
  lastOrderValue: number;
}

export interface SupportTicket {
  id: string;
  title: string;
  category: 'Hardware' | 'Software Corporativo' | 'Rede / VPN' | 'Acesso';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em Andamento' | 'Resolvido';
  date: string;
  description: string;
}

export interface FieldInspectionReport {
  id: string;
  clientName: string;
  location: string;
  date: string;
  inspectorName: string;
  equipmentChecked: boolean;
  safetyCompliant: boolean;
  networkSignalTested: boolean;
  notes: string;
  signatureCollected: boolean;
  status: 'Rascunho' | 'Enviado' | 'Aprovado';
}
