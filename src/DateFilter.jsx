import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';

export default function DateFilter({ startDate, endDate, onChange, data }) {
  const [minDate, maxDate] = useMemo(() => {
    if (!data || data.length === 0) return ['', ''];
    const sorted = [...data].sort((a, b) => new Date(a.LOGIN_START) - new Date(b.LOGIN_START));
    return [
      dayjs(sorted[0].LOGIN_START).format('YYYY-MM-DD'),
      dayjs(sorted[sorted.length - 1].LOGIN_START).format('YYYY-MM-DD')
    ];
  }, [data]);

  const [fixToBottom, setFixToBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const shouldStick = window.scrollY > 200;
      setFixToBottom(shouldStick);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (minDate && !startDate) onChange('start', minDate);
    if (maxDate && !endDate) onChange('end', maxDate);
  }, [minDate, maxDate, startDate, endDate, onChange]);

  return (
    <div
      className={`transition-all duration-300 ${
        fixToBottom
          ? 'fixed bottom-0 left-0 right-0 z-50 bg-gray-100 dark:bg-[#111827] shadow-inner p-4 rounded-t-lg'
          : 'mb-4'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col">
          <label className="block text-black dark:text-white mb-1">Data Início:</label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onChange('start', e.target.value)}
            min={minDate}
            max={maxDate}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded transition-colors duration-300"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-black dark:text-white mb-1">Data Fim:</label>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onChange('end', e.target.value)}
            min={minDate}
            max={maxDate}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded transition-colors duration-300"
          />
        </div>
      </div>
    </div>
  );
}
