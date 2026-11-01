import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuildProcessOnly12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tuanputri-cde07.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tuanputri-cde07",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tuanputri-cde07.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase SDK menolak jalan di luar browser (build static export).
const auth = typeof window !== "undefined" ? getAuth(app) : null;
const db = typeof window !== "undefined" ? getFirestore(app) : null;

export const googleProvider = new GoogleAuthProvider();
export const LEVEL_COUNT = 5;
export const HEARTS_PER_CORRECT_ANSWER = 50;

export const DEFAULT_PROGRESS = { currentLevel: 1, heartsTotal: 0 };

export async function ensureUserDoc(user) {
  if (!db || !user) return null;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return { uid: user.uid, ...snap.data() };

  const fresh = {
    uid: user.uid,
    displayName: user.displayName || "Tuan Putri Ratih",
    email: user.email || null,
    photoURL: user.photoURL || null,
    currentLevel: DEFAULT_PROGRESS.currentLevel,
    heartsTotal: DEFAULT_PROGRESS.heartsTotal,
    completedLevels: [],
    labProgress: {},
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, fresh);
  return fresh;
}

/**
 * Menulis progres level + total hati. `currentLevel` tidak pernah turun,
 * supaya refresh atau device lain tidak menghapus pencapaian.
 */
export async function saveProgress(userId, currentLevel, heartsTotal) {
  if (!db || !userId) return null;
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : DEFAULT_PROGRESS;

  const payload = {
    currentLevel: Math.min(Math.max(Number(currentLevel) || 1, existing.currentLevel || 1), LEVEL_COUNT + 1),
    heartsTotal: Math.max(Number(heartsTotal) || 0, existing.heartsTotal || 0),
    lastUpdated: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function getProgress(userId) {
  if (!db || !userId) return DEFAULT_PROGRESS;
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? snap.data() : DEFAULT_PROGRESS;
}

/**
 * Mengambil peta progres lab milik user: { [topicId]: missionId[] }.
 * Disimpan di dokumen user supaya ikut akun, bukan cuma browser.
 */
export async function getLabProgress(userId) {
  if (!db || !userId) return {};
  const snap = await getDoc(doc(db, "users", userId));
  const raw = snap.exists() ? snap.data().labProgress : null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

/**
 * Menambahkan misi yang baru selesai dengan arrayUnion, jadi dua perangkat
 * yang menyelesaikan misi berbeda tidak saling menimpa.
 */
export async function addLabProgress(userId, topicId, missionIds) {
  if (!db || !userId || !topicId) return [];
  const ids = [...new Set((missionIds || []).filter((id) => typeof id === "string" && id))];
  if (!ids.length) return [];

  const ref = doc(db, "users", userId);
  const payload = {
    [`labProgress.${topicId}`]: arrayUnion(...ids),
    labUpdatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    // Dokumen user belum ada (misalnya sesi lama): buat field-nya tanpa
    // menghapus data profil yang lain.
    if (error?.code !== "not-found") throw error;
    await setDoc(
      ref,
      {
        labProgress: { [topicId]: ids },
        labUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return ids;
}

export const loginWithGoogle = () => {
  if (!auth) throw new Error("Firebase auth tidak tersedia di environment ini.");
  return signInWithPopup(auth, googleProvider);
};

export const loginWithEmail = (email, password) => {
  if (!auth) throw new Error("Firebase auth tidak tersedia di environment ini.");
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const registerWithEmail = (email, password) => {
  if (!auth) throw new Error("Firebase auth tidak tersedia di environment ini.");
  return createUserWithEmailAndPassword(auth, email.trim(), password);
};

export const logout = () => (auth ? fbSignOut(auth) : Promise.resolve());


export { app, auth, db, onAuthStateChanged, updateProfile };
export default app;
