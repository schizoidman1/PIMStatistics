import React, { useEffect, useState, useCallback } from 'react';
import DateFilter from './DateFilter';
import TopUsersChart from './TopUsersChart';
import LoginVolumeChart from './LoginVolumeChart';
import LoginHistogram from './LoginHistogram';
import ThemeToggle from './ThemeToggle';
import HeatmapChart from './HeatmapChart';
import Footer from './Footer';
import { useData } from './context/DataContext';
import { filterByDate, calcStatsChunked } from './utils/calcUtils';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';

export default function Dashboard({ data, dateRange, onDateChange, stats, onBackToHome }) {
  const { rawData, setFilteredData, setStats, filteredData } = useData();
  const [loadingStats, setLoadingStats] = useState(false);
  const [volumeInfo, setVolumeInfo] = useState('');

  const processData = useCallback(
    debounce((data, start, end) => {
      const startTime = performance.now();
      const filtered = filterByDate(data, start, end);
      setFilteredData(filtered);
      setLoadingStats(true);
      setVolumeInfo(`Visualizando ${filtered.length.toLocaleString()} de ${data.length.toLocaleString()} registros.`);

      calcStatsChunked(filtered).then((stats) => {
        setStats(stats);
        setLoadingStats(false);
        const endTime = performance.now();
        console.log(`⏱️ Processamento levou ${(endTime - startTime).toFixed(2)} ms`);
        localStorage.setItem('lastRange', JSON.stringify({ start, end }));
        localStorage.setItem('lastVolume', filtered.length);
      });
    }, 300),
    []
  );

  useEffect(() => {
    if (rawData.length && dateRange.start && dateRange.end) {
      processData(rawData, dateRange.start, dateRange.end);
    }
  }, [rawData, dateRange, processData]);

  return (
    <div className="p-8 min-h-screen text-black dark:text-white bg-white dark:bg-gradient-to-br dark:from-[#0d0d0d] dark:via-[#1a1a1a] dark:to-[#000000] transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-700 to-fuchsia-500">PIMStatistics Dashboard</h1>
        <ThemeToggle />
      </div>

      <div className="flex justify-between items-center mb-6">
      <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded shadow">
          ← Importar outro arquivo
        </button>
      </div>

      <div className="mb-6">
        <DateFilter startDate={dateRange.start} endDate={dateRange.end} onChange={onDateChange} data={rawData} />
        {volumeInfo && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 mt-1">{volumeInfo}</motion.p>}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-100 dark:bg-[#1f2937] p-6 rounded-lg shadow-md relative">
          <h2 className="text-lg mb-2">🔥 Pior caso de <b>tokens</b> simultâneos</h2>
          {loadingStats ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-4 border-t-transparent border-pink-400 rounded-full mx-auto"
            />
          ) : (
            <p className="text-4xl font-bold text-pink-400">
              {isFinite(stats.worstCase) ? Math.ceil(stats.worstCase / 3) : '—'}
            </p>
          )}
        </div>
        <div className="bg-gray-100 dark:bg-[#1f2937] p-6 rounded-lg shadow-md relative">
          <h2 className="text-lg mb-2">📈 Caso médio de <b>tokens</b> simultâneos</h2>
          {loadingStats ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-4 border-t-transparent border-green-400 rounded-full mx-auto"
            />
          ) : (
            <p className="text-4xl font-bold text-green-400">
              {isFinite(stats.averageCase) ? Math.ceil(stats.averageCase / 3) : '—'}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-10'>
        <LoginHistogram data={filteredData}/>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopUsersChart data={filteredData} />
        <LoginVolumeChart data={filteredData} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-10'>
        <HeatmapChart data={filteredData}/>
      </motion.div>

      <Footer />
    </div>
  );
}
