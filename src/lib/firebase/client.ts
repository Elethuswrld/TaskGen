import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Explicitly set persistence to local. This is the default for web, but
// ensures the user's session is stored in localStorage and persists
// across browser sessions.
setPersistence(auth, browserLocalPersistence);

export { app, auth, db };
