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
        const parsed = results.data
          .filter(row => row.USER && (row["START DATE"] || row["START TIMESTAMP"]) && (row["END DATE"] || row["END TIMESTAMP"]) && row.DURATION)
          .map(row => {
            const loginStart = row["START DATE"] ? new Date(row["START DATE"]) : new Date(Number(row["START TIMESTAMP"]) * 1000);
            const loginEnd = row["END DATE"] ? new Date(row["END DATE"]) : new Date(Number(row["END TIMESTAMP"]) * 1000);
            return {
              USER: row.USER,
              LOGIN_START: loginStart,
              LOGIN_END: loginEnd,
              DURATION: parseInt(row.DURATION)
            };
          });

        console.log("CSV carregado:", parsed);

        setRawData(parsed);
        const filtered = filterByDate(parsed, dateRange.start, dateRange.end);
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
