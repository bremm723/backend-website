"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";
import Navbar from "@/components/Navbar";
import FinalLevelModal from "@/components/FinalLevelModal";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { LEVELS } from "@/data/quizData";
import { getLevelTheme } from "@/data/moduleThemes";
import ThemeAudio from "@/components/ThemeAudio";
import { playClick } from "@/lib/sound";

function Splash({ text }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-pink-50 to-rose-100">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-center"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-lg">
          💖
        </div>
        <p className="font-bold text-rose-600">{text}</p>
      </motion.div>
    </main>
  );
}

export default function DashboardPage() {
  const ready = useRequireAuth();
  const { displayName, currentLevel, heartsTotal, logout } = useAuth();
  const [showReward, setShowReward] = useState(false);

  if (!ready) return <Splash text="Memuat sesi Tuan Putri Ratih..." />;

  const finished = currentLevel > LEVELS.length;
  const totalQuestions = LEVELS.reduce((sum, lv) => sum + lv.questions.length, 0);
  const clearedCount = Math.min(currentLevel - 1, LEVELS.length);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-red-50 pb-24">
      <FloatingHearts />
      <ThemeAudio theme={getLevelTheme(Math.min(currentLevel, LEVELS.length))} />
      <Navbar />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        <motion.section
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 overflow-hidden rounded-[2.25rem] border-2 border-pink-200 bg-white/85 p-7 shadow-xl shadow-pink-200/50 backdrop-blur-xl sm:p-9"
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-400">Roadmap Belajar Backend</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-rose-600 drop-shadow-sm sm:text-4xl">
            Halo, {displayName}! ❤️
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-rose-800/80">
            {finished
              ? "Semua level sudah tuntas! Hadiahnya tinggal diklaim ya, Tuan Putri Ratih ✨"
              : "Baca materinya dulu di modul acuan, lalu taklukkan 5 level kuis. Satu level selesai kalau semua soal terjawab benar 💪"}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-4 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Level Aktif</p>
              <p className="mt-1 text-3xl font-black">{finished ? "👑" : currentLevel}</p>
            </div>
            <div className="rounded-2xl border-2 border-pink-200 bg-pink-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-400">Total Hati</p>
              <p className="mt-1 text-3xl font-black text-rose-600">💖 {heartsTotal}</p>
            </div>
            <div className="rounded-2xl border-2 border-pink-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-400">Level Selesai</p>
              <p className="mt-1 text-3xl font-black text-rose-600">
                {clearedCount}/{LEVELS.length}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/overview"
              onClick={playClick}
              className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 px-6 py-4 text-center text-base font-extrabold text-white shadow-xl shadow-rose-300/50 transition-transform hover:-translate-y-0.5"
            >
              Mulai Petualangan Kuis Tuan Putri Ratih 🚀
            </Link>
            <Link
              href={`/quiz/${finished ? 1 : currentLevel}`}
              onClick={playClick}
              className="flex-1 rounded-2xl border-2 border-pink-300 bg-white px-6 py-4 text-center text-base font-extrabold text-rose-600 transition-colors hover:bg-pink-50"
            >
              {finished ? "Ulangi dari Level 1 🔁" : `Lanjut Level ${currentLevel} →`}
            </Link>
          </div>

          <p className="mt-4 text-center text-xs font-semibold text-rose-400">
            {totalQuestions} soal menanti · progres {displayName} tersimpan otomatis di Firestore
          </p>
        </motion.section>

        <div className="relative space-y-5">
          <div className="absolute bottom-10 left-8 top-10 hidden w-1 rounded-full bg-pink-200 md:block" />

          {LEVELS.map((level, index) => {
            const isCompleted = level.id < currentLevel;
            const isActive = level.id === currentLevel;
            const isUnlocked = level.id <= currentLevel;
            const levelTheme = getLevelTheme(level.id);

            return (
              <motion.div
                key={level.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                style={levelTheme.style}
                className={`relative flex flex-col gap-4 overflow-hidden rounded-3xl border-2 p-6 transition-all duration-300 md:flex-row md:items-center md:pl-20 ${
                  isUnlocked
                    ? "border-[color:var(--mt-border)] bg-white/85 shadow-[0_18px_45px_-32px_var(--mt-shadow)] backdrop-blur-md"
                    : "border-gray-200 bg-gray-100/50 opacity-70 grayscale"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-cover bg-center opacity-[0.16] mix-blend-luminosity md:block"
                  style={{ backgroundImage: `url(${levelTheme.art.image})` }}
                />
                <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,white_0%,rgba(255,255,255,0.82)_52%,transparent_100%)] md:block" />

                <div
                  className={`absolute left-2 z-10 hidden h-12 w-12 place-items-center rounded-full border-4 border-white text-lg font-black shadow-md md:grid ${
                    isCompleted
                      ? "bg-emerald-400 text-white"
                      : isActive
                      ? "animate-pulse bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] text-[color:var(--mt-on-accent)]"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : level.emoji}
                </div>

                <div className="relative z-10 flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isUnlocked ? "text-[color:var(--mt-accent)]" : "text-gray-400"}`}>
                    {levelTheme.emoji} Kuis Level {level.id}
                  </p>
                  <h3 className={`text-xl font-bold ${isUnlocked ? "text-[color:var(--mt-title)]" : "text-gray-500"}`}>
                    {level.title}
                  </h3>
                  <p className={isUnlocked ? "mt-1 text-[color:var(--mt-ink)]" : "mt-1 text-gray-600"}>{level.description}</p>
                  <p className={`mt-2 text-xs font-bold uppercase tracking-wide ${isUnlocked ? "text-[color:var(--mt-muted)]" : "text-gray-400"}`}>
                    {level.questions.length} soal · {level.tagline}
                  </p>
                </div>

                <div className="relative z-10 shrink-0">
                  {isCompleted ? (
                    <Link
                      href={`/quiz/${level.id}`}
                      onClick={playClick}
                      className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
                    >
                      Ulangi 🔁
                    </Link>
                  ) : isActive ? (
                    <Link
                      href={`/quiz/${level.id}`}
                      onClick={playClick}
                      className="inline-block rounded-full bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-6 py-2.5 font-bold text-[color:var(--mt-on-accent)] shadow-md transition-all hover:scale-105"
                    >
                      Mulai Kuis 🚀
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500">
                      🔒 Terkunci
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-[2.25rem] border-2 border-dashed border-rose-300 bg-gradient-to-br from-rose-50 to-pink-100 p-7 text-center"
        >
          <div className="mb-3 text-4xl">🎁</div>
          <h2 className="text-2xl font-extrabold text-rose-600">Hadiah di Akhir Perjalanan</h2>
          <p className="mx-auto mt-2 max-w-md leading-relaxed text-rose-700/80">
            Selesaikan kelima level dan tombol klaim hadiah akan muncul sendiri. Buat aku bayar traktiran, Ratihhh ✨
          </p>
          <button
            type="button"
            onClick={() => setShowReward(true)}
            disabled={!finished}
            className={`mt-5 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              finished
                ? "border-2 border-rose-400 bg-rose-500 text-white hover:bg-rose-600"
                : "cursor-not-allowed border-2 border-pink-200 bg-white/60 text-rose-300"
            }`}
          >
            {finished ? "Klaim Hadiah Sekarang 🎁" : "Terkunci — selesaikan Level 5 dulu 🔒"}
          </button>
        </motion.section>

        <p className="mt-8 text-center">
          <button onClick={logout} className="text-xs font-bold text-rose-400 underline hover:text-rose-600">
            Keluar dari akun
          </button>
        </p>
      </div>

      <FinalLevelModal isOpen={showReward} onClose={() => setShowReward(false)} />
    </div>
  );
}
