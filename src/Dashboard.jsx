import React, { useEffect, useState } from 'react';
import DateFilter from './DateFilter';
import TopUsersChart from './TopUsersChart';
import LoginVolumeChart from './LoginVolumeChart';
import TokenRecommendation from './TokenRecommendation';
import ThemeToggle from './ThemeToggle';
import HeatmapChart from './HeatmapChart';
import { useData } from './context/DataContext';
import { filterByDate, calcStatsChunked } from './utils/calcUtils';
import { motion } from 'framer-motion';

export default function Dashboard({ data, dateRange, onDateChange, stats }) {
  const { rawData, setFilteredData, setStats } = useData();
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (rawData.length && dateRange.start && dateRange.end) {
      const filtered = filterByDate(rawData, dateRange.start, dateRange.end);
      setFilteredData(filtered);
      setLoadingStats(true);
      calcStatsChunked(filtered).then((stats) => {
        setStats(stats);
        setLoadingStats(false);
      });
    }
  }, [rawData, dateRange]);

  return (
    <div className="p-8 text-white min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#000000]">
      <h1 className="text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">PIMStatistics Dashboard</h1>

      <div className="mb-6">
        <DateFilter startDate={dateRange.start} endDate={dateRange.end} onChange={onDateChange} data={rawData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1f2937] p-6 rounded-lg shadow-md relative">
          <h2 className="text-lg mb-2">🔥 Pior caso de logins simultâneos</h2>
          {loadingStats ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-4 border-t-transparent border-pink-400 rounded-full mx-auto"
            />
          ) : (
            <p className="text-4xl font-bold text-pink-400">
              {isFinite(stats.worstCase) ? stats.worstCase : '—'}
            </p>
          )}
        </div>
        <div className="bg-[#1f2937] p-6 rounded-lg shadow-md relative">
          <h2 className="text-lg mb-2">📈 Caso médio de logins simultâneos</h2>
          {loadingStats ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-4 border-t-transparent border-green-400 rounded-full mx-auto"
            />
          ) : (
            <p className="text-4xl font-bold text-green-400">
              {isFinite(stats.averageCase) ? stats.averageCase : '—'}
            </p>
          )}
        </div>
      </div>

      <div className="mb-10">
        <TokenRecommendation peak={stats.worstCase} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopUsersChart data={data} />
        <LoginVolumeChart data={data} />
      </div>

      <div className='mt-10'>
        <HeatmapChart data={data}/>
      </div>
    </div>
  );
}
