import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { exportComponentAsImage } from './utils/exportAsImage';

export default function TopUsersChart({ data }) {
  const ref = useRef();
  const usageMap = {};
  data.forEach(row => {
    const duration = parseInt(row.DURATION);
    if (!isNaN(duration)) {
      if (!usageMap[row.USER]) usageMap[row.USER] = 0;
      usageMap[row.USER] += duration;
    }
  });

  const top10 = Object.entries(usageMap)
    .map(([user, total]) => ({ user, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const barColor = prefersDark ? '#ff6a00' : '#0ea5e9';

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg relative transition-colors duration-300">
      <h2 className="text-lg mb-2 text-black dark:text-white">Top 10 usuários por duração</h2>
      <div ref={ref}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="user" type="category" />
            <Tooltip
              contentStyle={{ backgroundColor: prefersDark ? '#1f2937' : '#f9fafb', border: 'none', color: prefersDark ? '#fff' : '#000' }}
              labelStyle={{ color: prefersDark ? '#fff' : '#000' }}
              cursor={{ fill: prefersDark ? '#38bdf822' : '#0ea5e922' }}
            />
            <Bar dataKey="total" fill={barColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button
        onClick={() => exportComponentAsImage(ref, 'top-users.png')}
        className="absolute top-2 right-2 text-xs px-2 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition"
      >
        Exportar 📸
      </button>
    </div>
  );
}