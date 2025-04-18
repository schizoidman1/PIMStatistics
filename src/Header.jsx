import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';

export default function Header() {
  return (
    <header className="bg-white dark:bg-[#111827] shadow-md py-4 px-6 flex justify-between items-center transition-colors duration-300 sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="Logo PIMStatistics"
          className="w-40 h-20"
        />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PIMStatistics</h1>
      </div>
      <nav>
      </nav>
    </header>
  );
}
