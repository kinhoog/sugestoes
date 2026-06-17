import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

function createFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseApp = createFirebaseApp();
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firestoreDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

export function requireFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth não configurado. Verifique as variáveis VITE_FIREBASE_*.');
  }

  return firebaseAuth;
}

export function requireFirestore(): Firestore {
  if (!firestoreDb) {
    throw new Error('Cloud Firestore não configurado. Verifique as variáveis VITE_FIREBASE_*.');
  }

  return firestoreDb;
}

export function requireFirebaseStorage(): FirebaseStorage {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage não configurado. Verifique as variáveis VITE_FIREBASE_*.');
  }

  return firebaseStorage;
}
