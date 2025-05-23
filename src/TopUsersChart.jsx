import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { exportComponentAsImage } from './utils/exportAsImage';

function formatDurationDaysHours(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}

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
  const barColor = '#ff6a00';

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg relative transition-colors duration-300">
      <h2 className="text-lg mb-2 text-black dark:text-white">Top 10 usuários por duração</h2>
      <div ref={ref}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10} layout="vertical">
            <XAxis
              type="number"
              tickFormatter={formatDurationDaysHours}
              domain={[0, (dataMax) => Math.max(dataMax, 60)]}
            />
            <YAxis dataKey="user" type="category" />
            <Tooltip
              contentStyle={{
                backgroundColor: prefersDark ? '#1f2937' : '#f9fafb',
                border: 'none',
                color: prefersDark ? '#fff' : '#000'
              }}
              labelStyle={{ color: prefersDark ? '#fff' : '#000' }}
              formatter={(value) => formatDurationDaysHours(value)}
              cursor={{ fill: prefersDark ? '#ff6a0022' : '#ff6a0022' }}
            />
            <Bar dataKey="total" fill={barColor}>
              <LabelList
                dataKey="total"
                position="right"
                content={({ value }) => (
                  <span className="text-xs font-bold">{formatDurationDaysHours(value)}</span>
                )}
              />
            </Bar>
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
