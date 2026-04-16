export const SLOTS_MANANA = [
  { inicio: "09:30", fin: "10:00" },
  { inicio: "10:00", fin: "10:30" },
  { inicio: "10:30", fin: "11:00" },
  { inicio: "11:00", fin: "11:30" },
  { inicio: "11:30", fin: "12:00" },
];

export const SLOTS_TARDE = [
  { inicio: "14:30", fin: "15:00" },
  { inicio: "15:00", fin: "15:30" },
  { inicio: "15:30", fin: "16:00" },
  { inicio: "16:00", fin: "16:30" },
  { inicio: "16:30", fin: "17:00" },
];

export const TODOS_LOS_SLOTS = [...SLOTS_MANANA, ...SLOTS_TARDE];

// Retorna true si el día es lunes a viernes
export function esDiaHabil(fecha: Date): boolean {
  const dia = fecha.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  return dia >= 1 && dia <= 5;
}

// Retorna true si el slot está bloqueado para una fecha dada
export function esSlotBloqueado(fecha: Date, horaInicio: string): boolean {
  const hora = parseInt(horaInicio);
  // Todos los horarios de tarde bloqueados (14:30 en adelante)
  if (hora >= 13) return true;
  return false;
}
