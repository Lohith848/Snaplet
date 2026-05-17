import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const firebaseConfigFromEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = firebaseConfigFromEnv.apiKey && firebaseConfigFromEnv.projectId;
const finalConfig = isConfigured ? firebaseConfigFromEnv : firebaseConfig;
const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId;

const app = initializeApp(finalConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

// Set auth persistence to LOCAL so user stays signed in after browser refresh
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const googleProvider = new GoogleAuthProvider();

// Connection testing
async function testConnection() {
  try {
    // Only attempt if not already testing or specifically called
    await getDocFromServer(doc(db, '_internal_', 'connection-test'));
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

testConnection();

export { signInWithPopup, signOut, signInWithRedirect, getRedirectResult };
