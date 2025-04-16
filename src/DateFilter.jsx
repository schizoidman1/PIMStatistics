import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function DateFilter({ startDate, endDate, onChange, data }) {
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    if (!data || data.length === 0) return;

    const sorted = [...data].sort((a, b) => new Date(a.LOGIN_START) - new Date(b.LOGIN_START));
    const min = dayjs(sorted[0].LOGIN_START).format('YYYY-MM-DD');
    const max = dayjs(sorted[sorted.length - 1].LOGIN_START).format('YYYY-MM-DD');
    setMinDate(min);
    setMaxDate(max);

    // Preencher automaticamente se valores iniciais forem vazios
    if (!startDate) onChange('start', min);
    if (!endDate) onChange('end', max);
  }, [data]);

  return (
    <div className="flex gap-4 mb-4">
      <div>
        <label className="block text-black dark:text-white">Data Início:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange('start', e.target.value)}
          min={minDate}
          max={maxDate}
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded transition-colors duration-300"
        />
      </div>
      <div>
        <label className="block text-black dark:text-white">Data Fim:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange('end', e.target.value)}
          min={minDate}
          max={maxDate}
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded transition-colors duration-300"
        />
      </div>
    </div>
  );
}