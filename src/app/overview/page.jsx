"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";
import Navbar from "@/components/Navbar";
import LabConsole from "@/components/LabConsole";
import { ThemeArt, ThemeBackdrop, ThemeStatus } from "@/components/ThemeFX";
import { Section } from "@/components/MaterialComponents";
import TerminalModal, { TerminalButton } from "@/components/TerminalModal";
import { useAuth, useRequireAuth } from "@/context/AuthContext";
import { LEVELS } from "@/data/quizData";
import { QUIZ_TOPICS } from "@/data/curriculum";
import { getLab } from "@/data/labData";
import { getLevelTheme, getModuleTheme } from "@/data/moduleThemes";
import { buildSectionDemo, buildTopicDemo } from "@/lib/terminalDemo";
import { playClick } from "@/lib/sound";
import BackendAnimationModal, { resolveAnimationConcept } from "@/components/BackendAnimationModal";

function LoadingSesi() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-lg"
        >
          💖
        </motion.div>
        <p className="font-bold text-rose-600">Menyiapkan modul belajar...</p>
      </div>
    </main>
  );
}

const TOTAL_SECTIONS = QUIZ_TOPICS.reduce((sum, topic) => sum + topic.sections.length, 0);
const TOTAL_EXAMPLES = QUIZ_TOPICS.reduce(
  (sum, topic) => sum + topic.sections.reduce((inner, section) => inner + (section.examples?.length || 0), 0),
  0
);

