import React from 'react';
import DateFilter from './DateFilter';
import TopUsersChart from './TopUsersChart';
import LoginVolumeChart from './LoginVolumeChart';
import TokenRecommendation from './TokenRecommendation';
import ThemeToggle from './ThemeToggle';
import HeatmapChart from './HeatmapChart';

export default function Dashboard({ data, dateRange, onDateChange, stats }) {
  return (
    <div className="p-8 min-h-screen bg-white text-black dark:bg-gradient-to-br dark:from-[#0d0d0d] dark:via-[#1a1a1a] dark:to-[#000000] dark:text-white transition-colors duration-300">
      <ThemeToggle />

      <h1 className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        PIMStatistics Dashboard
      </h1>

      <div className="mb-6">
        <DateFilter startDate={dateRange.start} endDate={dateRange.end} onChange={onDateChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-200 dark:bg-[#1f2937] p-6 rounded-lg shadow-md transition-colors duration-300">
          <h2 className="text-lg mb-2">🔥 Pior caso de logins simultâneos</h2>
          <p className="text-4xl font-bold text-pink-500 dark:text-pink-400">
            {isFinite(stats.worstCase) ? stats.worstCase : '—'}
          </p>
        </div>
        <div className="bg-gray-200 dark:bg-[#1f2937] p-6 rounded-lg shadow-md transition-colors duration-300">
          <h2 className="text-lg mb-2">📈 Caso médio de logins simultâneos</h2>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {isFinite(stats.averageCase) ? stats.averageCase : '—'}
          </p>
        </div>
      </div>

      <div className="mb-10">
        <TokenRecommendation peak={stats.worstCase} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopUsersChart data={data} />
        <LoginVolumeChart data={data} />
      </div>

      <div className="mt-10">
        <HeatmapChart data={data} />
      </div>
    </div>
  );
}
