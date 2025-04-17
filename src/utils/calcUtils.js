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
