export function exportArrayToCSV(data, columns, filename = "extrato-tokens.csv") {
  // data: array de objetos, columns: array de { label, accessor }
  if (!data || data.length === 0) return;

  // Cabeçalho
  const header = columns.map(c => `"${c.label}"`).join(';');

  // Dados
  const rows = data.map(row =>
    columns.map(c =>
      `"${typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor] || ''}"`
    ).join(';')
  );

  const csvContent = [header, ...rows].join('\r\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
