import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

// Safely resolve configuration values, falling back to verified firebase-applet-config.json
// whenever an environment variable is undefined or set to a placeholder variable name.
function resolveConfig(envVal: string | undefined, defaultVal: string, varName: string): string {
  if (typeof envVal === 'string') {
    const trimmed = envVal.trim();
    if (
      trimmed.length > 0 &&
      trimmed !== varName &&
      !trimmed.startsWith('VITE_FIREBASE_') &&
      !trimmed.startsWith('YOUR_') &&
      !trimmed.startsWith('<') &&
      !trimmed.startsWith('PLACEHOLDER')
    ) {
      return trimmed;
    }
  }
  return defaultVal;
}

const config = {
  apiKey: resolveConfig(import.meta.env.VITE_FIREBASE_API_KEY, defaultFirebaseConfig.apiKey, 'VITE_FIREBASE_API_KEY'),
  authDomain: resolveConfig(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, defaultFirebaseConfig.authDomain, 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: resolveConfig(import.meta.env.VITE_FIREBASE_PROJECT_ID, defaultFirebaseConfig.projectId, 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: resolveConfig(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, defaultFirebaseConfig.storageBucket, 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: resolveConfig(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, defaultFirebaseConfig.messagingSenderId, 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: resolveConfig(import.meta.env.VITE_FIREBASE_APP_ID, defaultFirebaseConfig.appId, 'VITE_FIREBASE_APP_ID'),
  firestoreDatabaseId: resolveConfig(import.meta.env.VITE_FIREBASE_DATABASE_ID, defaultFirebaseConfig.firestoreDatabaseId, 'VITE_FIREBASE_DATABASE_ID')
};

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_collection_', '_connection_test_document_'));
    console.log('[Firestore] Connection test successfully initiated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error('[Firestore] Offline connection test detected:', error.message);
    } else {
      console.log('[Firestore] Connection verification completed: Handled database response');
    }
  }
}
testConnection();
