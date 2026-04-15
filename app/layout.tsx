import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santoliva — Reserva tu visita al Showroom",
  description: "Reserva tu horario para visitar el showroom de Santoliva. Lunes a viernes, 09:30–12:00 y 14:30–17:00.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
