"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface Slot {
  inicio: string;
  fin: string;
  disponible: boolean;
}

type Paso = "fecha" | "slot" | "datos" | "confirmado";

export default function ReservaPage() {
  const [paso, setPaso] = useState<Paso>("fecha");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState<Slot | null>(null);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", correo: "", whatsapp: "" });

  useEffect(() => {
    if (!fechaSeleccionada) return;
    setCargandoSlots(true);
    const fechaISO = format(fechaSeleccionada, "yyyy-MM-dd");
    fetch(`/api/disponibilidad?fecha=${fechaISO}`)
      .then((r) => r.json())
      .then((data) => { setSlots(data.slots ?? []); setSlotSeleccionado(null); })
      .catch(() => toast.error("Error al cargar horarios"))
      .finally(() => setCargandoSlots(false));
  }, [fechaSeleccionada]);

  function isDiaDeshabilitado(fecha: Date): boolean {
    const hoy = startOfDay(new Date());
    if (isBefore(fecha, hoy)) return true;
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
  }

  function handleFechaSeleccionada(fecha: Date | undefined) {
    setFechaSeleccionada(fecha);
    if (fecha) setPaso("slot");
  }

  function handleSlotSeleccionado(slot: Slot) {
    if (!slot.disponible) return;
    setSlotSeleccionado(slot);
    setPaso("datos");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fechaSeleccionada || !slotSeleccionado) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          correo: form.correo,
          whatsapp: form.whatsapp,
          fecha: format(fechaSeleccionada, "yyyy-MM-dd"),
          horaInicio: slotSeleccionado.inicio,
          horaFin: slotSeleccionado.fin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al crear la reserva");
        if (res.status === 409) {
          const fechaISO = format(fechaSeleccionada, "yyyy-MM-dd");
          fetch(`/api/disponibilidad?fecha=${fechaISO}`).then((r) => r.json()).then((d) => setSlots(d.slots ?? []));
          setPaso("slot");
        }
        return;
      }
      setReservaId(data.reserva.id);
      setPaso("confirmado");
    } catch {
      toast.error("Error de conexión, intenta nuevamente");
    } finally {
      setEnviando(false);
    }
  }

  const pasoIndex = ["fecha", "slot", "datos"].indexOf(paso);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAF8F5" }}>

      {/* Panel izquierdo — decorativo */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #7c6e84 0%, #8a7aa0 50%, #6e8a9c 100%)" }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f4a7b9, transparent)" }} />
        <div className="absolute bottom-24 -right-16 w-72 h-72 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #a7c4f4, transparent)" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #b4d4b0, transparent)" }} />

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
              style={{ background: "rgba(255,255,255,0.4)" }}>
              ✦
            </div>
            <span className="text-white/80 tracking-[0.3em] text-sm uppercase font-light">Santoliva</span>
          </div>

          <div>
            <h1 className="text-4xl font-light text-white/90 leading-tight mb-4">
              Visita nuestro<br />
              <span className="font-normal">Showroom</span>
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Agenda tu visita y descubre nuestra colección en un espacio diseñado especialmente para ti.
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <span className="text-white/70 text-xs">📍</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium tracking-wide">Ubicación</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed">
                Edificio Paseo las Artes<br />Av. Alemania 0999, oficina 1001
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <span className="text-white/70 text-xs">🕐</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium tracking-wide">Horarios</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed">
                Lunes a viernes<br />09:30 – 12:00 · 14:30 – 17:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16">

        {/* Header mobile */}
        <div className="lg:hidden text-center mb-8">
          <span className="text-2xl tracking-[0.3em] font-light" style={{ color: "#9b8ea8" }}>✦ Santoliva</span>
          <p className="text-xs tracking-widest mt-1" style={{ color: "#b0a8b9" }}>SHOWROOM · RESERVA TU VISITA</p>
        </div>

        {/* Stepper */}
        {paso !== "confirmado" && (
          <div className="flex items-center gap-2 mb-10 w-full max-w-md">
            {["Fecha", "Horario", "Datos"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all font-light ${
                    pasoIndex === i
                      ? "text-white shadow-md shadow-purple-200"
                      : pasoIndex > i
                      ? "text-white/90"
                      : "bg-white border text-gray-300"
                  }`}
                    style={pasoIndex === i
                      ? { background: "linear-gradient(135deg, #c4739a, #8a7ab8)" }
                      : pasoIndex > i
                      ? { background: "linear-gradient(135deg, #7aab72, #5a9e8e)" }
                      : {}}>
                    {pasoIndex > i ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs tracking-wide hidden sm:block ${
                    pasoIndex === i ? "font-medium" : "font-light"
                  }`}
                    style={{ color: pasoIndex === i ? "#9b8ea8" : "#c4bccb" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-px ml-2" style={{ background: pasoIndex > i ? "#b8d4b0" : "#e8e4ed" }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="w-full max-w-md">

          {/* PASO 1: Fecha */}
          {paso === "fecha" && (
            <div className="bg-white rounded-3xl shadow-sm p-8" style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.08)" }}>
              <div className="mb-6">
                <h2 className="text-lg font-light" style={{ color: "#6b6070" }}>Elige una fecha</h2>
                <p className="text-xs mt-1" style={{ color: "#b0a8b9" }}>Solo días hábiles disponibles</p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={fechaSeleccionada}
                  onSelect={handleFechaSeleccionada}
                  disabled={isDiaDeshabilitado}
                  locale={es}
                  className="rounded-2xl"
                />
              </div>
            </div>
          )}

          {/* PASO 2: Horario */}
          {paso === "slot" && fechaSeleccionada && (
            <div className="bg-white rounded-3xl shadow-sm p-8" style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.08)" }}>
              <div className="mb-6">
                <h2 className="text-lg font-light" style={{ color: "#6b6070" }}>Elige un horario</h2>
                <p className="text-xs mt-1 capitalize" style={{ color: "#c4a8b8" }}>
                  {format(fechaSeleccionada, "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>

              {cargandoSlots ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#e8c4d0", borderTopColor: "transparent" }} />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#c4bccb" }}>Mañana</p>
                    <div className="grid grid-cols-5 gap-2">
                      {slots.filter((s) => parseInt(s.inicio) < 13).map((slot) => (
                        <button
                          key={slot.inicio}
                          onClick={() => handleSlotSeleccionado(slot)}
                          disabled={!slot.disponible}
                          className="py-3 rounded-2xl text-xs font-light transition-all"
                          style={
                            !slot.disponible
                              ? { background: "#f7f5f9", color: "#d4cedd", textDecoration: "line-through", cursor: "not-allowed" }
                              : slotSeleccionado?.inicio === slot.inicio
                              ? { background: "linear-gradient(135deg, #c4739a, #8a7ab8)", color: "white", boxShadow: "0 4px 12px rgba(138,122,184,0.4)" }
                              : { background: "#faf8fc", color: "#9b8ea8", border: "1px solid #ede8f2" }
                          }
                        >
                          {slot.inicio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px" style={{ background: "#f0ecf5" }} />

                  <div>
                    <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#c4bccb" }}>Tarde</p>
                    <div className="grid grid-cols-5 gap-2">
                      {slots.filter((s) => parseInt(s.inicio) >= 13).map((slot) => (
                        <button
                          key={slot.inicio}
                          onClick={() => handleSlotSeleccionado(slot)}
                          disabled={!slot.disponible}
                          className="py-3 rounded-2xl text-xs font-light transition-all"
                          style={
                            !slot.disponible
                              ? { background: "#f7f5f9", color: "#d4cedd", textDecoration: "line-through", cursor: "not-allowed" }
                              : slotSeleccionado?.inicio === slot.inicio
                              ? { background: "linear-gradient(135deg, #c4739a, #8a7ab8)", color: "white", boxShadow: "0 4px 12px rgba(138,122,184,0.4)" }
                              : { background: "#faf8fc", color: "#9b8ea8", border: "1px solid #ede8f2" }
                          }
                        >
                          {slot.inicio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setPaso("fecha")}
                className="mt-7 flex items-center gap-1 text-xs font-light transition-colors"
                style={{ color: "#c4bccb" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#9b8ea8")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#c4bccb")}
              >
                ← Cambiar fecha
              </button>
            </div>
          )}

          {/* PASO 3: Datos */}
          {paso === "datos" && slotSeleccionado && fechaSeleccionada && (
            <div className="bg-white rounded-3xl shadow-sm p-8" style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.08)" }}>
              {/* Resumen de la reserva */}
              <div className="rounded-2xl p-4 mb-7 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #fdf0f5, #f5f0fd)" }}>
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#c4a8c0" }}>Tu reserva</p>
                  <p className="text-sm font-light capitalize" style={{ color: "#7a6b82" }}>
                    {format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-light" style={{ color: "#b8a9e0" }}>{slotSeleccionado.inicio}</p>
                  <p className="text-xs" style={{ color: "#c4bccb" }}>– {slotSeleccionado.fin} hrs</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-light" style={{ color: "#6b6070" }}>Tus datos</h2>
                <p className="text-xs mt-1" style={{ color: "#b0a8b9" }}>Recibirás confirmación por WhatsApp</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { id: "nombre", label: "Nombre completo", type: "text", placeholder: "María González" },
                  { id: "correo", label: "Correo electrónico", type: "email", placeholder: "maria@ejemplo.com" },
                  { id: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "+56912345678" },
                ].map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label htmlFor={field.id} className="text-xs tracking-widest uppercase font-light"
                      style={{ color: "#b0a8b9" }}>
                      {field.label}
                    </label>
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      required
                      className="rounded-2xl text-sm font-light h-11"
                      style={{
                        border: "1px solid #ede8f2",
                        color: "#6b6070",
                        backgroundColor: "#faf8fc",
                      }}
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPaso("slot")}
                    className="flex-1 h-11 rounded-2xl text-xs tracking-widest uppercase font-light transition-all"
                    style={{ border: "1px solid #ede8f2", color: "#c4bccb", background: "white" }}
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 h-11 rounded-2xl text-xs tracking-widest uppercase text-white font-light transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #c4739a 0%, #8a7ab8 100%)", boxShadow: "0 4px 20px rgba(138,122,184,0.35)" }}
                  >
                    {enviando ? "Reservando..." : "Confirmar"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRMADO */}
          {paso === "confirmado" && fechaSeleccionada && slotSeleccionado && (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.08)" }}>
              {/* Banner superior */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #c4739a, #8a7ab8, #6a8fac)" }} />

              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-xl text-white"
                  style={{ background: "linear-gradient(135deg, #c4739a, #8a7ab8)", boxShadow: "0 8px 24px rgba(138,122,184,0.35)" }}>
                  ✓
                </div>
                <h2 className="text-xl font-light mb-1" style={{ color: "#6b6070" }}>¡Reserva confirmada!</h2>
                <p className="text-xs mb-8" style={{ color: "#b0a8b9" }}>
                  Te enviamos los detalles por WhatsApp
                </p>

                {/* Tarjeta de detalles */}
                <div className="rounded-2xl p-5 text-left space-y-3 mb-6"
                  style={{ background: "#faf8fc", border: "1px solid #ede8f2" }}>
                  {[
                    { label: "Nombre", value: form.nombre },
                    { label: "Fecha", value: format(fechaSeleccionada, "EEEE d 'de' MMMM yyyy", { locale: es }) },
                    { label: "Horario", value: `${slotSeleccionado.inicio} – ${slotSeleccionado.fin} hrs` },
                    { label: "Lugar", value: "Paseo las Artes, Av. Alemania 0999, of. 1001" },
                  ].map((item, i, arr) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs tracking-widest uppercase flex-shrink-0" style={{ color: "#c4bccb" }}>
                          {item.label}
                        </span>
                        <span className="text-xs text-right font-light capitalize" style={{ color: "#7a6b82" }}>
                          {item.value}
                        </span>
                      </div>
                      {i < arr.length - 1 && <div className="h-px mt-3" style={{ background: "#ede8f2" }} />}
                    </div>
                  ))}
                  {reservaId && (
                    <div>
                      <div className="h-px mb-3" style={{ background: "#ede8f2" }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs tracking-widest uppercase" style={{ color: "#c4bccb" }}>N° reserva</span>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                          style={{ background: "linear-gradient(135deg, #fdf0f5, #f0edfb)", color: "#b8a9e0" }}>
                          {reservaId.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setPaso("fecha");
                    setFechaSeleccionada(undefined);
                    setSlotSeleccionado(null);
                    setForm({ nombre: "", correo: "", whatsapp: "" });
                    setReservaId(null);
                  }}
                  className="w-full h-11 rounded-2xl text-xs tracking-widest uppercase font-light transition-all"
                  style={{ border: "1px solid #ede8f2", color: "#c4bccb", background: "white" }}
                >
                  Nueva reserva
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
