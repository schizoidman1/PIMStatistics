import dayjs from 'dayjs';

export function filterByDate(data, start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return data.filter(row => {
    const login = dayjs(row.LOGIN_START);
    return login.isValid() && login.isAfter(startDate.subtract(1, 'day')) && login.isBefore(endDate.add(1, 'day'));
  });
}

export function calcStats(data) {
  const loginsByMinute = {};

  data.forEach(row => {
    if (!row.LOGIN_START || !row.LOGIN_END) return;

    const start = dayjs(row.LOGIN_START);
    const end = dayjs(row.LOGIN_END);

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) return;

    let current = start;
    while (current.isBefore(end)) {
      const key = current.format('YYYY-MM-DD HH:mm');
      if (!loginsByMinute[key]) loginsByMinute[key] = 0;
      loginsByMinute[key] += 1;
      current = current.add(1, 'minute');
    }
  });

  const allCounts = Object.values(loginsByMinute);
  const worstCase = allCounts.length ? Math.max(...allCounts) : 0;
  const averageCase = allCounts.length ? Math.round(allCounts.reduce((a, b) => a + b, 0) / allCounts.length) : 0;
  return { worstCase, averageCase };
}