import React from 'react';
import Papa from 'papaparse';
import { useData } from './context/DataContext';

export default function FileUploader({ onLoaded }) {
  const { setRawData } = useData();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true, // usa Web Worker para evitar travamentos na UI
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
              DURATION: parseInt(row.DURATION),
              PRODUCT: row.PRODUCT,
              SERVER: row.SERVER
            };
          });

        console.log("CSV carregado:", parsed);

        setRawData(parsed);
        onLoaded();
      }
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 text-center">
      <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">📂 Importe seu arquivo CSV</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Selecione um arquivo com os dados extraídos do sistema PIMS.
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="block mx-auto mb-2 text-black dark:text-white"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        O arquivo deve conter colunas como <code>LOGIN_START</code>, <code>LOGIN_END</code>, <code>DURATION</code> e <code>USER</code>.
      </p>
    </div>
  );
}
