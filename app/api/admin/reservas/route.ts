import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");

  const where = fecha
    ? { fecha: new Date(fecha) }
    : {};

  const reservas = await prisma.reserva.findMany({
    where,
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
  });

  return Response.json({ reservas });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.reserva.update({
    where: { id },
    data: { estado: "cancelada" },
  });

  return Response.json({ ok: true });
}
