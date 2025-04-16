import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-4 right-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-black px-3 py-1 rounded shadow"
    >
      {dark ? '🌞 Claro' : '🌙 Escuro'}
    </button>
  );
}