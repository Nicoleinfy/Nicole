import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!; // ej: "whatsapp:+14155238886"

export async function enviarConfirmacionWhatsApp({
  nombre,
  whatsapp,
  fecha,
  horaInicio,
  horaFin,
}: {
  nombre: string;
  whatsapp: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}) {
  const client = twilio(accountSid, authToken);

  // Normalizar número: asegurar formato internacional
  const numero = whatsapp.startsWith("+") ? whatsapp : `+56${whatsapp.replace(/^0/, "")}`;

  const mensaje = `¡Hola ${nombre}! 🌿

Tu visita al *Showroom Santoliva* ha sido confirmada.

📅 *Fecha:* ${fecha}
🕐 *Horario:* ${horaInicio} - ${horaFin}

📍 *Dirección:* Edificio Paseo las Artes, Av. Alemania 0999, oficina 1001

Si necesitas cancelar o cambiar tu horario, contáctanos respondiendo este mensaje.

¡Te esperamos! 🫒`;

  await client.messages.create({
    from: fromNumber,
    to: `whatsapp:${numero}`,
    body: mensaje,
  });
}
