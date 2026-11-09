import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

// Configuration priority: environment variables -> firebase-applet-config.json
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Connect to specified database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection established successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Permissions error on 'test/connection' is expected since default deny is active
    return true;
  }
}

testConnection();

// Sign in with Email and Password via Firebase Authentication
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

// Register a new teacher account with Email and Password via Firebase Authentication
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

// Sign in with Google (recommended for AI Studio iframe environment)
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase() {
  return signOut(auth);
}

export interface ParsedAuthError {
  message: string;
  isUnauthorizedDomain: boolean;
  domain: string;
  projectId: string;
  consoleSettingsUrl: string;
}

// Parse Firebase auth errors into human-friendly Portuguese instructions
export function parseFirebaseAuthError(error: any): ParsedAuthError {
  const code = error?.code || '';
  const rawMsg = error?.message || String(error);
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = firebaseConfig.projectId;
  const consoleSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const isUnauthorizedDomain = (
    code === 'auth/unauthorized-domain' ||
    rawMsg.includes('auth/unauthorized-domain')
  );

  let message = rawMsg;

  if (isUnauthorizedDomain) {
    message = `O domínio "${currentDomain}" ainda não está autorizado no Firebase Authentication.`;
  } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    message = 'Credenciais não encontradas no Firebase Authentication ou palavra-passe incorrecta.';
  } else if (code === 'auth/wrong-password') {
    message = 'Palavra-passe incorrecta no Firebase Authentication.';
  } else if (code === 'auth/email-already-in-use') {
    message = 'Este email já está registado no Firebase Authentication.';
  } else if (code === 'auth/weak-password') {
    message = 'A palavra-passe deve ter pelo menos 6 caracteres.';
  } else if (code === 'auth/popup-closed-by-user') {
    message = 'A janela do Google foi fechada antes de concluir o início de sessão.';
  } else if (code === 'auth/popup-blocked') {
    message = 'A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para este site.';
  } else if (code === 'auth/too-many-requests') {
    message = 'Demasiadas tentativas de autenticação falhadas. Por favor tente mais tarde.';
  } else if (code === 'auth/operation-not-allowed') {
    message = 'Este método de login (Email ou Google) ainda não foi activado na Consola do Firebase (Authentication > Sign-in method).';
  }

  return {
    message,
    isUnauthorizedDomain,
    domain: currentDomain,
    projectId,
    consoleSettingsUrl
  };
}
