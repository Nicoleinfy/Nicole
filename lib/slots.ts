function generarSlots(inicioHora: number, inicioMin: number, finHora: number, finMin: number) {
  const slots = [];
  let h = inicioHora, m = inicioMin;
  while (h < finHora || (h === finHora && m < finMin)) {
    const nextM = m + 10;
    const nextH = nextM >= 60 ? h + 1 : h;
    const normNextM = nextM >= 60 ? nextM - 60 : nextM;
    slots.push({
      inicio: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      fin: `${String(nextH).padStart(2, "0")}:${String(normNextM).padStart(2, "0")}`,
    });
    h = nextH;
    m = normNextM;
  }
  return slots;
}

export const SLOTS_MANANA = generarSlots(9, 0, 12, 30);   // 09:00 – 12:20 (último termina 12:30)
export const SLOTS_TARDE  = generarSlots(14, 30, 17, 0);  // 14:30 – 16:50 (último termina 17:00)

export const TODOS_LOS_SLOTS = [...SLOTS_MANANA, ...SLOTS_TARDE];

// Retorna true si el día es lunes a viernes
export function esDiaHabil(fecha: Date): boolean {
  const dia = fecha.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  return dia >= 1 && dia <= 5;
}

// Retorna true si el slot está bloqueado para una fecha dada
export function esSlotBloqueado(fecha: Date, horaInicio: string): boolean {
  const hora = parseInt(horaInicio);
  const fechaStr = fecha.toISOString().slice(0, 10);
  // Viernes 17 de abril 2026: tarde bloqueada
  if (fechaStr === "2026-04-17" && hora >= 13) return true;
  // Miércoles 22 de abril 2026: bloqueadas desde 10:00 hasta 12:00 (inclusive)
  if (fechaStr === "2026-04-22" && hora >= 10 && hora < 13) return true;
  return false;
}
