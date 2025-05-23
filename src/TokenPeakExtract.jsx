import React, { useState } from 'react';
import { extractTokenPeakPeriods } from './utils/calcUtils';
import { exportArrayToCSV } from './utils/exportArrayToCSV';

const PAGE_SIZE = 10; // Mostra 10 resultados por página (ajuste se quiser)

export default function TokenPeakExtract({ data }) {
  const [tokenInput, setTokenInput] = useState(10);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  const handleExtract = () => {
    const periods = extractTokenPeakPeriods(data, tokenInput, 3);
    setResults(periods);
    setPage(1); // Volta para primeira página ao buscar novo extrato
  };

  // Paginação
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { label: "Início", accessor: "start" },
    { label: "Fim", accessor: "end" },
    { label: "Duração (min)", accessor: row => Math.floor(row.durationSec / 60) },
    { label: "Usuários", accessor: row => row.users.join(", ") },
    { label: "Tokens em uso", accessor: "tokensUsed" }
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
      <h2 className="text-lg font-semibold mb-3 text-black dark:text-white">🔎 Extrato de Períodos de Pico de Tokens</h2>
      <div className="flex items-end gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm">Tokens (concorrentes):</label>
          <input
            type="number"
            value={tokenInput}
            onChange={e => setTokenInput(Number(e.target.value))}
            min={1}
            className="w-24 p-2 rounded bg-white dark:bg-gray-700 border text-black dark:text-white"
          />
        </div>
        <button
          onClick={handleExtract}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-bold"
        >
          Buscar períodos
        </button>
      </div>
      <div className="flex justify-between items-end gap-2 mb-4">
        {/* ...input e botão de busca */}
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-2 rounded text-xs font-semibold"
          disabled={!results.length}
          onClick={() => exportArrayToCSV(results, columns)}
        >
          Exportar CSV 📥
        </button>
      </div>
      {results.length === 0 && <p className="text-gray-600 dark:text-gray-300">Nenhum pico encontrado para este valor de tokens.</p>}
      {results.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full mt-2 text-xs text-left">
              <thead>
                <tr className="bg-gray-300 dark:bg-gray-700">
                  <th className="p-2">Início</th>
                  <th className="p-2">Fim</th>
                  <th className="p-2">Duração</th>
                  <th className="p-2">Usuários</th>
                  <th className="p-2">Tokens em uso</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-600">
                    <td className="p-2">{p.start}</td>
                    <td className="p-2">{p.end}</td>
                    <td className="p-2">{Math.floor(p.durationSec / 60)}m {p.durationSec % 60}s</td>
                    <td className="p-2">{p.users.join(', ')}</td>
                    <td className="p-2">{p.tokensUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex gap-2 mt-2 justify-end items-center">
            <button
              disabled={page === 1}
              className="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
            >
              &lt; Anterior
            </button>
            <span className="mx-2 text-sm">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              className="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
            >
              Próxima &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
}
