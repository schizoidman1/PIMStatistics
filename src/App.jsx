import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import FileUploader from './FileUploader';
import LoadingScreen from './LoadingScreen';
import Dashboard from './Dashboard';
import { filterByDate, calcStatsChunked } from './utils/calcUtils';
import ThemeToggle from './ThemeToggle';
import HomePage from './HomePage';

function InnerApp() {
  const { rawData, setFilteredData, dateRange, setDateRange, setStats, filteredData, stats } = useData();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleDateChange = (type, value) => {
    const updated = { ...dateRange, [type]: value };
    setDateRange(updated);
    if (rawData.length > 0) {
      const filtered = filterByDate(rawData, updated.start, updated.end);
      const stats = calcStatsChunked(filtered);
      setFilteredData(filtered);
      setStats(stats);
    }
  };

  return (
    <>
      {!loaded ? (
        loading ? <LoadingScreen /> : <HomePage onLoaded={() => { setLoading(true); setTimeout(() => { setLoading(false); setLoaded(true); }, 2000); }} />
      ) : (
        <Dashboard 
          data={filteredData} 
          dateRange={dateRange} 
          onDateChange={handleDateChange} 
          stats={stats}
          onBackToHome={() => setLoaded(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <InnerApp />
      <ThemeToggle />
    </DataProvider>
  );
}