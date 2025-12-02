"use client";

import { motion } from "motion/react";
import CreativeButton from "@/components/CreativeButton";
import { Pinyon_Script } from "next/font/google";
import { useState, useEffect } from "react";

const pinyon = Pinyon_Script({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
});

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden p-6">
      
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/2 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="text-[8rem] md:text-[12rem] font-light leading-none tracking-tighter text-white/5 font-mono select-none">
          404
        </h1>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`${pinyon.className} text-4xl md:text-6xl text-white/90`}
          >
            Lost in the Void
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CreativeButton className="absolute top-5" href="/" icon="left">
            Return Home
          </CreativeButton>
        </motion.div>

      </motion.div>
    </div>
  );
}
