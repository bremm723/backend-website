/**
 * Efek suara pakai Web Audio API, jadi tidak perlu file .mp3/.wav di repo.
 * Semua fungsi aman dipanggil berkali-kali dan diam total di luar browser.
 */

let audioCtx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone({ freq, start = 0, duration = 0.16, type = "sine", volume = 0.08 }) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const at = ctx.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);

  // Envelope singkat supaya tidak terdengar "cit" yang keras.
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

export const playClick = () => tone({ freq: 520, duration: 0.07, type: "triangle", volume: 0.04 });

export const playCorrect = () =>
  [
    { freq: 659.25, start: 0 },
    { freq: 783.99, start: 0.09 },
    { freq: 1046.5, start: 0.18, duration: 0.28 },
  ].forEach(tone);

export const playWrong = () =>
  [
    { freq: 311.13, start: 0, type: "triangle", duration: 0.18 },
    { freq: 233.08, start: 0.16, type: "triangle", duration: 0.3 },
  ].forEach(tone);

export const playLevelComplete = () =>
  [
    { freq: 523.25, start: 0 },
    { freq: 659.25, start: 0.1 },
    { freq: 783.99, start: 0.2 },
    { freq: 1046.5, start: 0.3, duration: 0.24 },
    { freq: 1318.51, start: 0.45, duration: 0.5 },
  ].forEach(tone);

export const playHeartBeat = () =>
  [
    { freq: 174.61, start: 0, type: "sine", duration: 0.12, volume: 0.12 },
    { freq: 174.61, start: 0.22, type: "sine", duration: 0.16, volume: 0.1 },
  ].forEach(tone);
