import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
