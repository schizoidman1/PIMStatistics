// ============================
// HeatmapChart.jsx (com dropdown de agrupamento dinâmico)
// ============================
import React, { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

const horas = Array.from({ length: 24 }, (_, i) => `${i}h`);

function agruparDados(data, mode) {
  const mapa = {};
  data.forEach(row => {
    const dt = dayjs(row.LOGIN_START);
    const hora = dt.hour();

    let grupo;
    if (mode === 'semana') grupo = dt.format('dd'); // ex: 'Seg', 'Ter'
    else if (mode === 'mes') grupo = dt.date(); // 1 a 31
    else if (mode === 'ano') grupo = dt.format('MMM'); // Jan, Feb, etc
    else grupo = 'Outro';

    const key = `${grupo}_${hora}`;
    mapa[key] = (mapa[key] || 0) + 1;
  });

  const linhas = Array.from(new Set(Object.keys(mapa).map(k => k.split('_')[0])));
  const heatmap = linhas.map(label => {
    const linha = { label };
    for (let h = 0; h < 24; h++) {
      const key = `${label}_${h}`;
      linha[h] = mapa[key] || 0;
    }
    return linha;
  });

  return { heatmap, linhas };
}

export default function HeatmapChart({ data }) {
  const [agrupamento, setAgrupamento] = useState('semana');
  const isDark = document.documentElement.classList.contains('dark');
  const baseColor = '255,106,0'; // Laranja gusa
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.6)';
  const textColor = isDark ? 'white' : 'black';

  const { heatmap, linhas } = agruparDados(data, agrupamento);

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg text-${textColor}`}>🗓️ Heatmap de logins por {agrupamento}</h2>
        <select
          value={agrupamento}
          onChange={(e) => setAgrupamento(e.target.value)}
          className="bg-white dark:bg-gray-700 text-black dark:text-white border px-2 py-1 rounded"
        >
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
          <option value="ano">Ano</option>
        </select>
      </div>

      <div className="inline-grid" style={{ gridTemplateColumns: `80px repeat(24, 32px)` }}>
        <div></div>
        {horas.map(h => (
          <div key={h} className={`text-xs text-center text-${textColor}`}>{h}</div>
        ))}

        {heatmap.map((linha, i) => (
          <React.Fragment key={i}>
            <div className={`text-xs text-${textColor}`}>{linha.label}</div>
            {horas.map((_, h) => (
              <div
                key={h}
                className="w-8 h-8 rounded-sm"
                title={`Logins: ${linha[h]}`}
                style={{
                  backgroundColor: `rgba(${baseColor}, ${Math.min(linha[h] / 10, 1)})`,
                  border: `1px solid ${borderColor}`
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}