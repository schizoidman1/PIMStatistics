import html2canvas from 'html2canvas';

export async function exportComponentAsImage(ref, filename = 'chart.png') {
  if (!ref.current) return;
  const canvas = await html2canvas(ref.current);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}