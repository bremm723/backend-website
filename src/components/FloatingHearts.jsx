"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const symbols = ["❤️", "✨", "💕", "💖"];
    const generatedHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 15,
      delay: Math.random() * 5,
    }));
    setHearts(generatedHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-2xl opacity-50"
          style={{ left: `${heart.left}%`, bottom: "-10%" }}
          animate={{
            y: ["0vh", "-110vh"],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: heart.animationDuration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
        >
          {heart.symbol}
        </motion.div>
      ))}
    </div>
  );
}
