"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./IntroScreen.css";

const TUTORIAL_URL = "https://paham-frontend-backend.pages.dev/";
const AUTO_CONTINUE_MS = 9000;

// Intro singkat sebelum masuk ke gerbang login/dashboard.
// Sengaja tanpa iframe: situs tutorial memblokir embed (X-Frame-Options),
// jadi tutorial dibuka lewat tab baru dan intro tetap ringan.
export default function IntroScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, AUTO_CONTINUE_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  const finish = () => {
    setVisible(false);
    onFinish?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="intro-screen fixed inset-0 z-[80] flex items-center justify-center overflow-hidden px-5 py-8"
    >
      <div className="intro-blob intro-blob-1" aria-hidden="true" />
      <div className="intro-blob intro-blob-2" aria-hidden="true" />
      <div className="intro-blob intro-blob-3" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 text-center shadow-[0_30px_90px_-30px_rgba(190,24,93,0.45)] backdrop-blur-xl sm:p-8"
      >
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 text-4xl text-white shadow-xl shadow-rose-300/50"
        >
          👑
        </motion.div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-rose-400">
          Selamat datang, Tuan Putri Ratih
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-rose-600 sm:text-4xl">
          nduttt.be
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-rose-500/80">
          Belajar backend pelan-pelan: dari HTTP, database, auth, sampai deploy.
          Setiap modul punya animasi dan terminal sendiri.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
          {[
            { icon: "💻", label: "Client" },
            { icon: "🖥️", label: "Server" },
            { icon: "🗄️", label: "Database" },
          ].map((node, index) => (
            <div key={node.label} className="flex items-center gap-2 sm:gap-3">
              {index > 0 && (
                <motion.span
                  animate={{ x: [0, 4, 0], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.25 }}
                  className="text-sm font-black text-rose-300"
                >
                  →
                </motion.span>
              )}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut",
                }}
                className="rounded-2xl border border-rose-200/80 bg-white/80 px-2.5 py-2 shadow-sm"
              >
                <span className="block text-xl">{node.icon}</span>
                <span className="mt-0.5 block text-[9px] font-bold text-rose-500/70">
                  {node.label}
                </span>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-300/50 transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Lanjutkan ke Modul
          </button>
          <a
            href={TUTORIAL_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-2xl border-2 border-rose-200 bg-white/70 px-5 py-3 text-sm font-bold text-rose-500 transition-colors hover:bg-white sm:w-auto"
          >
            Buka tutorial
          </a>
        </div>

        <p className="mt-4 text-[10px] font-semibold text-rose-400/60">
          Otomatis lanjut dalam 9 detik ✨
        </p>
      </motion.div>
    </motion.div>
  );
}
