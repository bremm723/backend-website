"use client";
import { useState, useEffect } from "react";
import FloatingHearts from "@/components/FloatingHearts";
import LevelModal from "@/components/LevelModal";
import FinalLevelModal from "@/components/FinalLevelModal";
import { saveProgress } from "@/lib/firebaseConfig"; // Asumsi auth & user di-handle di root/context
import { motion } from "framer-motion";

import { redirect } from "next/navigation";

export default function Home() {
  // Langsung arahkan ke dashboard belajar
  redirect("/dashboard");
}

const ROADMAP = [
  { id: 1, title: "Level 1: Fundamental HTTP", desc: "Pondasi komunikasi web (GET, POST, dll)." },
  { id: 2, title: "Level 2: REST API", desc: "Membangun endpoint yang rapi dan terstruktur." },
  { id: 3, title: "Level 3: Database", desc: "Menyimpan data dengan aman ke database." },
  { id: 4, title: "Level 4: Authentication", desc: "Sistem login & keamanan JWT/Session." },
  { id: 5, title: "Level 5: Deployment", desc: "Nge-hosting API biar bisa diakses online!" },
];

export default function Dashboard() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  
  // Dummy User ID, di produksi ganti dengan auth.currentUser.uid
  const userId = "tuan_putri_ratih_uid"; 

  const handleCompleteLevel = async (levelId) => {
    if (levelId === 5) {
      setShowFinalModal(true);
      await saveProgress(userId, 5, 500); // 500 hearts collected
    } else {
      setShowLevelModal(true);
    }
  };

  const handleNextLevel = async () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    await saveProgress(userId, nextLevel, currentLevel * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-red-50 relative pb-20">
      <FloatingHearts />
      
      <div className="relative z-10 max-w-4xl mx-auto pt-16 px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-rose-600 mb-4 drop-shadow-sm">
            Selamat Belajar Backend, Tuan Putri Ratih! ❤️
          </h1>
          <p className="text-lg text-rose-800/80 font-medium">
            Selesaikan tantangannya dan klaim hadiah spesial di akhir level! ✨
          </p>
        </motion.div>

        <div className="space-y-6 relative">
          {/* Garis vertikal penghubung roadmap */}
          <div className="absolute left-8 top-10 bottom-10 w-1 bg-pink-200 rounded-full hidden md:block"></div>

          {ROADMAP.map((level, index) => {
            const isUnlocked = level.id <= currentLevel;
            const isCompleted = level.id < currentLevel;
            const isActive = level.id === currentLevel;

            return (
              <motion.div
                key={level.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center md:pl-16 p-6 rounded-3xl border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? "bg-white/80 backdrop-blur-md border-pink-300 shadow-xl" 
                    : "bg-gray-100/50 border-gray-200 opacity-70 grayscale"
                }`}
              >
                {/* Node Status (Lingkaran) */}
                <div className={`hidden md:flex absolute -left-4 w-12 h-12 rounded-full border-4 border-white items-center justify-center font-bold shadow-md z-10 ${
                  isCompleted ? "bg-green-400 text-white" : isActive ? "bg-pink-500 text-white animate-pulse" : "bg-gray-300 text-gray-500"
                }`}>
                  {isCompleted ? "✓" : level.id}
                </div>

                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? "text-pink-600" : "text-gray-500"}`}>
                    {level.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{level.desc}</p>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                      Selesai ✨
                    </span>
                  ) : isActive ? (
                    <button
                      onClick={() => handleCompleteLevel(level.id)}
                      className="px-6 py-2 bg-rose-500 text-white rounded-full font-bold shadow-md hover:bg-rose-600 hover:scale-105 transition-all"
                    >
                      Mulai Kuis 🚀
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-full font-semibold text-sm flex items-center gap-2">
                      🔒 Terkunci
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <LevelModal 
        isOpen={showLevelModal} 
        onClose={() => setShowLevelModal(false)} 
        onNextLevel={handleNextLevel} 
      />
      
      <FinalLevelModal isOpen={showFinalModal} />
    </div>
  );
}
