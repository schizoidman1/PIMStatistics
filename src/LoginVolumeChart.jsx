import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

export default function LoginVolumeChart({ data }) {
  const [granularity, setGranularity] = useState('month'); // 'month' | 'day'

  const groupedMap = {};
  data.forEach(row => {
    const date = dayjs(row.LOGIN_START || row['START DATE']);
    if (!date.isValid()) return;

    const key = granularity === 'month'
      ? date.format('MMM YYYY')
      : date.format('YYYY-MM-DD');

    if (!groupedMap[key]) groupedMap[key] = 0;
    groupedMap[key] += 1;
  });

  const groupedData = Object.entries(groupedMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => dayjs(a.label).unix() - dayjs(b.label).unix());

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const strokeColor = prefersDark ? '#ff6a00' : '#ff6a00';
  const fillColor = prefersDark ? '#ff6a0080' : '#ff6a0080';

  const handleWheel = (e) => {
    if (e.deltaY < 0 && granularity === 'month') {
      setGranularity('day');
    } else if (e.deltaY > 0 && granularity === 'day') {
      setGranularity('month');
    }
  };

  return (
    <div 
      className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-300"
      onWheel={handleWheel}
    >
      <h2 className="text-lg mb-2 text-black dark:text-white">
        📊 Volume de logins por {granularity === 'month' ? 'mês' : 'dia'}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#999" angle={-45} textAnchor="end" height={60} />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{ backgroundColor: prefersDark ? '#1f2937' : '#f9fafb', border: 'none', color: prefersDark ? '#fff' : '#000' }}
            labelStyle={{ color: prefersDark ? '#fff' : '#000' }}
            cursor={{ fill: prefersDark ? '#7c3aed22' : '#8b5cf622' }}
          />
          <Area type="monotone" dataKey="count" stroke={strokeColor} fill={fillColor} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
