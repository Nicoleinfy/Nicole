"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast.error("Contraseña incorrecta");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAF8F5" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl tracking-[0.3em] font-light" style={{ color: "#9b8ea8" }}>✦ Santoliva</span>
          <p className="text-xs tracking-widest mt-1" style={{ color: "#b0a8b9" }}>PANEL DE ADMINISTRACIÓN</p>
        </div>

        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: "0 4px 40px rgba(155,142,168,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs tracking-widest uppercase font-light" style={{ color: "#b0a8b9" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-4 rounded-2xl text-sm font-light outline-none"
                style={{ border: "1px solid #ede8f2", color: "#6b6070", backgroundColor: "#faf8fc" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-2xl text-xs tracking-widest uppercase text-white font-light disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #c4739a 0%, #8a7ab8 100%)" }}
            >
              {loading ? "Entrando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
