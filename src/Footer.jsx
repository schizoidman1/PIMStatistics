import React from 'react';
import logo from './assets/logo.png'; // Substitua com o caminho da sua logo real

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-300 dark:border-gray-700 py-6 px-4 flex flex-col md:flex-row items-center justify-between bg-gray-100 dark:bg-[#0f0f0f] text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <img src={logo} alt="ArcelorMittal Logo" className="h-8 w-auto" />
        <span className="font-semibold">PIMStatistics</span>
      </div>
      <div>
        © {new Date().getFullYear()} AmbVsh LLC. Todos os direitos reservados.
      </div>
    </footer>
  );
}
