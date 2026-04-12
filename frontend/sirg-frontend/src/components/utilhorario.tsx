export const horarios: Record<number, { inicio: number; fin: number }> = {
  1: { inicio: 12, fin: 22 }, // Lunes
  2: { inicio: 12, fin: 22 },
  3: { inicio: 12, fin: 22 },
  4: { inicio: 12, fin: 23 },
  5: { inicio: 12, fin: 23.5 },
  6: { inicio: 11, fin: 23.5 },
  0: { inicio: 11, fin: 21 }, // Domingo
};

export const formatearHora = (hora: number): string => {
  const h = Math.floor(hora);
  const m = hora % 1 === 0.5 ? "30" : "00";
  const periodo = h >= 12 ? "pm" : "am";
  const hora12 = h > 12 ? h - 12 : h === 0 ? 12 : h;

  return `${hora12}:${m} ${periodo}`;
};