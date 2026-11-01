"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  ensureUserDoc,
  getProgress,
  loginWithGoogle as doLoginWithGoogle,
  loginWithEmail as doLoginWithEmail,
  registerWithEmail as doRegisterWithEmail,
  updateProfile,
  logout as doLogout,
  onAuthStateChanged,
  saveProgress as persistProgress,
} from "@/lib/firebaseConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Menyimpan uid + displayName + currentLevel + heartsTotal ke Firestore.
        const data = await ensureUserDoc(firebaseUser);
        setProfile(data);
      } catch (err) {
        // Firestore bisa ditolak rules; sesi tetap valid, progres hanya tidak tersimpan.
        console.error("Gagal menyiapkan dokumen user:", err);
        setProfile(await getProgress(firebaseUser.uid).catch(() => null));
        setError("Progres gagal dimuat dari Firestore. Cek rules database-nya.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const cred = await doLoginWithGoogle();
      await ensureUserDoc(cred.user);
      return cred;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const loginEmail = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const cred = await doLoginWithEmail(email, password);
      await ensureUserDoc(cred.user);
      return cred;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const registerEmail = useCallback(async (email, password, displayName) => {
    setLoading(true);
    try {
      const cred = await doRegisterWithEmail(email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      await ensureUserDoc(cred.user);
      return cred;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setProfile(null);
    setUser(null);
    await doLogout();
  }, []);

  /** Dipakai halaman kuis setelah semua soal terjawab benar. */
  const completeLevel = useCallback(
    async (levelId, heartsEarned) => {
      if (!user) return null;
      const nextLevel = Math.min(levelId + 1, 6);
      const heartsTotal = (profile?.heartsTotal || 0) + (heartsEarned || 0);
      const saved = await persistProgress(user.uid, nextLevel, heartsTotal);
      setProfile((prev) => ({ ...(prev || {}), ...saved }));
      return saved;
    },
    [user, profile]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      isAuthenticated: Boolean(user),
      displayName: profile?.displayName || user?.displayName || "Tuan Putri Ratih",
      currentLevel: profile?.currentLevel || 1,
      heartsTotal: profile?.heartsTotal || 0,
      loginGoogle,
      loginEmail,
      registerEmail,
      logout,
      completeLevel,
    }),
    [user, profile, loading, error, loginGoogle, loginEmail, registerEmail, logout, completeLevel]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}

/**
 * Proteksi sederhana untuk static export (tidak ada middleware).
 * Mengembalikan false selama sesi belum siap / user belum login,
 * dan otomatis redirect ke /login.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  return Boolean(user) && !loading;
}

