import { prisma } from "@/lib/prisma";
import { enviarConfirmacionWhatsApp } from "@/lib/whatsapp";
import { esDiaHabil, esSlotBloqueado } from "@/lib/slots";
import { parseISO, startOfDay, isAfter, format } from "date-fns";
import { es } from "date-fns/locale";

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, correo, whatsapp, fecha, horaInicio, horaFin } = body;

  // Validación básica
  if (!nombre || !correo || !whatsapp || !fecha || !horaInicio || !horaFin) {
    return Response.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const fechaDate = parseISO(fecha);

  if (!esDiaHabil(fechaDate)) {
    return Response.json({ error: "Solo se puede reservar de lunes a viernes" }, { status: 400 });
  }

  // Comparar en hora Chile (UTC-4). Se restan 4h a UTC para obtener fecha local chilena.
  const ahoraChile = new Date(Date.now() - 4 * 60 * 60 * 1000);
  if (startOfDay(fechaDate) < startOfDay(ahoraChile)) {
    return Response.json({ error: "No se puede reservar para fechas pasadas" }, { status: 400 });
  }

  if (esSlotBloqueado(fechaDate, horaInicio)) {
    return Response.json({ error: "Este horario no está disponible" }, { status: 400 });
  }

  try {
    const reserva = await prisma.reserva.create({
      data: {
        nombre,
        correo,
        whatsapp,
        fecha: startOfDay(fechaDate),
        horaInicio,
        horaFin,
        estado: "confirmada",
      },
    });

    // Enviar confirmación por WhatsApp (no bloquea la respuesta si falla)
    const fechaFormateada = format(fechaDate, "EEEE d 'de' MMMM yyyy", { locale: es });
    enviarConfirmacionWhatsApp({
      nombre,
      whatsapp,
      fecha: fechaFormateada,
      horaInicio,
      horaFin,
    }).catch((err) => {
      console.error("Error enviando WhatsApp:", err);
    });

    return Response.json({ reserva }, { status: 201 });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return Response.json(
        { error: "Este horario ya fue reservado por otra persona" },
        { status: 409 }
      );
    }
    console.error(error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
