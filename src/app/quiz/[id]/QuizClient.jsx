"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";
import Navbar from "@/components/Navbar";
import { ThemeArt, ThemeBackdrop, ThemeStatus } from "@/components/ThemeFX";
import TerminalModal, { TerminalButton } from "@/components/TerminalModal";
import LevelModal from "@/components/LevelModal";
import FinalLevelModal from "@/components/FinalLevelModal";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { getLevelById, LEVELS } from "@/data/quizData";
import { getLevelTheme } from "@/data/moduleThemes";
import { buildCheatsheetDemo } from "@/lib/terminalDemo";
import { HEARTS_PER_CORRECT_ANSWER } from "@/lib/firebaseConfig";
import { playClick, playCorrect, playWrong, playLevelComplete } from "@/lib/sound";

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

function Splash({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-pink-50 to-rose-100 px-6 text-center">
      <div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-lg"
        >
          💖
        </motion.div>
        {children}
      </div>
    </main>
  );
}

/** Ringkasan materi (cheatsheet) yang wajib dibaca sebelum soal muncul. */
function Cheatsheet({ level, theme, onStart }) {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] p-[2px] shadow-[0_22px_55px_-30px_var(--mt-shadow)]">
        <div className="mt-glass overflow-hidden rounded-[1.9rem]">
          <ThemeArt theme={theme} className="h-40 w-full sm:h-48" />
          <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--mt-soft)] text-3xl">{level.emoji}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--mt-accent)]">Ringkasan Materi</p>
              <h2 className="text-2xl font-extrabold leading-tight text-[color:var(--mt-title)]">{level.title}</h2>
              <div className="mt-2">
                <ThemeStatus theme={theme} />
              </div>
            </div>
          </div>

          <p className="leading-relaxed text-[color:var(--mt-ink)]">{level.description}</p>

          <div className="mt-4">
            <TerminalButton
              onClick={() => {
                playClick();
                setTerminalOpen(true);
              }}
            />
          </div>

          <div className="mt-6 space-y-4">
            {level.cheatsheet.map((block) => (
              <div key={block.heading} className="rounded-2xl border border-[color:var(--mt-border)] bg-[color:var(--mt-soft-2)] p-4">
                <h3 className="mb-2 font-extrabold text-[color:var(--mt-title)]">{block.heading}</h3>
                <ul className="space-y-1.5">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm leading-relaxed text-[color:var(--mt-ink)]">
                      <span className="mt-0.5 text-[color:var(--mt-accent)]">✦</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {level.code && (
              <div>
                <h3 className="mb-2 font-extrabold text-[color:var(--mt-title)]">Contoh Kode</h3>
                <pre className="overflow-x-auto rounded-2xl bg-[color:var(--mt-dark)] p-4 text-[0.78rem] leading-relaxed text-[color:var(--mt-soft-2)]">
                  <code>{level.code}</code>
                </pre>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              playClick();
              onStart();
            }}
            className="mt-7 w-full rounded-2xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] py-4 text-lg font-extrabold text-[color:var(--mt-on-accent)] shadow-[0_18px_40px_-22px_var(--mt-shadow)] transition-transform hover:scale-[1.02]"
          >
            Sudah Paham, Mulai Kuis {level.questions.length} Soal 🚀
          </button>
          <p className="mt-3 text-center text-xs text-[color:var(--mt-muted)]">
            Tips: soal boleh diulang terus sampai benar. Nggak ada nilai, nggak ada drama — cuma hati 💖
          </p>
          </div>
        </div>
      </div>

      <TerminalModal
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        title={`${level.emoji} ${level.title}`}
        buildDemo={() => buildCheatsheetDemo(level)}
        demoKey={`quiz:${level.id}`}
        theme={theme}
      />
    </motion.div>
  );
}

function QuestionCard({ level, index, state, onAnswer, onNext, isLast }) {
  const question = level.questions[index];
  const solved = state.solved;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="mt-glass rounded-[2rem] border border-[color:var(--mt-border)] p-6 sm:p-8"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-3 py-1 text-xs font-black text-[color:var(--mt-on-accent)]">
          SOAL {index + 1} / {level.questions.length}
        </span>
        <span className="text-xs font-bold text-[color:var(--mt-muted)]">
          percobaan: {state.attempts}
        </span>
      </div>

      <h2 className="mb-6 text-xl font-extrabold leading-snug text-[color:var(--mt-title)] sm:text-2xl">{question.question}</h2>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const chosenWrong = state.wrong.includes(i);
          const isRevealedCorrect = solved && i === question.answer;
          const disabled = solved || chosenWrong;

          let look = "border-[color:var(--mt-border)] bg-white text-[color:var(--mt-ink)] hover:border-[color:var(--mt-border-strong)] hover:bg-[color:var(--mt-soft-2)]";
          if (isRevealedCorrect) look = "border-emerald-400 bg-emerald-50 text-emerald-800";
          else if (chosenWrong) look = "border-rose-300 bg-rose-50 text-rose-400 line-through";

          return (
            <motion.button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(i)}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-semibold transition-colors ${look} ${
                disabled ? "cursor-not-allowed" : ""
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${
                  isRevealedCorrect
                    ? "bg-emerald-500 text-white"
                    : chosenWrong
                    ? "bg-rose-200 text-rose-500"
                    : "bg-[color:var(--mt-soft)] text-[color:var(--mt-accent)]"
                }`}
              >
                {isRevealedCorrect ? "✓" : chosenWrong ? "✕" : OPTION_LETTERS[i]}
              </span>
              <span className="flex-1 leading-relaxed">{option}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4"
          >
            <p className="font-extrabold text-emerald-700">BENAR! {question.sweet}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-800/90">💡 {question.explanation}</p>
            <p className="mt-2 text-xs font-bold text-emerald-600">+{HEARTS_PER_CORRECT_ANSWER} 💖</p>
            <button
              type="button"
              onClick={onNext}
              className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] py-3 font-extrabold text-[color:var(--mt-on-accent)] shadow-md transition-transform hover:scale-[1.02]"
            >
              {isLast ? "Selesaikan Level 🎉" : "Lanjut Soal Berikutnya 💕"}
            </button>
          </motion.div>
        ) : state.wrong.length > 0 ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"
          >
            <p className="font-extrabold text-amber-700">Belum tepat, sayang 🥺 coba lagi ya</p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800/90">🔎 Petunjuk: {question.hint}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function QuizClient({ levelId }) {
  const ready = useRequireAuth();
  const router = useRouter();
  const { user, currentLevel, completeLevel } = useAuth();

  const level = useMemo(() => getLevelById(levelId), [levelId]);
  const theme = useMemo(() => getLevelTheme(levelId), [levelId]);

  const [phase, setPhase] = useState("materi"); // materi | quiz | done
  const [cursor, setCursor] = useState(0);
  const [results, setResults] = useState(() =>
    Object.fromEntries((level?.questions || []).map((q) => [q.id, { solved: false, attempts: 0, wrong: [] }]))
  );
  const [heartsEarned, setHeartsEarned] = useState(0);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const allSolved = level ? level.questions.every((q) => results[q.id]?.solved) : false;
  const solvedCount = level ? level.questions.filter((q) => results[q.id]?.solved).length : 0;

  // Validasi kelulusan: level baru selesai kalau SEMUA soal terjawab benar,
  // dan penyimpanan hanya jalan sekali per kunjungan.
  useEffect(() => {
    if (!level || phase !== "done" || !allSolved || savedRef.current) return;
    savedRef.current = true;
    playLevelComplete();

    const finish = async () => {
      setSaving(true);
      try {
        await completeLevel(level.id, heartsEarned);
      } catch (err) {
        console.error("Gagal menyimpan progres:", err);
      } finally {
        setSaving(false);
        if (level.id === 5) setShowFinalModal(true);
        else setShowLevelModal(true);
      }
    };
    finish();
  }, [allSolved, phase, level, heartsEarned, completeLevel]);

  if (!ready) return <Splash>Memeriksa sesi login...</Splash>;

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <Navbar />
        <Splash>
          <h1 className="mb-3 text-2xl font-extrabold text-rose-600">Level tidak ditemukan 🤔</h1>
          <Link href="/dashboard" className="font-bold text-pink-600 underline">
            ← Kembali ke Roadmap
          </Link>
        </Splash>
      </div>
    );
  }

  if (level.id > currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <Navbar />
        <Splash>
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="mb-2 text-2xl font-extrabold text-rose-600">Level {level.id} masih terkunci</h1>
          <p className="mb-6 max-w-sm text-rose-500">
            Selesaikan Level {currentLevel} dulu ya. Progresmu tersimpan otomatis kok 💖
          </p>
          <Link
            href={`/quiz/${currentLevel}`}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-extrabold text-white shadow-lg"
          >
            Lanjut Level {currentLevel} →
          </Link>
        </Splash>
      </div>
    );
  }

  const handleAnswer = (optionIndex) => {
    const question = level.questions[cursor];
    const entry = results[question.id];
    if (entry.solved) return;

    const isCorrect = optionIndex === question.answer;
    if (isCorrect) playCorrect();
    else playWrong();

    setResults((prev) => ({
      ...prev,
      [question.id]: {
        solved: isCorrect,
        attempts: prev[question.id].attempts + 1,
        wrong: isCorrect ? prev[question.id].wrong : Array.from(new Set([...prev[question.id].wrong, optionIndex])),
      },
    }));

    // Hati hanya diberikan sekali, yaitu saat jawaban benar.
    if (isCorrect) setHeartsEarned((h) => h + HEARTS_PER_CORRECT_ANSWER);
  };

  const handleNext = () => {
    playClick();
    if (allSolved && cursor === level.questions.length - 1) {
      setPhase("done");
      return;
    }
    setCursor((c) => Math.min(c + 1, level.questions.length - 1));
  };

  const goNextLevel = () => {
    if (level.id < 5) router.push(`/quiz/${level.id + 1}`);
    else router.push("/dashboard");
  };

  const progress = Math.round((solvedCount / level.questions.length) * 100);

  return (
    <div
      className="relative min-h-screen bg-[linear-gradient(135deg,var(--mt-bg-from),var(--mt-bg-via),var(--mt-bg-to))] pb-24 transition-colors duration-500"
      style={theme.style}
    >
      <FloatingHearts />
      <ThemeBackdrop theme={theme} />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            onClick={playClick}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[color:var(--mt-border)] bg-white font-bold text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold leading-tight text-[color:var(--mt-title)] sm:text-xl">{level.title}</h1>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--mt-soft)]">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))]"
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-bold text-[color:var(--mt-muted)]">HATI</p>
            <p className="text-lg font-black text-[color:var(--mt-title)]">💖 {heartsEarned}</p>
          </div>
        </div>

        {phase === "materi" ? (
          <Cheatsheet level={level} theme={theme} onStart={() => setPhase("quiz")} />
        ) : (
          <AnimatePresence mode="wait">
            <QuestionCard
              key={level.questions[cursor].id}
              level={level}
              index={cursor}
              state={results[level.questions[cursor].id]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLast={cursor === level.questions.length - 1}
            />
          </AnimatePresence>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[color:var(--mt-muted)]">
          {LEVELS.map((lv) => (
            <Link
              key={lv.id}
              href={`/quiz/${lv.id}`}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                lv.id === level.id
                  ? "bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] text-[color:var(--mt-on-accent)]"
                  : lv.id <= currentLevel
                  ? "bg-white text-[color:var(--mt-title)] hover:bg-[color:var(--mt-soft)]"
                  : "bg-[color:var(--mt-soft)] text-[color:var(--mt-muted)]"
              }`}
            >
              Lv{lv.id} {lv.id < currentLevel || (lv.id === level.id && allSolved) ? "✓" : ""}
            </Link>
          ))}
        </div>

        {saving && (
          <p className="mt-6 text-center text-sm font-bold text-[color:var(--mt-accent)]">Menyimpan progres ke Firestore... ⏳</p>
        )}

        <LevelModal isOpen={showLevelModal} onClose={() => setShowLevelModal(false)} onNextLevel={goNextLevel} />
        <FinalLevelModal isOpen={showFinalModal} onClose={() => setShowFinalModal(false)} />
      </main>
    </div>
  );
}
