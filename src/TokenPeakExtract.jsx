import React, { useState } from 'react';
import { extractTokenOccurrences } from './utils/calcUtils';
import { exportArrayToCSV } from './utils/exportArrayToCSV';

const PAGE_SIZE = 10;

export default function TokenPeakExtract({ data }) {
  const [tokenInput, setTokenInput] = useState(10);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleExtract = () => {
    setIsLoading(true);
    setTimeout(() => {
      const occurrences = extractTokenOccurrences(data, tokenInput, 3);
      setResults(occurrences);
      setPage(1);
      setExpandedRow(null);
      setIsLoading(false);
    }, 0)
  };

  const toggleExpand = (idx) => {
    setExpandedRow(prev => (prev === idx ? null : idx));
  };

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { label: "Data/Hora", accessor: "date" },
    { label: "Tokens em uso", accessor: "tokensUsed" },
    {
      label: "Usuários ativos",
      accessor: row => Array.from(new Set(row.sessions.map(s => s.split("__")[0]))).join(", ")
    },
    { label: "Total de sessões", accessor: "usersCount" }
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
      <h2 className="text-lg font-semibold mb-3 text-black dark:text-white">🔎 Ocorrências de Picos de Tokens</h2>

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
          Buscar ocorrências
        </button>
      </div>

      <div className="flex justify-between items-end gap-2 mb-4">
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-2 rounded text-xs font-semibold"
          disabled={!results.length}
          onClick={() => exportArrayToCSV(results, columns)}
        >
          Exportar CSV 📥
        </button>
      </div>

      {/* Spinner de carregamento */}
      {isLoading && (
        <div className="flex items-center justify-center text-orange-500 my-6">
          <svg className="animate-spin h-6 w-6 mr-2 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Processando dados...</span>
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">
          Nenhuma ocorrência encontrada para este valor de tokens.
        </p>
      )}


      {!isLoading && results.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full mt-2 text-xs text-left">
              <thead>
                <tr className="bg-gray-300 dark:bg-gray-700">
                  <th className="p-2">Data/Hora</th>
                  <th className="p-2">Tokens em uso</th>
                  <th className="p-2">Usuários ativos</th>
                  <th className="p-2">Total de sessões</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o, idx) => {
                  const absoluteIndex = (page - 1) * PAGE_SIZE + idx;
                  const users = Array.from(new Set(o.sessions.map(s => s.split("__")[0])));

                  return (
                    <React.Fragment key={absoluteIndex}>
                      <tr
                        className="border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => toggleExpand(absoluteIndex)}
                      >
                        <td className="p-2">{o.date}</td>
                        <td className="p-2">{o.tokensUsed}</td>
                        <td className="p-2 truncate" title={users.join(', ')}>
                          {users.slice(0, 8).join(', ')}{users.length > 8 ? `, +${users.length - 8}` : ''}
                        </td>
                        <td className="p-2">{o.usersCount}</td>
                      </tr>

                      {expandedRow === absoluteIndex && (
                        <tr className="bg-gray-100 dark:bg-gray-900 text-xs">
                          <td colSpan="4" className="p-3">
                            <div className="overflow-x-auto">
                              <table className="w-full border text-left">
                                <thead>
                                  <tr className="bg-gray-200 dark:bg-gray-700">
                                    <th className="p-2">Usuário</th>
                                    <th className="p-2">Produto</th>
                                    <th className="p-2">Servidor</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.sessions.map((s, i) => {
                                    const [user, product, server] = s.split("__");
                                    return (
                                      <tr key={i} className="border-b border-gray-300 dark:border-gray-700">
                                        <td className="p-2">{user}</td>
                                        <td className="p-2">{product}</td>
                                        <td className="p-2">{server}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

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
