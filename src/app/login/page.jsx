"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";
import { useAuth } from "@/context/AuthContext";
import { playHeartBeat } from "@/lib/sound";

const FRIENDLY_ERRORS = {
  "auth/invalid-credential": "Email atau password-nya belum pas, coba cek lagi ya 🥺",
  "auth/invalid-email": "Format email-nya belum benar deh 📧",
  "auth/user-not-found": "Akun dengan email itu belum ada. Mau daftar dulu?",
  "auth/wrong-password": "Password-nya salah. Tarik napas, coba lagi 💕",
  "auth/email-already-in-use": "Email ini sudah pernah daftar, yuk login aja.",
  "auth/weak-password": "Password-nya minimal 6 karakter ya, biar kuat kayak cintaku 🛡️",
  "auth/popup-closed-by-user": "Jendela Google-nya ditutup. Buka lagi yuk ✨",
  "auth/popup-blocked": "Popup browser-nya diblokir. Izinkan popup untuk situs ini ya.",
  "auth/unauthorized-domain": "Domain ini belum dibolehkan di Firebase Auth (Authorized Domains).",
  "auth/network-request-failed": "Koneksi terputas. Cek internet dulu 📡",
  "auth/too-many-requests": "Terlalu sering coba. Tunggu sebentar ya, jangan marah-marah 😌",
  "auth/operation-not-allowed": "Provider login ini belum diaktifkan di Firebase Console (Authentication → Sign-in method).",
  "auth/configuration-not-found": "Firebase Authentication untuk proyek ini belum diaktifkan sama sekali. Buka Console → Authentication → Get started dulu ya.",
};

function LoginCard() {
  const router = useRouter();
  const search = useSearchParams();
  const { user, loading, loginGoogle, loginEmail, registerEmail } = useAuth();

  const [mode, setMode] = useState("login"); // login | daftar
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo = search?.get("next") || "/dashboard";

  // Sudah login? Tidak perlu lihat halaman ini lagi.
  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [loading, user, router, redirectTo]);

  const friendly = (err) => FRIENDLY_ERRORS[err?.code] || err?.message || "Aduh, ada yang error nih 😢";

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      playHeartBeat();
      await action();
      router.replace(redirectTo);
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if (mode === "login") {
      run(() => loginEmail(email, password));
    } else {
      run(() => registerEmail(email, password, name || "Tuan Putri Ratih"));
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-white">
      <FloatingHearts />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border-2 border-pink-200 bg-white/85 p-7 shadow-2xl shadow-pink-300/40 backdrop-blur-xl sm:p-9"
        >
          <div className="mb-7 text-center">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-500 text-3xl shadow-lg"
            >
              👑
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">nduttt.be</p>
            <h1 className="mt-1 text-2xl font-extrabold text-rose-600 sm:text-3xl">
              Selamat Datang, Tuan Putri Ratih
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-rose-500/80">
              Masuk dulu ya, biar progres belajar backend-ku yang ini ikut tersimpan 💖
            </p>
          </div>

          <div className="mb-6 flex rounded-2xl bg-pink-50 p-1 text-sm font-bold">
            {[
              { key: "login", label: "Masuk" },
              { key: "daftar", label: "Daftar" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key);
                  setError("");
                }}
                className={`flex-1 rounded-xl py-2 transition-all ${
                  mode === tab.key ? "bg-white text-rose-600 shadow" : "text-rose-400 hover:text-rose-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => run(loginGoogle)}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-pink-200 bg-white py-3 font-bold text-rose-600 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.137-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.519 4.798C14.561 15.158 18.94 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.684 8.338 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.257 0 10.097-1.976 13.746-5.226l-6.332-5.147C29.093 35.184 26.65 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.573 5.066C9.503 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.95 11.95 0 0 1-4.089 5.612l6.532 5.166C41.192 35.692 44 30.166 44 24c0-1.341-.137-2.65-.389-3.917z" />
            </svg>
            Lanjut dengan Google
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-pink-300">
            <span className="h-px flex-1 bg-pink-200" />
            atau email
            <span className="h-px flex-1 bg-pink-200" />
          </div>

          <form onSubmit={submitEmail} className="space-y-4">
            {mode === "daftar" && (
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-rose-400">Nama Panggilan</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tuan Putri Ratih"
                  className="w-full rounded-xl border-2 border-pink-200 bg-white px-4 py-3 text-rose-700 outline-none transition-colors placeholder:text-pink-300 focus:border-rose-400"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-rose-400">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ratih@example.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-pink-200 bg-white px-4 py-3 text-rose-700 outline-none transition-colors placeholder:text-pink-300 focus:border-rose-400"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-rose-400">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minimal 6 karakter"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-xl border-2 border-pink-200 bg-white px-4 py-3 text-rose-700 outline-none transition-colors placeholder:text-pink-300 focus:border-rose-400"
              />
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-3.5 text-base font-extrabold text-white shadow-lg shadow-rose-300/50 transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? "Sebentar ya..." : mode === "login" ? "Masuk & Mulai Belajar 🚀" : "Bikin Akun 💕"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-rose-400">
            Sesi login-mu disimpan di Firebase Auth, dan progres (level + total hati) tercatat di Firestore.
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs font-semibold text-rose-400">
          Belum punya akun? Aktifkan provider <span className="text-rose-600">Google</span> /{" "}
          <span className="text-rose-600">Email-Password</span> di Firebase Console dulu ya.
        </p>
      </div>
    </main>
  );
}


export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-gradient-to-br from-pink-50 to-rose-100">
          <p className="font-bold text-rose-600">Membuka gerbang cinta... 💖</p>
        </main>
      }
    >
      <LoginCard />
    </Suspense>
  );
}
