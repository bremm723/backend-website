"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";
import IntroScreen from "@/components/IntroScreen";
import { useAuth } from "@/context/AuthContext";

// Halaman depan = pintu gerbang: intro singkat → login / dashboard.
export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  const finishIntro = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    if (loading || showIntro) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router, showIntro]);

  if (showIntro) {
    return <IntroScreen onFinish={finishIntro} />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-pink-50 via-rose-100 to-white px-6 text-center">
      <FloatingHearts />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 text-4xl text-white shadow-2xl shadow-rose-300/60"
        >
          👑
        </motion.div>
        <h1 className="text-3xl font-extrabold text-rose-600 sm:text-4xl">nduttt.be</h1>
        <p className="mt-2 text-rose-500/80">Belajar backend bareng Tuan Putri Ratih ❤️</p>
        <p className="mt-6 text-sm font-bold text-pink-400">Membuka gerbang... ✨</p>
      </motion.div>
    </main>
  );
}
