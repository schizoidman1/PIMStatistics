import dayjs from 'dayjs';

function parseDate(row, key1, keyFallback) {
  return dayjs(row[key1] || row[keyFallback]);
}

export function filterByDate(data, start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  return data.filter(row => {
    const login = parseDate(row, 'LOGIN_START', 'START DATE');
    return login.isValid() && login.isAfter(startDate.subtract(1, 'day')) && login.isBefore(endDate.add(1, 'day'));
  });
}

export async function calcStatsChunked(data) {
  const events = [];

  for (const row of data) {
    const start = parseDate(row, 'LOGIN_START', 'START DATE');
    const end = parseDate(row, 'LOGIN_END', 'END DATE');

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) continue;

    events.push({ time: start.unix(), delta: 1 });
    events.push({ time: end.unix(), delta: -1 });
  }

  events.sort((a, b) => a.time - b.time);

  let active = 0;
  let worst = 0;
  let sum = 0;
  let count = 0;

  for (const e of events) {
    active += e.delta;
    worst = Math.max(worst, active);
    sum += active;
    count++;
  }

  const average = count ? Math.round(sum / count) : 0;
  return { worstCase: worst, averageCase: average };
}

export function getConcurrencyHistogram(data, binSize = 2, usersPerToken = 3) {
  const events = [];
  data.forEach(row => {
    const start = parseDate(row, 'LOGIN_START', 'START DATE');
    const end = parseDate(row, 'LOGIN_END', 'END DATE');
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) return;
    events.push({ time: start.unix(), delta: 1 });
    events.push({ time: end.unix(), delta: -1 });
  });
  events.sort((a, b) => a.time - b.time);

  let active = 0;
  let lastTime = null;
  const histogram = {};
  for (const e of events) {
    if (lastTime !== null && active > 0) {
      // calcula o intervalo em segundos
      const duration = e.time - lastTime;
      const tokens = Math.ceil(active / usersPerToken);
      const bin = Math.floor((tokens - 1) / binSize) * binSize + 1;
      if (!histogram[bin]) histogram[bin] = { count: 0, duration: 0 };
      histogram[bin].count += 1;
      histogram[bin].duration += duration; // soma em segundos
    }
    active += e.delta;
    lastTime = e.time;
  }
  // Transforma para array [{range: "1-2", count, duration}, ...]
  const result = Object.entries(histogram).map(([bin, { count, duration }]) => ({
    range: `${bin}-${+bin + binSize - 1}`,
    count,
    duration // em segundos
  }));
  return result.sort((a, b) => parseInt(a.range) - parseInt(b.range));
}



// Adaptado para considerar tokens, cada token = 3 usuários
export function extractTokenPeakPeriods(data, tokensThreshold, usuariosPorToken = 3) {
  // Monta lista de eventos (login e logout)
  const events = [];
  data.forEach(row => {
    const start = dayjs(row.LOGIN_START || row['START DATE']);
    const end = dayjs(row.LOGIN_END || row['END DATE']);
    const user = row.USER || row['USER'];
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) return;
    events.push({ time: start.unix(), delta: 1, user });
    events.push({ time: end.unix(), delta: -1, user });
  });
  // Ordena eventos pelo tempo
  events.sort((a, b) => a.time - b.time);

  let activeUsers = new Set();
  let activeCount = 0;
  let periods = [];
  let inPeak = false;
  let periodStart = null;

  for (const e of events) {
    if (e.delta > 0) activeUsers.add(e.user);
    else activeUsers.delete(e.user);

    activeCount += e.delta;
    const currentTokens = Math.ceil(activeCount / usuariosPorToken);

    if (!inPeak && currentTokens >= tokensThreshold) {
      // Início do período de pico
      inPeak = true;
      periodStart = e.time;
    }
    if (inPeak && currentTokens < tokensThreshold) {
      // Fim do período de pico
      inPeak = false;
      periods.push({
        start: periodStart,
        end: e.time,
        users: Array.from(activeUsers),
        tokensUsed: currentTokens,
        usersCount: activeCount,
      });
    }
  }
  // Se terminou com pico ainda aberto
  if (inPeak && periodStart) {
    periods.push({
      start: periodStart,
      end: events[events.length - 1].time,
      users: Array.from(activeUsers),
      tokensUsed: Math.ceil(activeCount / usuariosPorToken),
      usersCount: activeCount,
    });
  }
  // Converte timestamps para data legível
  return periods.map(p => ({
    ...p,
    start: dayjs.unix(p.start).format('DD/MM/YYYY HH:mm:ss'),
    end: dayjs.unix(p.end).format('DD/MM/YYYY HH:mm:ss'),
    durationSec: p.end - p.start,
  }));
}
