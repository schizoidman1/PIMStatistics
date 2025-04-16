import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

export default function LoginVolumeChart({ data }) {
  const dailyMap = {};
  data.forEach(row => {
    const date = dayjs(row.LOGIN_START).format('YYYY-MM-DD');
    if (!dailyMap[date]) dailyMap[date] = 0;
    dailyMap[date] += 1;
  });

  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const strokeColor = prefersDark ? '#7c3aed' : '#8b5cf6';
  const fillColor = prefersDark ? '#7c3aed55' : '#8b5cf655';

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-300">
      <h2 className="text-lg mb-2 text-black dark:text-white">Volume diário de logins</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dailyData}>
          <XAxis dataKey="date" stroke="#999" />
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