"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Backsound per keluarga tema.
 * Kalau kamu punya file lagu sendiri, taruh di public/audio/<nama>.mp3
 * (bumblebee.mp3, optimus.mp3, avenged.mp3, gaga.mp3, taksaka.mp3) — otomatis dipakai.
 * Kalau tidak ada, diputar instrumental lembut yang dibuat langsung di browser
 * (Web Audio API), jadi tetap ringan dan tanpa file besar.
 */
const TRACKS = {
  bumblebee: "/audio/bumblebee.mp3",
  optimus: "/audio/optimus.mp3",
  avenged: "/audio/avenged.mp3",
  gaga: "/audio/gaga.mp3",
  taksaka: "/audio/taksaka.mp3",
};

const PRESETS = {
  bumblebee: {
    bpm: 92,
    root: 261.63,
    wave: "triangle",
    notes: [0, 4, 7, 11, 9, 7, 4, 2],
    cutoff: 2200,
    volume: 0.08,
    space: null,
  },
  optimus: {
    bpm: 66,
    root: 130.81,
    wave: "sawtooth",
    notes: [0, 7, 12, 15, 12, 7, 3, 7],
    cutoff: 900,
    volume: 0.07,
    fifth: true,
    space: { delay: 0.42, feedback: 0.2, mix: 0.2 },
  },
  avenged: {
    bpm: 74,
    root: 146.83,
    wave: "sawtooth",
    notes: [0, 0, 3, 5, 3, 0, -2, 0],
    cutoff: 760,
    volume: 0.07,
    fifth: true,
    space: { delay: 0.36, feedback: 0.18, mix: 0.18 },
  },
  gaga: {
    bpm: 72,
    root: 261.63,
    wave: "triangle",
    notes: [0, 4, 7, 12, 11, 9, 7, 4],
    cutoff: 2600,
    volume: 0.08,
    space: { delay: 0.34, feedback: 0.28, mix: 0.38 },
  },
  taksaka: {
    bpm: 88,
    root: 196.0,
    wave: "triangle",
    notes: [0, 7, 12, 7, 5, 7, 3, 0],
    cutoff: 1700,
    volume: 0.075,
    space: { delay: 0.4, feedback: 0.22, mix: 0.26 },
  },
};

function createSynth(family) {
  const P = PRESETS[family] || PRESETS.bumblebee;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { stop() {} };

  const ctx = new Ctx();
  ctx.resume?.().catch(() => {});
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(P.volume, ctx.currentTime + 1.4);
  master.connect(ctx.destination);

  let wet = null;
  if (P.space) {
    const delay = ctx.createDelay(1);
    delay.delayTime.value = P.space.delay;
    const feedback = ctx.createGain();
    feedback.gain.value = P.space.feedback;
    const send = ctx.createGain();
    send.gain.value = P.space.mix;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(send);
    send.connect(master);
    wet = delay;
  }

  const stepDur = 60 / P.bpm / 2;

  function voice(freq, time, dur, level, type, cutoff) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    if (wet) gain.connect(wet);
    osc.start(time);
    osc.stop(time + dur + 0.06);
  }

  let step = 0;
  let next = ctx.currentTime + 0.2;

  const playStep = (i, time) => {
    const semi = P.notes[i % P.notes.length];
    const freq = P.root * Math.pow(2, semi / 12);
    voice(freq, time, stepDur * 1.5, 0.32, P.wave, P.cutoff);
    if (P.fifth) voice(freq * 1.5, time, stepDur * 1.2, 0.14, "sawtooth", P.cutoff * 0.8);
    if (i % P.notes.length === 0) voice(P.root / 2, time, stepDur * P.notes.length * 0.85, 0.2, "sine", 420);
  };

  const tick = () => {
    while (next < ctx.currentTime + 0.6) {
      playStep(step, next);
      next += stepDur;
      step += 1;
    }
  };

  tick();
  const timer = window.setInterval(tick, 180);

  return {
    stop() {
      window.clearInterval(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      window.setTimeout(() => {
        ctx.close().catch(() => {});
      }, 700);
    },
  };
}

export default function ThemeAudio({ theme }) {
  const [on, setOn] = useState(false);
  const engine = useRef(null);
  const familyRef = useRef(theme?.family);
  const onRef = useRef(false);
  const startRef = useRef(null);

  const stop = () => {
    if (engine.current) {
      engine.current.stop();
      engine.current = null;
    }
    setOn(false);
  };

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    if (familyRef.current === theme?.family) return;
    familyRef.current = theme?.family;
    if (!onRef.current) return;
    if (engine.current) {
      engine.current.stop();
      engine.current = null;
    }
    setOn(false);
    startRef.current?.();
  }, [theme?.family]);

  useEffect(
    () => () => {
      if (engine.current) engine.current.stop();
      engine.current = null;
    },
    [],
  );

  const start = async () => {
    const family = theme?.family || "bumblebee";
    const url = TRACKS[family] || TRACKS.bumblebee;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.28;
        await audio.play();
        engine.current = {
          stop() {
            audio.pause();
            audio.currentTime = 0;
          },
        };
        setOn(true);
        return;
      }
    } catch {
      // File belum tersedia — lanjut ke instrumental bawaan.
    }
    engine.current = createSynth(family);
    setOn(true);
  };

  startRef.current = start;

  const toggle = () => {
    if (on) stop();
    else start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Matikan backsound" : "Nyalakan backsound"}
      style={theme?.style}
      className="group fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-[color:var(--mt-border-strong)] bg-white/55 px-3 py-2 text-[11px] font-bold text-[color:var(--mt-title)] shadow-[0_12px_34px_-16px_var(--mt-shadow)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/80 sm:bottom-6 sm:left-6"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--mt-soft)] text-[11px]">
        {on ? "🔊" : "🎵"}
      </span>
      <span className="flex flex-col items-start leading-none">
        <span>Backsound</span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide opacity-60">
          {on ? "menyala" : "mati"}
        </span>
      </span>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-[color:var(--mt-accent)]"
            style={{
              height: "100%",
              transformOrigin: "bottom",
              animation: on ? `mt-eq 0.9s ${i * 0.15}s ease-in-out infinite` : "none",
              transform: on ? undefined : "scaleY(0.35)",
            }}
          />
        ))}
      </span>
    </button>
  );
}
