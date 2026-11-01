"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const BUTTON_LABEL = "Tuan Putri, Tonton ini ya sayangg!!";

export function NarrationButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-2xl border-2 border-[color:var(--mt-border-strong)] bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-4 py-2.5 text-left text-[11px] font-extrabold leading-tight text-[color:var(--mt-on-accent)] shadow-[0_14px_30px_-18px_var(--mt-shadow)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-105 ${className}`}
    >
      <span className="text-base transition-transform group-hover:-rotate-6 group-hover:scale-110">🎬</span>
      <span>{BUTTON_LABEL}</span>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/25 text-[8px]">
        ▶
      </span>
    </button>
  );
}

export default function NarrationModal({ open, onClose, title, script, theme }) {
  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState("");
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const skipToTopRef = useRef(false);
  const totalChars = Array.from(script || "").length;
  const progress = totalChars ? Math.min(100, Math.round((Array.from(typed).length / totalChars) * 100)) : 0;
  const done = Array.from(typed).length >= totalChars;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setTyped("");
      return undefined;
    }

    const characters = Array.from(script || "");
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setTyped(characters.join(""));
      return undefined;
    }

    setTyped("");
    skipToTopRef.current = false;
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(index + 3, characters.length);
      setTyped(characters.slice(0, index).join(""));
      if (index >= characters.length) {
        window.clearInterval(timer);
        timerRef.current = null;
      }
    }, 22);
    timerRef.current = timer;

    return () => {
      window.clearInterval(timer);
      timerRef.current = null;
    };
  }, [open, script]);

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
      skipToTopRef.current = false;
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [typed]);

  if (!mounted) return null;

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
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Tonton penjelasan materi"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="mt-story relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border-2 border-[color:var(--mt-border)] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.55)]"
          >
            <div className="h-1.5 w-full bg-[color:var(--mt-soft)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-7">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--mt-accent)]">
                  Tonton Bareng Tuan Putri
                </p>
                <h3 className="mt-1 text-lg font-extrabold leading-snug text-[color:var(--mt-title)] sm:text-xl">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup tontonan"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--mt-border)] bg-white/60 text-sm font-black text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="min-h-[12rem] flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-7"
            >
              <p className="whitespace-pre-wrap text-[0.95rem] leading-[1.8] text-[color:var(--mt-ink)] sm:text-base">
                {typed}
                {!done && (
                  <span className="mt-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] rounded-full bg-[color:var(--mt-accent)]" />
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--mt-border)] bg-white/35 px-5 py-3.5 sm:px-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--mt-muted)]">
                {done ? "Selesai ❤" : `Mengetik... ${progress}%`}
              </p>
              <div className="flex items-center gap-2">
                {!done && (
                  <button
                    type="button"
                    onClick={() => {
                      if (timerRef.current) {
                        window.clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      skipToTopRef.current = true;
                      setTyped(script || "");
                    }}
                    className="rounded-full border border-[color:var(--mt-border)] bg-white px-3 py-1.5 text-[10px] font-bold text-[color:var(--mt-title)] transition-colors hover:bg-[color:var(--mt-soft)]"
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
    document.body,
  );
}
