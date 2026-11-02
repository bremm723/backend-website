"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * AnimationTriggerButton
 * ----------------------
 * Tombol neon-glow yang memicu BackendAnimationModal.
 *
 * Props:
 *   concept  – "GET_REQUEST" | "POST_REQUEST" | "MIDDLEWARE" | "DATABASE_QUERY"
 *   onClick  – fungsi yang dipanggil saat tombol diklik (biasanya membuka modal)
 *   className – tambahan className opsional
 */
export default function AnimationTriggerButton({ concept = "GET_REQUEST", onClick, className = "" }) {
  const [ripple, setRipple] = useState(false);

  // Warna aksen per konsep
  const accentMap = {
    GET_REQUEST:    { from: "#f472b6", to: "#e879f9", glow: "rgba(244,114,182,0.55)", icon: "🌐" },
    POST_REQUEST:   { from: "#fb923c", to: "#f43f5e", glow: "rgba(251,146,60,0.55)",  icon: "📤" },
    MIDDLEWARE:     { from: "#818cf8", to: "#a78bfa", glow: "rgba(129,140,248,0.55)", icon: "🔗" },
    DATABASE_QUERY: { from: "#34d399", to: "#22d3ee", glow: "rgba(52,211,153,0.55)",  icon: "🗄️" },
  };

  const accent = accentMap[concept] ?? accentMap.GET_REQUEST;

  const handleClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    onClick?.();
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Pulse ring di belakang tombol */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${accent.glow} 0%, transparent 70%)`,
          animation: "btn-pulse 2.4s ease-out infinite",
        }}
      />

      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="relative z-10 overflow-hidden rounded-2xl px-5 py-3 text-sm font-black tracking-wide text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
          boxShadow: `0 0 18px ${accent.glow}, 0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        {/* Efek kilap geser */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20"
          style={{ animation: "btn-shine 3.2s ease-in-out infinite" }}
        />

        {/* Ripple saat klik */}
        {ripple && (
          <motion.span
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0.4, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ background: "rgba(255,255,255,0.35)" }}
          />
        )}

        <span className="relative flex items-center gap-2">
          <span className="text-base">{accent.icon}</span>
          <span className="leading-tight">
            tonton animasi ini ya sayangggku{" "}
            <span className="opacity-90">cintaku tuan putrikuu</span>
          </span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-base"
          >
            ▶
          </motion.span>
        </span>
      </motion.button>

      <style>{`
        @keyframes btn-pulse {
          0%   { opacity: 0; transform: scale(0.88); }
          40%  { opacity: 0.6; }
          100% { opacity: 0; transform: scale(1.28); }
        }
        @keyframes btn-shine {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          38%  { transform: translateX(220%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}