export default function OverviewPage() {
  const ready = useRequireAuth();
  const { user } = useAuth();
  const [activeTopic, setActiveTopic] = useState(QUIZ_TOPICS[0].id);
  const [openSection, setOpenSection] = useState(0);
  const [pendingCommand, setPendingCommand] = useState(null);
  const [mobileLabOpen, setMobileLabOpen] = useState(false);
  const [terminal, setTerminal] = useState(null);
  const [animationModal, setAnimationModal] = useState(null); // { concept, topicId, sectionTitle }

  useEffect(() => {
    if (!mobileLabOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileLabOpen]);

  const topicIndex = QUIZ_TOPICS.findIndex((item) => item.id === activeTopic);
  const topic = QUIZ_TOPICS[topicIndex] || QUIZ_TOPICS[0];
  const theme = getModuleTheme(topic.id);
  const lab = useMemo(() => getLab(topic.id), [topic.id]);
  const userKey = user?.uid || "guest";

  if (!ready) return <LoadingSesi />;

  const changeTopic = (id) => {
    playClick();
    setActiveTopic(id);
    setOpenSection(0);
    setPendingCommand(null);
    setMobileLabOpen(false);
  };

  const practiceCommand = (command) => {
    playClick();
    setPendingCommand({ command, id: `${Date.now()}-${Math.random()}` });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileLabOpen(true);
    }
  };

  const openTerminal = (title, buildDemo, key) => {
    playClick();
    setTerminal({ title, buildDemo, key });
  };

  const previousTopic = topicIndex > 0 ? QUIZ_TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < QUIZ_TOPICS.length - 1 ? QUIZ_TOPICS[topicIndex + 1] : null;

  return (
    <div
      className="relative min-h-screen bg-[linear-gradient(135deg,var(--mt-bg-from),var(--mt-bg-via),var(--mt-bg-to))] transition-colors duration-500"
      style={theme.style}
    >
      <FloatingHearts />
      <ThemeBackdrop theme={theme} />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6">
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-glass mb-8 rounded-[2.25rem] border-2 border-[color:var(--mt-border)] p-7 sm:p-10"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[color:var(--mt-accent)]">Modul Acuan</p>
          </div>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-[color:var(--mt-title)] sm:text-4xl">
            Belajar Backend dari Nol: Baca, Coba, Lalu Kuasai 📚
          </h1>
          <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-[color:var(--mt-ink)]">
            Materi ini disusun bertahap untuk Tuan Putri Ratih. Setiap bagian punya penjelasan, contoh, dan latihan
            yang bisa langsung dicoba di <span className="font-bold text-[color:var(--mt-accent)]">Lab Terminal</span> di samping
            materi. Tidak perlu install apa pun — semua latihan berjalan aman di browser.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", title: "Baca pelan-pelan", desc: "Buka satu bagian, pahami alurnya." },
              { step: "2", title: "Coba di terminal", desc: "Klik latihan, tekan Enter, lihat hasilnya." },
              { step: "3", title: "Kunci di kuis", desc: "Lima level inti menanti di roadmap." },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[color:var(--mt-border)] bg-[color:var(--mt-soft-2)] p-3.5"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-[color:var(--mt-accent)]">
                  Langkah {item.step}
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-[color:var(--mt-title)]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--mt-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[color:var(--mt-title)]">
            <span className="rounded-full bg-[color:var(--mt-soft)] px-3 py-1">{QUIZ_TOPICS.length} modul</span>
            <span className="rounded-full bg-[color:var(--mt-soft)] px-3 py-1">{TOTAL_SECTIONS} bagian</span>
            <span className="rounded-full bg-[color:var(--mt-soft)] px-3 py-1">{TOTAL_EXAMPLES}+ contoh</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Lab terminal interaktif</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">5 modul inti + 3 pendalaman</span>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              onClick={playClick}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-7 py-4 text-center text-lg font-extrabold text-[color:var(--mt-on-accent)] shadow-[0_18px_42px_-22px_var(--mt-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Mulai Petualangan Kuis Tuan Putri Ratih 🚀
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={playClick}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[color:var(--mt-border)] bg-white px-6 py-4 font-bold text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
            >
              Lihat Roadmap 🗺️
            </Link>
          </div>
        </motion.header>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {QUIZ_TOPICS.map((item, i) => {
            const active = item.id === activeTopic;
            const tabTheme = getModuleTheme(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTopic(item.id)}
                style={tabTheme.style}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  active
                    ? "bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] text-[color:var(--mt-on-accent)] shadow-[0_14px_30px_-18px_var(--mt-shadow)]"
                    : "border-2 border-[color:var(--mt-border)] bg-white/45 text-[color:var(--mt-title)] backdrop-blur-md hover:border-[color:var(--mt-border-strong)] hover:bg-[color:var(--mt-soft-2)]"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>
                  <span className={active ? "opacity-70" : "opacity-50"}>Modul {i + 1}</span> · {item.shortTitle}
                </span>
                {item.badge === "Pendalaman" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ${
                      active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    Bonus
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.section
                key={topic.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="mt-glass overflow-hidden rounded-3xl border-2 border-dashed border-[color:var(--mt-border)]">
                  <ThemeArt theme={theme} className="h-44 w-full sm:h-52" />
                  <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--mt-soft),var(--mt-soft-romance))] text-3xl">
                        {topic.emoji}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--mt-accent)]">
                            Modul {topicIndex + 1} dari {QUIZ_TOPICS.length}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                              topic.badge === "Inti"
                                ? "bg-[color:var(--mt-soft)] text-[color:var(--mt-title)]"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {topic.badge}
                          </span>
                        </div>
                        <h2 className="text-2xl font-extrabold leading-tight text-[color:var(--mt-title)]">{topic.title}</h2>
                        <div className="mt-2">
                          <ThemeStatus theme={theme} />
                        </div>
                      </div>
                    </div>

                    {topic.levelId ? (
                      <Link
                        href={`/quiz/${topic.levelId}`}
                        onClick={playClick}
                        className="rounded-full border-2 border-[color:var(--mt-border)] bg-white px-3 py-1.5 text-xs font-bold text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
                      >
                        Kuis Level {topic.levelId} →
                      </Link>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                        Pendalaman · tanpa kuis
                      </span>
                    )}
                  </div>

                  <p className="mt-4 leading-relaxed text-[color:var(--mt-ink)]">{topic.intro}</p>

                  <div className="mt-4">
                    <TerminalButton
                      onClick={() =>
                        openTerminal(
                          `${topic.emoji} ${topic.title}`,
                          () => buildTopicDemo(topic),
                          `topic:${topic.id}`
                        )
                      }
                    />
                  </div>

                  {/* ── Tombol Animasi Interaktif sudah ada di dalam setiap section ── */}

                  <div className="mt-4 rounded-2xl bg-[color:var(--mt-soft)] p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--mt-accent)]">
                      Setelah modul ini, kamu bisa
                    </p>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {topic.goals.map((goal) => (
                        <li key={goal} className="flex gap-2 text-xs leading-relaxed text-[color:var(--mt-ink)]">
                          <span className="mt-0.5 text-[color:var(--mt-accent)]">✓</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-[color:var(--mt-title)]">
                    <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{topic.sections.length} bagian</span>
                    <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                      {topic.sections.reduce((sum, section) => sum + (section.examples?.length || 0), 0)} contoh
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                      {lab?.missions?.length || 0} misi lab
                    </span>
                  </div>
                  </div>
                </div>

                {topic.sections.map((section, i) => {
                  const sectionConcept = resolveAnimationConcept(topic.id, section.title);
                  return (
                    <Section
                      key={`${topic.id}-${section.title}`}
                      section={section}
                      index={i}
                      isOpen={openSection === i}
                      onToggle={() => setOpenSection(openSection === i ? -1 : i)}
                      onPractice={practiceCommand}
                      onWatch={() =>
                        openTerminal(
                          section.title,
                          () => buildSectionDemo(topic, section),
                          `section:${topic.id}:${section.title}`
                        )
                      }
                      onAnimate={
                        sectionConcept
                          ? () => {
                              playClick();
                              setAnimationModal({
                                concept: sectionConcept,
                                topicId: topic.id,
                                sectionTitle: section.title,
                              });
                            }
                          : undefined
                      }
                      animateConcept={sectionConcept}
                    />
                  );
                })}

                <div className="rounded-3xl border-2 border-[color:var(--mt-border)] bg-[color:var(--mt-soft-2)] p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--mt-accent)]">Rangkuman Modul</p>
                  <h3 className="mt-1 text-xl font-extrabold text-[color:var(--mt-title)]">
                    {topic.emoji} Yang perlu kamu bawa dari modul ini
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {topic.summary.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-[color:var(--mt-ink)]">
                        <span className="mt-0.5 text-[color:var(--mt-accent)]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                  {previousTopic ? (
                    <button
                      type="button"
                      onClick={() => changeTopic(previousTopic.id)}
                      className="rounded-2xl border-2 border-[color:var(--mt-border)] bg-white px-4 py-3 text-left text-sm font-bold text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
                    >
                      ← {previousTopic.emoji} {previousTopic.shortTitle}
                    </button>
                  ) : (
                    <span />
                  )}
                  {nextTopic ? (
                    <button
                      type="button"
                      onClick={() => changeTopic(nextTopic.id)}
                      className="rounded-2xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-3 text-right text-sm font-bold text-[color:var(--mt-on-accent)] shadow-[0_14px_30px_-18px_var(--mt-shadow)] transition-transform hover:-translate-y-0.5"
                    >
                      Lanjut: {nextTopic.emoji} {nextTopic.shortTitle} →
                    </button>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="rounded-2xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-3 text-right text-sm font-bold text-[color:var(--mt-on-accent)] shadow-[0_14px_30px_-18px_var(--mt-shadow)]"
                    >
                      Semua modul selesai — kembali ke Roadmap 👑
                    </Link>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <LabConsole
                key={`${topic.id}-desktop`}
                lab={lab}
                topicId={topic.id}
                userKey={userKey}
                pendingCommand={pendingCommand}
                className="h-[calc(100vh-8rem)] max-h-[780px] min-h-[540px]"
              />
              <p className="mt-2 text-center text-[10px] leading-relaxed text-[color:var(--mt-muted)]">
                Lab ini simulasi aman. Tidak ada data asli yang diubah.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((level) => {
            const levelTheme = getLevelTheme(level.id);
            return (
              <Link
                key={level.id}
                href={`/quiz/${level.id}`}
                onClick={playClick}
                style={levelTheme.style}
                className="group rounded-3xl border-2 border-[color:var(--mt-border)] bg-white/80 p-5 shadow-[0_16px_36px_-28px_var(--mt-shadow)] transition-all hover:-translate-y-1 hover:border-[color:var(--mt-border-strong)] hover:shadow-xl"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--mt-soft),var(--mt-soft-romance))] text-xl">
                    {level.emoji}
                  </span>
                  <div>
                    <p className="text-[0.7rem] font-black uppercase tracking-wider text-[color:var(--mt-accent)]">
                      Kuis Level {level.id}
                    </p>
                    <h3 className="font-extrabold leading-tight text-[color:var(--mt-title)]">{level.shortTitle}</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[color:var(--mt-ink)]">{level.tagline}</p>
                <p className="mt-3 text-sm font-bold text-[color:var(--mt-accent)] group-hover:underline">
                  {level.questions.length} soal → kerjakan 💕
                </p>
              </Link>
            );
          })}
        </section>
      </main>

      {!mobileLabOpen && (
        <button
          type="button"
          onClick={() => {
            playClick();
            setMobileLabOpen(true);
          }}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-3 text-sm font-extrabold text-[color:var(--mt-on-accent)] shadow-[0_18px_40px_-20px_var(--mt-shadow)] lg:hidden"
        >
          🧪 Buka Lab Terminal
        </button>
      )}

      <AnimatePresence>
        {mobileLabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Lab Terminal"
          >
            <button
              type="button"
              aria-label="Tutup lab"
              onClick={() => setMobileLabOpen(false)}
              className="absolute inset-0 h-full w-full bg-rose-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 top-12 p-3"
            >
              <LabConsole
                key={`${topic.id}-mobile`}
                lab={lab}
                topicId={topic.id}
                userKey={userKey}
                pendingCommand={pendingCommand}
                onRequestClose={() => setMobileLabOpen(false)}
                className="h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TerminalModal
        open={Boolean(terminal)}
        onClose={() => setTerminal(null)}
        title={terminal?.title || "Terminal Demo"}
        buildDemo={terminal?.buildDemo}
        demoKey={terminal?.key}
        theme={theme}
      />

      {/* ── Modal Animasi Interaktif Backend ── */}
      <BackendAnimationModal
        concept={animationModal?.concept ?? "GET_REQUEST"}
        topicId={animationModal?.topicId}
        sectionTitle={animationModal?.sectionTitle}
        isOpen={Boolean(animationModal)}
        onClose={() => setAnimationModal(null)}
      />
    </div>
  );
}
