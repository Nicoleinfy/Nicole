import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TODOS_LOS_SLOTS, esDiaHabil } from "@/lib/slots";
import { parseISO, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  const fecha = request.nextUrl.searchParams.get("fecha");

  if (!fecha) {
    return Response.json({ error: "Parámetro 'fecha' requerido" }, { status: 400 });
  }

  const fechaDate = parseISO(fecha);

  if (!esDiaHabil(fechaDate)) {
    return Response.json({ slots: [] });
  }

  const reservasDelDia = await prisma.reserva.findMany({
    where: {
      fecha: startOfDay(fechaDate),
      estado: "confirmada",
    },
    select: { horaInicio: true },
  });

  const ocupados = new Set(reservasDelDia.map((r: { horaInicio: string }) => r.horaInicio));

  const slots = TODOS_LOS_SLOTS.map((slot) => ({
    ...slot,
    disponible: !ocupados.has(slot.inicio),
  }));

  return Response.json({ slots });
}
