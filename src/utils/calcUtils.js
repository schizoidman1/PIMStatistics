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


export function extractTokenOccurrences(data, tokensThreshold, usuariosPorToken = 3) {
  const events = [];

  // Pré-processamento rápido e simplificado
  for (const row of data) {
    const start = dayjs(row.LOGIN_START || row['START DATE']);
    const end = dayjs(row.LOGIN_END || row['END DATE']);

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) continue;

    const sessionId = `${row.USER || row['USER']}__${row.PRODUCT || row['PRODUCT'] || 'UNKNOWN_PRODUCT'}__${row.SERVER || row['SERVER'] || 'UNKNOWN_SERVER'}`;

    events.push({ time: start.unix(), delta: 1, sessionId });
    events.push({ time: end.unix(), delta: -1, sessionId });
  }

  events.sort((a, b) => a.time - b.time);

  const activeSessions = new Set();
  const occurrences = [];

  let lastTokens = -1; // Evita checar o mesmo valor múltiplas vezes
  let activeCount = 0;

  for (const e of events) {
    if (e.delta > 0) activeSessions.add(e.sessionId);
    else activeSessions.delete(e.sessionId);

    activeCount += e.delta;

    // Otimização matemática: cálculo só muda quando cruzar múltiplos
    const currentTokens = ((activeCount + usuariosPorToken - 1) / usuariosPorToken) | 0; 

    // Só verifica quando o número de tokens mudou
    if (currentTokens !== lastTokens) {
      if (currentTokens === tokensThreshold) {
        occurrences.push({
          time: e.time,
          date: dayjs.unix(e.time).format('DD/MM/YYYY HH:mm:ss'),
          tokensUsed: currentTokens,
          usersCount: activeCount,
          sessions: [...activeSessions],
        });
      }
      lastTokens = currentTokens;
    }
  }

  return occurrences;
}

