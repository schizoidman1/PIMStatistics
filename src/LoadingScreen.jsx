import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const isDark = document.documentElement.classList.contains('dark');
  const bgColor = isDark ? 'bg-[#0d0d0d]' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-black';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} transition-colors duration-300`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-transparent border-cyan-400 rounded-full"
      />
      <p className={`ml-4 ${textColor} text-xl font-light`}>Processando dados do PIMS...</p>
    </div>
  );
}