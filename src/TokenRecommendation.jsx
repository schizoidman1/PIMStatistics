import React from 'react';

export default function TokenRecommendation({ peak }) {
  const tokensDisponiveis = 72;
  const usuariosPorToken = 3;
  const capacidadeTotal = tokensDisponiveis * usuariosPorToken;
  const percentualUso = isFinite(peak) ? (peak / capacidadeTotal) * 100 : 0;

  let mensagem = "Uso dentro da capacidade atual.";
  let cor = "text-green-600 dark:text-green-400";

  if (percentualUso > 90) {
    mensagem = "🚨 Recomenda-se a compra de mais tokens!";
    cor = "text-red-600 dark:text-red-500";
  } else if (percentualUso < 60) {
    mensagem = "⚠️ Avalie a possibilidade de reduzir tokens.";
    cor = "text-yellow-600 dark:text-yellow-400";
  }

  return (
    <div className="bg-gray-100 dark:bg-[#111827] p-6 rounded-xl shadow-lg backdrop-blur border border-cyan-400 dark:border-cyan-600 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-black dark:text-white mb-2">🔐 Recomendação de Tokens</h2>
      <p className={`text-xl font-bold ${cor}`}>{mensagem}</p>
      <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
        Uso atual: {isFinite(peak) ? peak : 0} simultâneos / {capacidadeTotal} máximo ({percentualUso.toFixed(2)}%)
      </p>
    </div>
  );
}
