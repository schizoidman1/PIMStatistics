import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function DateFilter({ startDate, endDate, onChange, data }) {
  const [mesesUnicos, setMesesUnicos] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const meses = new Set();
    data.forEach(row => {
      const d = dayjs(row.LOGIN_START);
      if (d.isValid()) {
        const key = d.format('YYYY-MM');
        meses.add(key);
      }
    });

    const listaOrdenada = Array.from(meses).sort();
    setMesesUnicos(listaOrdenada);

    if (!startDate && listaOrdenada.length > 0) {
      const inicial = listaOrdenada[0];
      const inicio = dayjs(inicial + '-01').format('YYYY-MM-DD');
      const fim = dayjs(inicial + '-01').endOf('month').format('YYYY-MM-DD');
      onChange('start', inicio);
      onChange('end', fim);
    }
  }, [data]);

  const handleMesChange = (e) => {
    const [ano, mes] = e.target.value.split('-');
    const inicio = dayjs(`${ano}-${mes}-01`).format('YYYY-MM-DD');
    const fim = dayjs(`${ano}-${mes}-01`).endOf('month').format('YYYY-MM-DD');
    onChange('start', inicio);
    onChange('end', fim);
  };

  return (
    <div className="flex gap-4 mb-4">
      <div>
        <label className="block text-black dark:text-white">Selecione o mês:</label>
        <select
          onChange={handleMesChange}
          value={startDate ? dayjs(startDate).format('YYYY-MM') : ''}
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-2 rounded transition-colors duration-300"
        >
          {mesesUnicos.map(m => (
            <option key={m} value={m}>
              {dayjs(m + '-01').format('MMMM [de] YYYY')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
