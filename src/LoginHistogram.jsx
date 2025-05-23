import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { getConcurrencyHistogram } from './utils/calcUtils';

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${min}m`;
  if (min) return `${min}min`;
  return `${seconds}s`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { count, duration } = payload[0].payload;
    return (
      <div style={{
        background: '#1f2937',
        color: '#fff',
        borderRadius: 6,
        padding: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <strong>{label}</strong>
        <div>Ocorrências: <b>{count}</b></div>
        <div>Total: <b>{formatDuration(duration)}</b></div>
      </div>
    );
  }
  return null;
};


export default function LoginHistogram({ data }) {
  const [binSize, setBinSize] = useState(2);

  // Histograma memoizado para performance
  
  const histogram = useMemo(
    () => getConcurrencyHistogram(data, binSize, 3), // 3 usuários por token
    [data, binSize]
  );
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const barColor = '#FF6A00'; // Ferro gusa

  // Intervalo dinâmico para labels do eixo X
  const labelInterval = histogram.length > 25 ? Math.ceil(histogram.length / 20) : 0;

  // Largura adaptativa para scroll horizontal, mínimo 500px, ou 36px por barra
  const chartWidth = Math.max(histogram.length * 50, 500);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow transition-colors duration-300 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Histograma de Concorrência de Tokens
        </h2>
        <label className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200">
          Faixa:
          <select value={binSize} onChange={e => setBinSize(Number(e.target.value))}
            className="bg-white dark:bg-gray-700 text-black dark:text-white rounded px-2 py-1 ml-1 border">
            {[2, 5, 10, 20].map(size => (
              <option value={size} key={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Scroll horizontal se houver muitas barras */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ width: chartWidth }}>
          <BarChart
            width={chartWidth}
            height={320}
            data={histogram}
            margin={{ top: 10, right: 30, left: 5, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              angle={-15}
              textAnchor="end"
              interval={labelInterval}
            />
            <YAxis />
            <Tooltip
              content={<CustomTooltip/>}
              cursor={{ fill: '#FF6A0033' }}
            />
            <Bar dataKey="count" fill={barColor} >
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
        Cada barra mostra quantas vezes um número de tokens simultâneos foi observado no período filtrado.
      </p>
    </div>
  );
}
