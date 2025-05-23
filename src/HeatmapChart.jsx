import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { col } from 'framer-motion/client';
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const horas = Array.from({ length: 24 }, (_, i) => `${i}h`);
const dias = Array.from({ length: 31 }, (_, i) => i + 1);
const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(raw) {
  return dayjs(raw, [dayjs.ISO_8601, 'M/D/YYYY h:mm:ss A'], true);
}

function agruparPorDiaDoMes(data, anoSelecionado) {
  const mapa = new Map();
  for (const row of data) {
    const dt = parseDate(row.LOGIN_START || row['START DATE']);
    if (!dt.isValid() || dt.year() !== parseInt(anoSelecionado)) continue;
    const dia = dt.date();
    const mes = dt.format('MMM');
    const key = `${mes}_${dia}`;
    mapa.set(key, (mapa.get(key) || 0) + 1);
  }

  const heatmap = meses.map(mes => {
    const linha = { label: mes };
    for (let d = 1; d <= 31; d++) {
      const key = `${mes}_${d}`;
      linha[d] = mapa.get(key) || 0;
    }
    return linha;
  });

  return { heatmap, colunas: dias };
}

// Blocos reduzidos e escala de cor tipo GitHub
function getColorLevel(value, max) {
  if (!max || value === 0) return 'rgba(255,106,0,0.10)';
  const steps = [0.15, 0.35, 0.55, 0.75, 1];
  const idx = Math.floor((value / max) * steps.length);
  return `rgba(255,106,0,${steps[idx]})`;
}

function agruparPorHoraDoDia(data, mesSelecionado, anoSelecionado) {
  const mapa = new Map();
  for (const row of data) {
    const dt = parseDate(row.LOGIN_START || row['START DATE']);
    if (!dt.isValid() || dt.format('MMM') !== mesSelecionado || dt.year() !== parseInt(anoSelecionado)) continue;
    const hora = dt.hour();
    const dia = dt.date();
    const key = `${dia}_${hora}`;
    mapa.set(key, (mapa.get(key) || 0) + 1);
  }

  const heatmap = dias.map(dia => {
    const linha = { label: `${dia}º` };
    for (let h = 0; h < 24; h++) {
      const key = `${dia}_${h}`;
      linha[`${h}h`] = mapa.get(key) || 0;
    }
    return linha;
  });

  return { heatmap, colunas: horas };
}

export default function HeatmapChart({ data }) {
  const [modo, setModo] = useState('diaMes');
  const [mesSelecionado, setMesSelecionado] = useState('Jan');
  const [anoSelecionado, setAnoSelecionado] = useState('');

  const anosDisponiveis = useMemo(() => {
    const anoSet = new Set();
    for (const row of data) {
      const year = parseDate(row.LOGIN_START || row['START DATE']).year();
      if (year) anoSet.add(year);
    }
    return [...anoSet].sort((a, b) => b - a);
  }, [data]);

  useEffect(() => {
    if (anosDisponiveis.length > 0 && !anoSelecionado) {
      setAnoSelecionado(anosDisponiveis[0]);
    }
  }, [anosDisponiveis]);

  const isDark = document.documentElement.classList.contains('dark');
  const baseColor = '255,106,0'; // Laranja gusa
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.6)';
  const textColor = isDark ? 'white' : 'black';

  const { heatmap, colunas } = useMemo(() => {
    if (!anoSelecionado) return { heatmap: [], colunas: [] };
    return modo === 'diaMes'
      ? agruparPorDiaDoMes(data, anoSelecionado)
      : agruparPorHoraDoDia(data, mesSelecionado, anoSelecionado);
  }, [data, modo, mesSelecionado, anoSelecionado]);


  // Pegue o máximo do grid pra normalizar cor
  const maxVal = useMemo(() => {
    let max = 0;
    for (const linha of heatmap) {
      for (const col of colunas) {
        max = Math.max(max, linha[col] || 0);
      }
    }
    return max;
  }, [heatmap, colunas]);


  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg overflow-x-auto transition-colors duration-300">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
        <h2 className="text-base font-bold text-black dark:text-white">🗓️ Heatmap de Logins</h2>
        <div className="flex gap-1 items-center">
          <select value={modo} onChange={(e) => setModo(e.target.value)} className="bg-white dark:bg-gray-700 text-xs border px-1 py-0.5 rounded">
            <option value="diaMes">Dias do Mês</option>
            <option value="horaDia">Horas do Dia</option>
          </select>
          {modo === 'horaDia' && (
            <select value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)} className="bg-white dark:bg-gray-700 text-xs border px-1 py-0.5 rounded">
              {meses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          <select value={anoSelecionado} onChange={e => setAnoSelecionado(e.target.value)} className="bg-white dark:bg-gray-700 text-xs border px-1 py-0.5 rounded">
            {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {heatmap.length > 0 && (
        <div className="inline-grid" style={{ gridTemplateColumns: `48px repeat(${colunas.length}, 14px)` }}>
          <div></div>
          {colunas.map(c => (
            <div key={c} className="text-[10px] text-center text-black dark:text-white">{c}</div>
          ))}
          {heatmap.map((linha, i) => (
            <React.Fragment key={i}>
              <div className="text-[10px] text-black dark:text-white">{linha.label}</div>
              {colunas.map((col, j) => (
                <div
                  key={j}
                  className="w-3 h-3 rounded-sm transition"
                  title={`${linha.label} ${col}: ${linha[col] || 0} login${(linha[col]||0) !== 1 ? 's' : ''}`}
                  style={{
                    backgroundColor: getColorLevel(linha[col] || 0, maxVal),
                  }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
