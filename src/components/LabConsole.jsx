"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createLabState, runLabCommand } from "@/lib/labEngine";
import { addLabProgress, getLabProgress } from "@/lib/firebaseConfig";
import { playClick, playCorrect } from "@/lib/sound";

const LAB_PROGRESS_EVENT = "nduttt-lab-progress";

function readStoredProgress(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredProgress(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage bisa diblokir browser; progres akun tetap jalan. */
  }
}

const STATUS_STYLE = (status) => {
  if (status >= 500) return "bg-rose-500/25 text-rose-200 border-rose-400/30";
  if (status >= 400) return "bg-amber-500/20 text-amber-200 border-amber-400/30";
  if (status >= 300) return "bg-sky-500/20 text-sky-200 border-sky-400/30";
  return "bg-emerald-500/20 text-emerald-200 border-emerald-400/30";
};

const METHOD_STYLE = (method) => {
  switch (method) {
    case "GET":
      return "text-sky-300";
    case "POST":
      return "text-emerald-300";
    case "PATCH":
    case "PUT":
      return "text-amber-300";
    case "DELETE":
      return "text-rose-300";
    default:
      return "text-pink-300";
  }
};

function HttpCard({ line }) {
  const body =
    line.body === null || line.body === undefined
      ? "tanpa body"
      : typeof line.body === "string"
      ? line.body
      : JSON.stringify(line.body, null, 2);

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-white/10 bg-black/25">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/10 px-3 py-2">
        <span className={`font-mono text-[11px] font-black ${METHOD_STYLE(line.method)}`}>
          {line.method}
        </span>
        <span className="break-all font-mono text-[11px] text-pink-100/70">{line.path}</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-black ${STATUS_STYLE(line.status)}`}>
            {line.status} {line.statusText}
          </span>
          <span className="font-mono text-[10px] text-pink-200/35">{line.ms} ms</span>
        </div>
        {line.headers?.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {line.headers.map(([key, value]) => (
              <p key={key} className="break-all font-mono text-[10px] text-pink-200/40">
                {key}: <span className="text-pink-200/60">{value}</span>
              </p>
            ))}
          </div>
        )}
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/25 p-2.5 font-mono text-[11px] leading-relaxed text-pink-100/85">
          {body}
        </pre>
      </div>
    </div>
  );
}

function OutputLine({ line }) {
  switch (line.kind) {
    case "http":
      return <HttpCard line={line} />;
    case "success":
      return <p className="whitespace-pre-wrap break-words text-emerald-300">{line.text}</p>;
    case "error":
      return <p className="whitespace-pre-wrap break-words text-rose-300">{line.text}</p>;
    case "warn":
      return <p className="whitespace-pre-wrap break-words text-amber-300">{line.text}</p>;
    case "info":
      return <p className="whitespace-pre-wrap break-words text-sky-300">{line.text}</p>;
    case "muted":
      return <p className="whitespace-pre-wrap break-words text-pink-200/40">{line.text}</p>;
    case "code":
    case "table":
      return (
        <pre className="my-1 max-h-96 overflow-auto whitespace-pre rounded-lg border border-white/5 bg-black/20 p-2.5 font-mono text-[10.5px] leading-relaxed text-pink-100/80">
          {line.text}
        </pre>
      );
    default:
      return <p className="whitespace-pre-wrap break-words text-pink-100/80">{line.text}</p>;
  }
}

function CommandEcho({ text }) {
  return (
    <div className="mt-3 flex items-start gap-1.5 first:mt-0">
      <span className="shrink-0 font-mono text-[11px] font-bold text-pink-400">ratih@nduttt</span>
      <span className="shrink-0 font-mono text-[11px] text-pink-200/35">:~$</span>
      <span className="break-all font-mono text-[11px] font-semibold text-pink-50">{text}</span>
    </div>
  );
}

export default function LabConsole({
  lab,
  topicId,
  userKey = "guest",
  pendingCommand = null,
  onRequestClose = null,
  className = "",
}) {
  const engine = lab?.engine || "http";
  const missions = useMemo(() => lab?.missions || [], [lab]);
  const storageKey = `nduttt-lab:${userKey}:${topicId}`;

  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = createLabState(engine);

  const welcomeEntries = useMemo(
    () =>
      (lab?.welcome || []).map((text) => ({
        kind: "muted",
        text,
      })),
    [lab]
  );

  const [entries, setEntries] = useState(welcomeEntries);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [syncState, setSyncState] = useState(userKey === "guest" ? "local" : "loading");
  const completedRef = useRef([]);
  const lastPendingRef = useRef(null);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const local = readStoredProgress(storageKey);
    completedRef.current = local;
    setCompleted(local);
    setSyncState(userKey === "guest" ? "local" : "loading");

    if (!userKey || userKey === "guest") {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const remoteMap = await getLabProgress(userKey);
        if (cancelled) return;

        const remote = Array.isArray(remoteMap?.[topicId])
          ? remoteMap[topicId].filter((id) => typeof id === "string")
          : [];

        // Ambil gabungan lokal + akun. `completedRef` dibaca lagi di sini
        // supaya misi yang selesai saat request berjalan tidak tertimpa.
        const current = completedRef.current;
        const merged = [...new Set([...current, ...remote])];
        completedRef.current = merged;
        setCompleted(merged);
        writeStoredProgress(storageKey, merged);

        // Progres dari versi lama (localStorage saja) ikut diunggah ke akun.
        const localOnly = current.filter((id) => !remote.includes(id));
        if (localOnly.length) await addLabProgress(userKey, topicId, localOnly);

        if (!cancelled) setSyncState("synced");
      } catch (error) {
        if (!cancelled) {
          console.warn("Gagal menyinkronkan progres lab:", error);
          setSyncState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey, userKey, topicId]);

  // Dua instance lab (desktop + mobile) berbagi progres yang sama.
  useEffect(() => {
    const onProgress = (event) => {
      const detail = event.detail;
      if (!detail || detail.userKey !== userKey || detail.topicId !== topicId) return;
      if (!Array.isArray(detail.completed)) return;

      const merged = [...new Set([...completedRef.current, ...detail.completed])];
      if (merged.length === completedRef.current.length) return;
      completedRef.current = merged;
      setCompleted(merged);
      writeStoredProgress(storageKey, merged);
    };

    window.addEventListener(LAB_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(LAB_PROGRESS_EVENT, onProgress);
  }, [storageKey, topicId, userKey]);

  // Tab lain di browser yang sama juga langsung ikut sinkron.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== storageKey) return;
      const incoming = readStoredProgress(storageKey);
      const merged = [...new Set([...completedRef.current, ...incoming])];
      if (merged.length === completedRef.current.length) return;
      completedRef.current = merged;
      setCompleted(merged);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(() => {
    if (!pendingCommand || pendingCommand.id === lastPendingRef.current) return;
    lastPendingRef.current = pendingCommand.id;
    setInput(pendingCommand.command);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [pendingCommand]);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [entries, busy]);

  const saveCompleted = (next) => {
    const unique = [...new Set(next)];
    completedRef.current = unique;
    setCompleted(unique);
    writeStoredProgress(storageKey, unique);

    window.dispatchEvent(
      new CustomEvent(LAB_PROGRESS_EVENT, {
        detail: { userKey, topicId, completed: unique },
      })
    );
  };

  const handleEvents = (events = []) => {
    if (!missions.length || !events.length) return;
    const done = new Set(completedRef.current);
    const newlyDone = missions.filter((mission) => events.includes(mission.event) && !done.has(mission.id));
    if (!newlyDone.length) return;

    const next = [...completedRef.current, ...newlyDone.map((mission) => mission.id)];
    saveCompleted(next);

    if (userKey !== "guest") {
      setSyncState("saving");
      addLabProgress(
        userKey,
        topicId,
        newlyDone.map((mission) => mission.id)
      )
        .then(() => setSyncState("synced"))
        .catch((error) => {
          console.warn("Gagal menyimpan progres lab ke akun:", error);
          setSyncState("error");
        });
    }

    playCorrect();
    setEntries((prev) => [
      ...prev,
      ...newlyDone.map((mission) => ({
        kind: "success",
        text: `🎯 Misi selesai: ${mission.label}`,
      })),
      ...(next.length === missions.length
        ? [
            {
              kind: "success",
              text: "👑 Semua misi lab ini tuntas! Materi ini sudah kamu praktikkan sendiri.",
            },
          ]
        : []),
    ]);
  };

  const execute = async (rawCommand) => {
    const command = String(rawCommand || "").trim();
    if (!command || busy) return;
    playClick();
    setBusy(true);
    setInput("");
    setHistory((prev) => [command, ...prev].slice(0, 40));
    setHistoryIndex(-1);
    setEntries((prev) => [...prev, { kind: "command", text: command }]);

    try {
      const result = await runLabCommand(engine, command, stateRef.current);
      if (result?.clear) {
        setEntries([]);
      } else if (result?.lines?.length) {
        setEntries((prev) => [...prev, ...result.lines]);
      }
      handleEvents(result?.events);
    } catch (error) {
      setEntries((prev) => [
        ...prev,
        { kind: "error", text: `Lab error: ${error?.message || "tidak diketahui"}` },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const submit = (event) => {
    event.preventDefault();
    execute(input);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (event.key === "Tab" && lab?.quickCommands?.length) {
      event.preventDefault();
      const suggestion = lab.quickCommands.find((item) =>
        item.command.toLowerCase().startsWith(input.toLowerCase())
      );
      if (suggestion) setInput(suggestion.command);
    }
  };

  const resetLab = () => {
    playClick();
    stateRef.current = createLabState(engine);
    setEntries(welcomeEntries);
    setInput("");
    setHistoryIndex(-1);
    inputRef.current?.focus();
  };

  const doneCount = completed.length;
  const progress = missions.length ? Math.round((doneCount / missions.length) * 100) : 0;
  const nextMission = missions.find((mission) => !completed.includes(mission.id));
  const syncLabel =
    userKey === "guest" || syncState === "local"
      ? "progres hanya di browser ini"
      : syncState === "loading"
      ? "memuat progres akun..."
      : syncState === "saving"
      ? "menyimpan ke akun..."
      : syncState === "error"
      ? "progres lokal · sinkron akun gagal"
      : "progres tersimpan di akun";

  return (
    <div
      className={`flex h-full min-h-[30rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[color:var(--mt-dark)] shadow-2xl shadow-black/30 ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-2 min-w-0 flex-1">
          <p className="truncate font-mono text-[11px] font-bold text-[color:var(--mt-soft)]">
            {lab?.title || "Lab Terminal"} <span className="text-white/30">· lab.nduttt.be</span>
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[color:var(--mt-soft)]">
          Simulasi
        </span>
        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            className="ml-1 grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-pink-200/60 transition-colors hover:bg-white/10 hover:text-pink-100"
            aria-label="Tutup terminal"
          >
            ✕
          </button>
        )}
      </div>

      {missions.length > 0 && (
        <div className="border-b border-white/10 bg-white/[0.035] px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-300/60">
              Misi {doneCount}/{missions.length}
            </p>
            <p className="truncate text-[10px] font-semibold text-pink-200/45">
              {nextMission ? `Berikutnya: ${nextMission.label}` : "Semua misi selesai 👑"}
            </p>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))]"
            />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {missions.map((mission) => {
              const done = completed.includes(mission.id);
              return (
                <span
                  key={mission.id}
                  title={mission.label}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    done
                      ? "bg-emerald-400/15 text-emerald-300/90"
                      : "bg-white/5 text-pink-200/35"
                  }`}
                >
                  {done ? "✓" : "○"} {mission.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div
        ref={outputRef}
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed"
      >
        <div className="mb-2 rounded-lg border border-pink-300/10 bg-pink-300/5 px-3 py-2 text-[10px] leading-relaxed text-pink-200/50">
          {lab?.subtitle} Ketik <span className="font-bold text-pink-200/80">help</span> untuk daftar perintah.
        </div>
        {entries.map((entry, index) =>
          entry.kind === "command" ? (
            <CommandEcho key={`cmd-${index}`} text={entry.text} />
          ) : (
            <OutputLine key={`line-${index}`} line={entry} />
          )
        )}
        {busy && (
          <p className="flex items-center gap-2 text-pink-200/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400" />
            memproses...
          </p>
        )}
      </div>

      {lab?.quickCommands?.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-t border-white/10 px-3 py-2">
          {lab.quickCommands.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setInput(item.command);
                inputRef.current?.focus();
              }}
              className="shrink-0 rounded-full border border-pink-300/15 bg-pink-300/5 px-2.5 py-1 text-[9.5px] font-bold text-pink-200/60 transition-colors hover:bg-pink-300/10 hover:text-pink-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="border-t border-white/10 bg-black/20 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] font-bold text-pink-400">ratih@nduttt:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Ketik perintah... (help)"
            aria-label="Perintah terminal lab"
            className="min-w-0 flex-1 bg-transparent font-mono text-[11.5px] text-pink-50 outline-none placeholder:text-pink-200/25 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-lg bg-[linear-gradient(135deg,var(--mt-grad-from),var(--mt-grad-via),var(--mt-grad-to))] px-2.5 py-1 text-[10px] font-black text-[color:var(--mt-on-accent)] shadow-sm transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ↵
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-[9px] text-pink-200/25">↑↓ riwayat · Tab melengkapi · {syncLabel}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              resetLab();
            }}
            className="shrink-0 text-[9px] font-bold text-pink-200/35 underline decoration-dotted hover:text-pink-200/70"
          >
            reset data
          </button>
        </div>
      </form>
    </div>
  );
}
