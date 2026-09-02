import {
  db,
  auth,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from './firebase';
import {
  Device,
  Employee,
  Team,
  Application,
  Policy,
  Alert,
  AuditEvent,
  User,
  AuditAction
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error Logged:', JSON.stringify(errInfo));
}

// ----------------------------------------------------------------------
// Sistema de Auditoria Automática
// ----------------------------------------------------------------------
export async function logAuditEvent(params: {
  userId?: string;
  userName?: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName: string;
  previousValue?: string;
  newValue?: string;
}): Promise<void> {
  const event: AuditEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId || auth.currentUser?.uid || 'usr-admin',
    userName: params.userName || auth.currentUser?.displayName || auth.currentUser?.email || 'Administrador TI Multivale',
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    targetName: params.targetName,
    previousValue: params.previousValue || '-',
    newValue: params.newValue || '-',
    timestamp: new Date().toISOString()
  };

  try {
    const path = 'events';
    await setDoc(doc(db, path, event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `events/${event.id}`);
  }
}

export const firestoreService = {
  logAuditEvent
};
