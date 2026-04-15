"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Reserva {
  id: string;
  nombre: string;
  correo: string;
  whatsapp: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const cargarReservas = useCallback(async (pwd: string, fecha?: string) => {
    setLoading(true);
    try {
      const url = fecha
        ? `/api/admin/reservas?fecha=${fecha}`
        : "/api/admin/reservas";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${pwd}` },
      });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setReservas(data.reservas);
    } catch {
      toast.error("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const pwd = localStorage.getItem("admin_pwd");
    if (!pwd) {
      router.push("/admin");
      return;
    }
    setPassword(pwd);
    cargarReservas(pwd);
  }, [router, cargarReservas]);

  async function cancelarReserva(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    try {
      const res = await fetch("/api/admin/reservas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reserva cancelada");
      cargarReservas(password, filtroFecha || undefined);
    } catch {
      toast.error("Error al cancelar");
    }
  }

  const reservasConfirmadas = reservas.filter((r) => r.estado === "confirmada");
  const reservasCanceladas = reservas.filter((r) => r.estado === "cancelada");

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-lg tracking-[0.2em] font-light" style={{ color: "#9b8ea8" }}>✦ Santoliva</span>
            <p className="text-xs tracking-widest mt-0.5" style={{ color: "#b0a8b9" }}>PANEL DE RESERVAS</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs tracking-widest uppercase px-4 py-2 rounded-2xl"
            style={{ border: "1px solid #ede8f2", color: "#b0a8b9" }}
          >
            Ver web
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total reservas", value: reservas.length },
            { label: "Confirmadas", value: reservasConfirmadas.length },
            { label: "Canceladas", value: reservasCanceladas.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-3xl p-5 text-center"
              style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.06)" }}>
              <p className="text-2xl font-light" style={{ color: "#8a7ab8" }}>{stat.value}</p>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "#c4bccb" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filtro */}
        <div className="bg-white rounded-3xl p-6 mb-4"
          style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.06)" }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs tracking-widest uppercase font-light block mb-1.5"
                style={{ color: "#b0a8b9" }}>Filtrar por fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => {
                  setFiltroFecha(e.target.value);
                  cargarReservas(password, e.target.value || undefined);
                }}
                className="w-full h-10 px-4 rounded-2xl text-sm font-light outline-none"
                style={{ border: "1px solid #ede8f2", color: "#6b6070", backgroundColor: "#faf8fc" }}
              />
            </div>
            {filtroFecha && (
              <button
                onClick={() => {
                  setFiltroFecha("");
                  cargarReservas(password);
                }}
                className="mt-6 text-xs tracking-widest uppercase px-4 py-2 rounded-2xl"
                style={{ border: "1px solid #ede8f2", color: "#b0a8b9" }}
              >
                Ver todas
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.06)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "#e8c4d0", borderTopColor: "transparent" }} />
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-light" style={{ color: "#c4bccb" }}>No hay reservas</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0ecf5" }}>
                  {["Fecha", "Horario", "Nombre", "WhatsApp", "Estado", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs tracking-widest uppercase font-light"
                      style={{ color: "#c4bccb" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservas.map((r, i) => (
                  <tr key={r.id}
                    style={{ borderBottom: i < reservas.length - 1 ? "1px solid #f7f5f9" : "none" }}>
                    <td className="px-6 py-4 text-xs font-light capitalize" style={{ color: "#7a6b82" }}>
                      {format(parseISO(r.fecha), "EEE d MMM", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-xs font-light" style={{ color: "#7a6b82" }}>
                      {r.horaInicio} – {r.horaFin}
                    </td>
                    <td className="px-6 py-4 text-xs font-light" style={{ color: "#7a6b82" }}>
                      <div>{r.nombre}</div>
                      <div style={{ color: "#c4bccb" }}>{r.correo}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-light" style={{ color: "#7a6b82" }}>
                      {r.whatsapp}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 rounded-full font-light"
                        style={r.estado === "confirmada"
                          ? { background: "#f0fdf4", color: "#16a34a" }
                          : { background: "#fef2f2", color: "#dc2626" }}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.estado === "confirmada" && (
                        <button
                          onClick={() => cancelarReserva(r.id)}
                          className="text-xs tracking-widest uppercase px-3 py-1.5 rounded-xl transition-all"
                          style={{ border: "1px solid #fde8e8", color: "#e8a0a0" }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
