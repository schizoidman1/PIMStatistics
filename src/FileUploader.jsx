import React from 'react';
import Papa from 'papaparse';
import { useData } from './context/DataContext';
import { filterByDate, calcStats } from './utils/calcUtils';

export default function FileUploader({ onLoaded }) {
  const { setRawData, setFilteredData, setStats, dateRange } = useData();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRawData(results.data);

        console.log("CSV carregado:", results.data);
        
        const filtered = filterByDate(results.data, dateRange.start, dateRange.end);
        const stats = calcStats(filtered);
        setFilteredData(filtered);
        setStats(stats);
        onLoaded();
      }
    });
  };

  return (
    <div className="p-8 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">🚀 PIMStatistics</h1>
      <input type="file" accept=".csv" onChange={handleFile} className="mb-6 text-black" />
    </div>
  );
}