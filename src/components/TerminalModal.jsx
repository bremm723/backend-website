"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const BUTTON_LABEL = "Tuan Putri, Tonton ini ya sayangg!!";
const PROMPT = "ratih@nduttt:~$";
const TYPE_MS = 100;
const STEP_PAUSE = 450;
const OUTPUT_MS = 120;
const NEXT_PAUSE = 800;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TONE = {
  success: "text-emerald-300",
  error: "text-rose-300",
  warn: "text-amber-300",
  info: "text-sky-300",
  muted: "text-pink-200/40",
};

function transcript(steps) {
  const entries = [];
  (steps || []).forEach((step, index) => {
    entries.push({ type: "command", text: step.command, step: index });
    (step.blocks || []).forEach((block) => entries.push({ type: "output", block, step: index }));
  });
  return entries;
}

export function TerminalButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-2xl border-2 border-[color:var(--mt-border-strong)] bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-2.5 text-left text-[11px] font-extrabold leading-tight text-[color:var(--mt-on-accent)] shadow-[0_14px_30px_-18px_var(--mt-shadow)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-105 ${className}`}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-black/25 font-mono text-[8px] font-black leading-none">
        &gt;_
      </span>
      <span>{BUTTON_LABEL}</span>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/25 text-[8px]">
        ▶
      </span>
    </button>
  );
}

function OutputBlock({ block }) {
  if (!block) return null;

  if (block.kind === "blank") {
    return <div className="h-2" aria-hidden="true" />;
  }

  if (block.kind === "code" || block.kind === "table") {
    return (
      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-pink-100/80 sm:text-[12.5px]">
        {block.text}
      </pre>
    );
  }

  return (
    <p
      className={`mt-0.5 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed sm:text-[12.5px] ${
        TONE[block.kind] || "text-pink-100/80"
      }`}
    >
      {block.text}
    </p>
  );
}

function CommandLine({ command, caret = false, active = false, onSelect }) {
  const Tag = onSelect ? "button" : "div";
  return (
    <Tag
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      title={onSelect ? "Lihat penjelasan perintah ini" : undefined}
      className={`-mx-2 mt-4 flex items-start gap-2 rounded-lg border px-2 py-1 text-left transition-colors first:mt-0 ${
        active
          ? "border-pink-300/20 bg-pink-400/10"
          : onSelect
          ? "border-transparent hover:border-white/5 hover:bg-white/[0.04]"
          : "border-transparent"
      }`}
    >
      <span className="shrink-0 pt-px font-mono text-[11px] font-bold text-pink-400 sm:text-[11.5px]">
        {PROMPT}
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-all font-mono text-[12px] font-semibold text-pink-50 sm:text-[12.5px]">
        {command}
        {caret && (
          <span className="mt-caret ml-0.5 inline-block h-[0.95em] w-[0.48em] translate-y-[0.1em] bg-pink-300/90" />
        )}
      </span>
    </Tag>
  );
}

function BehindTheScenes({ step, index, total, following, onFollow }) {
  const explain = step?.explain;
  if (!step || !explain) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-pink-200/35">
          Di balik layar
        </p>
        <span className="shrink-0 font-mono text-[9px] text-pink-200/30">
          {index + 1}/{total}
        </span>
      </div>

      <div className="mt-1 flex items-start gap-2">
        <p
          className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-pink-100/65"
          title={step.command}
        >
          {step.command}
        </p>
        {!following && (
          <button
            type="button"
            onClick={onFollow}
            className="shrink-0 rounded-full border border-pink-300/15 bg-pink-300/5 px-2 py-0.5 text-[9px] font-bold text-pink-200/60 transition-colors hover:bg-pink-300/10 hover:text-pink-100"
          >
            Ikuti
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-pink-300/45">
            Fungsi
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-pink-100/80">{explain.fungsi}</p>
        </div>

        <div>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-pink-300/45">
            Alur
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {(explain.flow || []).map((part, i) => (
              <span key={`${part}-${i}`} className="inline-flex max-w-full items-center gap-1">
                {i > 0 && <span className="text-[9px] text-pink-300/30">→</span>}
                <span className="max-w-full break-words rounded-md border border-pink-300/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] leading-tight text-pink-100/60">
                  {part}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-pink-300/45">
            Cara kerjanya
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-pink-100/55">{explain.behind}</p>
        </div>
      </div>
    </>
  );
}

export default function TerminalModal({ open, onClose, title, theme, buildDemo, demoKey }) {
  const [mounted, setMounted] = useState(false);
  const [steps, setSteps] = useState(null);
  const [entries, setEntries] = useState([]);
  const [typing, setTyping] = useState("");
  const [phase, setPhase] = useState("loading");
  const [stepNo, setStepNo] = useState(0);
  const [error, setError] = useState("");
  const [playKey, setPlayKey] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);

  const scrollRef = useRef(null);
  const runRef = useRef(0);
  const skipToTopRef = useRef(false);
  const buildRef = useRef(buildDemo);
  buildRef.current = buildDemo;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const runId = ++runRef.current;
    const alive = () => !cancelled && runRef.current === runId;

    setSteps(null);
    setEntries([]);
    setTyping("");
    setPhase("loading");
    setStepNo(0);
    setError("");
    setSelectedStep(null);
    skipToTopRef.current = false;

    async function play() {
      let list = [];

      try {
        const result = await Promise.resolve(buildRef.current ? buildRef.current() : []);
        list = Array.isArray(result)
          ? result.filter((step) => step?.command && Array.isArray(step.blocks))
          : [];
      } catch (err) {
        if (!alive()) return;
        setError(`Gagal menyiapkan terminal: ${err?.message || "tidak diketahui"}`);
        setPhase("error");
        return;
      }

      if (!alive()) return;

      if (!list.length) {
        setError("Demo terminal belum tersedia untuk materi ini.");
        setPhase("error");
        return;
      }

      setSteps(list);

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        skipToTopRef.current = true;
        setEntries(transcript(list));
        setStepNo(list.length);
        setPhase("done");
        return;
      }

      for (let s = 0; s < list.length; s += 1) {
        if (!alive()) return;
        const command = list[s].command;

        setStepNo(s + 1);
        setSelectedStep(null);
        setPhase("typing");

        for (let i = 1; i <= command.length; i += 1) {
          if (!alive()) return;
          setTyping(command.slice(0, i));
          await sleep(TYPE_MS);
        }

        if (!alive()) return;
        setEntries((prev) => [...prev, { type: "command", text: command }]);
        setTyping("");
        setPhase("output");
        await sleep(STEP_PAUSE);

        for (const block of list[s].blocks) {
          if (!alive()) return;
          setEntries((prev) => [...prev, { type: "output", block }]);
          await sleep(block.kind === "blank" ? 30 : OUTPUT_MS);
        }

        await sleep(NEXT_PAUSE);
      }

      if (alive()) setPhase("done");
    }

    play();

    return () => {
      cancelled = true;
    };
  }, [open, demoKey, playKey]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    if (skipToTopRef.current) {
      node.scrollTop = 0;
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [entries, typing, phase]);

  if (!mounted) return null;

  const total = steps?.length || 0;
  const completed = entries.filter((entry) => entry.type === "command").length;
  const activeStep = phase === "typing" && steps?.[stepNo - 1] ? steps[stepNo - 1] : null;
  const typingFraction = activeStep ? Math.min(1, Array.from(typing).length / Math.max(1, Array.from(activeStep.command).length)) : 0;
  const progress = phase === "done" ? 100 : total ? Math.round(((completed + typingFraction) / total) * 100) : 0;
  const statusText =
    phase === "loading"
      ? "Menyiapkan terminal..."
      : phase === "error"
      ? "Demo gagal dimuat"
      : phase === "done"
      ? "Selesai ❤"
      : `Langkah ${Math.min(stepNo, total)}/${total} · ${
          phase === "typing" ? "mengetik perintah" : "menunggu response"
        }`;

  const activeIndex = total ? Math.min(Math.max(stepNo, 1), total) - 1 : -1;
  const viewedIndex =
    selectedStep !== null && steps?.[selectedStep] ? selectedStep : Math.max(0, activeIndex);
  const viewedStep = steps?.[viewedIndex] || null;
  const following = selectedStep === null || selectedStep === activeIndex;

  const revealAll = () => {
    runRef.current += 1;
    skipToTopRef.current = true;
    setSelectedStep(null);
    setTyping("");
    setEntries(transcript(steps || []));
    setStepNo(steps?.length || 0);
    setPhase("done");
  };

  const replay = () => {
    runRef.current += 1;
    setPlayKey((value) => value + 1);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          style={theme?.style}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Demo terminal materi"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#120b14] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#1a111d] px-4 py-2.5">
              <div className="flex shrink-0 gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-pink-100/55">
                <span className="text-pink-300/80">terminal</span>
                <span className="mx-1.5 text-pink-200/25">—</span>
                {title}
              </p>
              <span className="hidden shrink-0 rounded-full border border-pink-300/15 bg-pink-300/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-pink-200/40 sm:block">
                demo
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup terminal"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-xs font-black text-pink-100/70 transition-colors hover:bg-white/10 hover:text-pink-50"
              >
                ✕
              </button>
            </div>

            <div className="h-1 w-full bg-white/5">
              <div
                className="h-full bg-[linear-gradient(90deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div
                ref={scrollRef}
                className="min-h-[34vh] flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:min-h-0"
              >
                <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-pink-200/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                  live terminal
                </div>

                {phase === "loading" && (
                  <div className="flex items-center gap-2 text-[12px] text-pink-200/45">
                    <span className="font-mono font-bold text-pink-400">{PROMPT}</span>
                    <span>menyiapkan demo terminal...</span>
                    <span className="mt-caret inline-block h-[0.95em] w-[0.48em] translate-y-[0.1em] bg-pink-300/90" />
                  </div>
                )}

                {phase === "error" && (
                  <div className="space-y-1">
                    <p className="font-mono text-[12px] font-bold text-rose-300">Error</p>
                    <p className="font-mono text-[12px] leading-relaxed text-pink-100/60">{error}</p>
                  </div>
                )}

                {entries.map((entry, index) =>
                  entry.type === "command" ? (
                    <CommandLine
                      key={`cmd-${index}`}
                      command={entry.text}
                      active={viewedIndex === entry.step}
                      onSelect={() => setSelectedStep(entry.step)}
                    />
                  ) : (
                    <OutputBlock key={`out-${index}`} block={entry.block} />
                  )
                )}

                {phase === "typing" && <CommandLine command={typing} caret />}
              </div>

              {viewedStep?.explain && (
                <aside
                  aria-label="Penjelasan perintah"
                  className="max-h-[30vh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#160e19] px-4 py-3 lg:min-h-0 lg:w-[19.5rem] lg:max-h-none lg:border-l lg:border-t-0"
                >
                  <BehindTheScenes
                    step={viewedStep}
                    index={viewedIndex}
                    total={total}
                    following={following}
                    onFollow={() => setSelectedStep(null)}
                  />
                </aside>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#1a111d] px-4 py-3 sm:px-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-pink-200/35">
                {statusText}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={replay}
                  disabled={phase === "loading"}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-pink-100/70 transition-colors hover:bg-white/10 hover:text-pink-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Ulangi
                </button>
                {steps && phase !== "done" && (
                  <button
                    type="button"
                    onClick={revealAll}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-pink-100/70 transition-colors hover:bg-white/10 hover:text-pink-50"
                  >
                    Lewati animasi
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-1.5 text-[10px] font-black text-[color:var(--mt-on-accent)] shadow-sm transition-transform hover:scale-105"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
