"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function FinalLevelModal({ isOpen }) {
  useEffect(() => {
    if (isOpen) {
      const shoot = () => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#ffc0cb', '#ffffff']
        });
      };
      shoot();
      setTimeout(shoot, 1000);
      setTimeout(shoot, 2000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const waLink = "https://wa.me/6289522693311?text=OYYY%20NDUTTTTT%20AKU%20BERHASIL%2C%2C%2C%20MANAA%20HADIAHHH%20%20TUAN%20PUTRIIII";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-900/60 backdrop-blur-md">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center border-4 border-rose-300"
        >
          <div className="text-7xl mb-4 animate-bounce">🏆❤️</div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mb-4">
            AKHIRNYA LULUS JUGA!
          </h2>
          <p className="text-gray-700 text-lg mb-8 font-medium">
            Hebat banget Tuan Putri Ratih udah nyelesain semua level Backend-nya! 
            Sekarang waktunya nagih hadiah yang udah dijanjikan! ✨
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Claim Hadiah 🎁
          </a>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
