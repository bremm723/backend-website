"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LevelModal({ isOpen, onClose, onNextLevel }) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffb6c1', '#ff69b4', '#ff1493']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffb6c1', '#ff69b4', '#ff1493']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-pink-100"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Yeayyy Berhasil!</h2>
          <p className="text-gray-700 text-lg mb-8 font-medium">
            Selamat udah berhasil lewatin level ini! Tetep semangatt Tuan Putri Ratihhh, I love u moreeee ❤️✨
          </p>
          <button
            onClick={() => {
              onNextLevel();
              onClose();
            }}
            className="w-full py-3 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:from-pink-500 hover:to-rose-600 transition-all transform hover:scale-105"
          >
            Lanjut ke Level Berikutnya 💕
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}