import dayjs from 'dayjs';

export function filterByDate(data, start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  return data.filter(row => {
    const login = dayjs(row.LOGIN_START);
    return login.isValid() && login.isAfter(startDate.subtract(1, 'day')) && login.isBefore(endDate.add(1, 'day'));
  });
}

export async function calcStatsChunked(data, chunkSize = 1000) {
  const loginsByMinute = {};
  const MAX_MINUTES_PER_SESSION = 7200;

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(() => {
      chunk.forEach(row => {
        if (!row.LOGIN_START || !row.LOGIN_END) return;

        const start = dayjs(row.LOGIN_START);
        const end = dayjs(row.LOGIN_END);

        if (!start.isValid() || !end.isValid() || start.isAfter(end)) return;

        let current = start;
        let steps = 0;
        while (current.isBefore(end) && steps < MAX_MINUTES_PER_SESSION) {
          const key = current.format('YYYY-MM-DD HH:mm');
          if (!loginsByMinute[key]) loginsByMinute[key] = 0;
          loginsByMinute[key] += 1;
          current = current.add(1, 'minute');
          steps++;
        }
      });
      resolve();
    }, 0));
  }

  const allCounts = Object.values(loginsByMinute);
  const worstCase = allCounts.length ? Math.max(...allCounts) : 0;
  const averageCase = allCounts.length ? Math.round(allCounts.reduce((a, b) => a + b, 0) / allCounts.length) : 0;
  return { worstCase, averageCase };
}
