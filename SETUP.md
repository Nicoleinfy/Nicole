# Santoliva Reservas — Guía de configuración

## 1. Base de datos (Neon)

1. Ve a https://console.neon.tech y crea una cuenta
2. Crea un nuevo proyecto llamado `santoliva`
3. Copia la **Connection string** (formato: `postgresql://usuario:contraseña@host/santoliva?sslmode=require`)
4. Pégala en `.env` como `DATABASE_URL`

## 2. Ejecutar migración de base de datos

```bash
npx prisma migrate dev --name init
```

## 3. WhatsApp con Twilio

1. Ve a https://twilio.com y crea una cuenta gratuita
2. En el dashboard, copia:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
3. Ve a **Messaging → Try it out → Send a WhatsApp message**
4. Sigue los pasos para activar el **Sandbox de WhatsApp**
5. El número del sandbox es `+1 415 523 8886`
6. Para recibir mensajes de prueba: envía el código que te dan al número de WhatsApp de Twilio

> ⚠️ En producción, debes solicitar un número de WhatsApp aprobado por Meta a través de Twilio.

## 4. Completar .env

```env
DATABASE_URL="postgresql://..."
TWILIO_ACCOUNT_SID="ACxxxx"
TWILIO_AUTH_TOKEN="xxxx"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
```

## 5. Deploy en Vercel

1. Ve a https://vercel.com y crea una cuenta
2. Instala la CLI: `npm i -g vercel`
3. En la carpeta del proyecto ejecuta: `vercel`
4. Cuando te pida las variables de entorno, agrega las mismas del `.env`

O sube el proyecto a GitHub y conéctalo desde el dashboard de Vercel (recomendado).

## Horarios disponibles

- Lunes a viernes
- Mañana: 09:30, 10:00, 10:30, 11:00, 11:30
- Tarde: 14:30, 15:00, 15:30, 16:00, 16:30
- Duración: 30 minutos por turno
- Capacidad: 1 persona por turno
