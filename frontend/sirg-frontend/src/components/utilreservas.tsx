import { horarios } from "../components/utilhorario";

export const generarHorasDisponibles = (fecha: Date): string[] => {
  const dia = fecha.getDay();
  const horario = horarios[dia];

  if (!horario) return [];

  const ahora = new Date();
  const horas: string[] = [];

  // 🔥 convertir apertura y cierre a fechas reales
  const apertura = new Date(fecha);
  apertura.setHours(Math.floor(horario.inicio), horario.inicio % 1 ? 30 : 0, 0, 0);

  const cierre = new Date(fecha);
  cierre.setHours(Math.floor(horario.fin), horario.fin % 1 ? 30 : 0, 0, 0);

  // 🔁 iterar desde apertura hasta antes de cierre
  let actual = new Date(apertura);

  while (actual < cierre) {
    // calcular diferencia en minutos para evitar problemas de redondeo
    const diffMinutes = (actual.getTime() - ahora.getTime()) / (1000 * 60);

    // ⛔ mínimo 2 horas (120 minutos)
    if (diffMinutes >= 120) {
      const hh = actual.getHours().toString().padStart(2, "0");
      const mm = actual.getMinutes() === 30 ? "30" : "00";

      horas.push(`${hh}:${mm}`);
    }

    // avanzar 30 minutos
    actual.setMinutes(actual.getMinutes() + 30);
  }

  return horas;
};