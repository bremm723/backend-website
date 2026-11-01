"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NarrationButton } from "@/components/NarrationModal";

export function CopyButton({ text, label = "Salin" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-bold text-pink-100/70 transition-colors hover:bg-white/20 hover:text-white"
    >
      {copied ? "Tersalin ✓" : label}
    </button>
  );
}

export function DataTable({ table }) {
  if (!table) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[color:var(--mt-border)]">
      <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[linear-gradient(135deg,var(--mt-soft),var(--mt-soft-romance))] text-[color:var(--mt-title)]">
            {table.head.map((cell) => (
              <th key={cell} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row.join("|")}-${rowIndex}`} className="border-t border-[color:var(--mt-soft)] bg-white/60 align-top even:bg-[color:var(--mt-soft-2)]">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-bold text-[color:var(--mt-title)]" : "text-[color:var(--mt-ink)]"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock({ code, title, tone = "rose" }) {
  if (!code) return null;
  const isOutput = tone === "output";
  return (
    <div className="overflow-hidden rounded-2xl shadow-inner">
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2 ${
          isOutput ? "bg-emerald-950" : "bg-[color:var(--mt-dark)]"
        }`}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
          {title || (isOutput ? "Output" : "Contoh")}
        </span>
        <CopyButton text={code} />
      </div>
      <pre
        className={`overflow-x-auto p-4 text-[0.76rem] leading-relaxed ${
          isOutput ? "bg-emerald-950/95 text-emerald-100" : "bg-[color:var(--mt-dark)] text-[color:var(--mt-soft-2)]"
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ExampleCard({ example, index }) {
  return (
    <div className="rounded-2xl border-2 border-[color:var(--mt-border)] bg-white/60 p-3.5 backdrop-blur-sm">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-to))] text-[10px] font-black text-[color:var(--mt-on-accent)]">
          {index + 1}
        </span>
        <h4 className="text-sm font-extrabold text-[color:var(--mt-title)]">{example.title}</h4>
      </div>
      <div className="space-y-2">
        <CodeBlock code={example.code} title="Contoh" />
        {example.output && <CodeBlock code={example.output} title="Hasil / response" tone="output" />}
      </div>
      {example.note && (
        <p className="mt-2.5 rounded-xl bg-[color:var(--mt-soft)] px-3 py-2 text-xs leading-relaxed text-[color:var(--mt-ink)]">
          💡 {example.note}
        </p>
      )}
    </div>
  );
}

function PracticeCard({ practice, onPractice }) {
  if (!practice) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[color:var(--mt-border-strong)] bg-[linear-gradient(135deg,var(--mt-soft),var(--mt-soft-romance),white)] p-4">
      <div className="absolute -right-6 -top-6 text-6xl opacity-10">🎯</div>
      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--mt-accent)]">Giliran Tuan Putri</p>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[color:var(--mt-ink)]">{practice.prompt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {practice.commands.map((item) => (
            <button
              key={`${item.label}-${item.command}`}
              type="button"
              onClick={() => onPractice(item.command)}
              className="group inline-flex items-center gap-2 rounded-xl border border-[color:var(--mt-border)] bg-white px-3 py-2 text-left text-xs font-bold text-[color:var(--mt-title)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--mt-border-strong)] hover:bg-[color:var(--mt-soft)]"
            >
              <span className="font-mono text-[10px] opacity-60 group-hover:opacity-100">▶</span>
              {item.label}
            </button>
          ))}
        </div>
        {practice.hint && <p className="mt-2.5 text-xs leading-relaxed text-[color:var(--mt-muted)]">🔎 {practice.hint}</p>}
        <p className="mt-2 text-[10px] font-semibold text-[color:var(--mt-muted)]">
          Perintah akan masuk ke terminal lab. Tekan Enter di sana untuk menjalankannya.
        </p>
      </div>
    </div>
  );
}

export function Section({ section, index, isOpen, onToggle, onPractice, onWatch }) {
  return (
    <div className="mt-glass overflow-hidden rounded-3xl border-2 border-[color:var(--mt-border)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[color:var(--mt-soft-2)]"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-to))] text-xs font-black text-[color:var(--mt-on-accent)]">
          {index + 1}
        </span>
        <span className="flex-1 text-base font-bold text-[color:var(--mt-title)]">{section.title}</span>
        <span className="hidden rounded-full bg-[color:var(--mt-soft)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[color:var(--mt-accent)] sm:block">
          {section.practice ? "ada latihan" : "materi"}
        </span>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="text-[color:var(--mt-accent)]">
          ›
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="space-y-4 border-t border-[color:var(--mt-soft)] px-5 pb-5 pt-4">
              {onWatch && (
                <div className="flex">
                  <NarrationButton onClick={onWatch} className="w-full sm:w-auto" />
                </div>
              )}

              {section.body && (
                <ul className="space-y-2.5">
                  {section.body.map((line, i) => (
                    <li key={i} className="flex gap-2 text-[0.94rem] leading-relaxed text-[color:var(--mt-ink)]">
                      <span className="mt-1 shrink-0 text-[color:var(--mt-romance)]">❤</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.steps && (
                <div className="rounded-2xl border border-[color:var(--mt-border)] bg-[color:var(--mt-soft-2)] p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--mt-accent)]">Alurnya</p>
                  <ol className="space-y-2">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[color:var(--mt-ink)]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[9px] font-black text-[color:var(--mt-accent)] shadow-sm">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <DataTable table={section.table} />

              {section.examples?.map((example, i) => (
                <ExampleCard key={`${example.title}-${i}`} example={example} index={i} />
              ))}

              {section.code && <CodeBlock code={section.code} title="Kode" />}

              {section.analogy && (
                <p className="rounded-2xl border-l-4 border-[color:var(--mt-romance)] bg-[color:var(--mt-soft-romance)] px-4 py-3 text-sm italic text-[color:var(--mt-title)]">
                  🍱 Versi santai: {section.analogy}
                </p>
              )}

              {section.tip && (
                <p className="rounded-2xl border-l-4 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
                  ✨ <span className="font-bold">Catatan:</span> {section.tip}
                </p>
              )}

              {section.warning && (
                <p className="rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                  ⚠️ <span className="font-bold">Hati-hati:</span> {section.warning}
                </p>
              )}

              <PracticeCard practice={section.practice} onPractice={onPractice} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
