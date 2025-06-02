import React, { useRef, useState, useMemo } from 'react';
import { exportComponentAsImage } from './utils/exportAsImage';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

function formatDurationDaysHours(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

// Função para calcular tempo real de uso (sem sobreposição) a partir de intervalos
function sumNonOverlappingIntervals(intervals) {
  if (!intervals.length) return 0;
  // Ordena pelo início
  intervals.sort((a, b) => a.start - b.start);
  let total = 0;
  let [curStart, curEnd] = [intervals[0].start, intervals[0].end];
  for (let i = 1; i < intervals.length; i++) {
    const { start, end } = intervals[i];
    if (start > curEnd) {
      total += curEnd - curStart;
      [curStart, curEnd] = [start, end];
    } else {
      curEnd = Math.max(curEnd, end);
    }
  }
  total += curEnd - curStart;
  return total;
}

export default function TopUsersChart({ data }) {
  const ref = useRef();
  const [expandedUser, setExpandedUser] = useState(null);

  const userStats = useMemo(() => {
    const stats = {};

    // Organiza as sessões
    data.forEach(row => {
      const user = row.USER;
      const start = dayjs(row.LOGIN_START || row['START DATE']).unix();
      const end = dayjs(row.LOGIN_END || row['END DATE']).unix();
      const product = row.PRODUCT || 'UNKNOWN';
      const server = row.SERVER || 'UNKNOWN';

      if (!stats[user]) {
        stats[user] = { sessions: [], products: {}, servers: {} };
      }
      stats[user].sessions.push({ start, end, product, server });

      // Sessions por produto e servidor para cada usuário
      if (!stats[user].products[product]) stats[user].products[product] = [];
      stats[user].products[product].push({ start, end });

      if (!stats[user].servers[server]) stats[user].servers[server] = [];
      stats[user].servers[server].push({ start, end });
    });

    return Object.entries(stats).map(([user, info]) => {
      // Total sem sobreposição (usuário)
      const userTotal = sumNonOverlappingIntervals(info.sessions);

      // Produtos - somando sem sobreposição
      const productsUsage = {};
      Object.entries(info.products).forEach(([prod, intervals]) => {
        productsUsage[prod] = sumNonOverlappingIntervals(intervals);
      });

      // Servidores - somando sem sobreposição
      const serversUsage = {};
      Object.entries(info.servers).forEach(([server, intervals]) => {
        serversUsage[server] = sumNonOverlappingIntervals(intervals);
      });

      // Tokens simultâneos máximo (para o usuário)
      const events = [];
      info.sessions.forEach(({ start, end }) => {
        events.push({ time: start, type: 'start' });
        events.push({ time: end, type: 'end' });
      });
      events.sort((a, b) => a.time - b.time);
      let concurrentSessions = 0;
      let maxConcurrentSessions = 0;
      let lastTimestamp = null;
      events.forEach(({ time, type }) => {
        if (concurrentSessions > 0 && lastTimestamp !== null) {
          // nothing, já computado no total
        }
        concurrentSessions += type === 'start' ? 1 : -1;
        maxConcurrentSessions = Math.max(maxConcurrentSessions, concurrentSessions);
        lastTimestamp = time;
      });

      return {
        user,
        total: userTotal,
        maxConcurrentSessions,
        products: productsUsage,
        servers: serversUsage,
      };
    }).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [data]);

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-xl relative shadow-lg transition">
      <h2 className="text-lg mb-4 text-black dark:text-white">Top 10 Usuários por Tempo de Uso (Sem Sobreposição)</h2>
      <div ref={ref}>
        {userStats.map((userInfo, idx) => (
          <div key={userInfo.user} className="mb-2">
            <div
              className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition flex justify-between"
              onClick={() => setExpandedUser(expandedUser === idx ? null : idx)}
            >
              <span className="font-semibold">{userInfo.user}</span>
              <span className="font-medium">
                {formatDurationDaysHours(userInfo.total)} | Máx. Tokens: {userInfo.maxConcurrentSessions}
              </span>
            </div>
            <AnimatePresence>
              {expandedUser === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden bg-gray-100 dark:bg-gray-900 p-4 rounded-lg"
                >
                  <h3 className="text-sm font-semibold mb-2 dark:text-white">Produtos mais usados (sem sobreposição):</h3>
                  {Object.entries(userInfo.products).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([prod, time]) => (
                    <div key={prod} className="text-xs dark:text-gray-200 mb-1">
                      {prod}: {formatDurationDaysHours(time)}
                    </div>
                  ))}

                  <h3 className="text-sm font-semibold mt-4 mb-2 dark:text-white">Servidores mais usados (sem sobreposição):</h3>
                  {Object.entries(userInfo.servers).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([server, time]) => (
                    <div key={server} className="text-xs dark:text-gray-200 mb-1">
                      {server}: {formatDurationDaysHours(time)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <button
        onClick={() => exportComponentAsImage(ref, 'top-users-detailed.png')}
        className="absolute top-2 right-2 text-xs px-2 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-transform active:scale-95"
      >
        Exportar 📸
      </button>
    </div>
  );
}
