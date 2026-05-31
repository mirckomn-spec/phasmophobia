"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao entrar");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="label mb-3 text-[#7c6aef]">Acesso Restrito</p>
        <h1 className="title-page">Login</h1>
        <p className="mt-3 font-body text-xs text-[#8A8A8A]">
          Central operacional Naltic & Neat
        </p>

        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <label className="label mb-2 block">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full border border-[#171717] bg-[#0A0A0A] px-4 py-3 font-body text-sm text-white outline-none transition-colors focus:border-[#7c6aef]"
              placeholder="naltic ou neat"
            />
          </div>
          <div>
            <label className="label mb-2 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-[#171717] bg-[#0A0A0A] px-4 py-3 font-body text-sm text-white outline-none transition-colors focus:border-[#7c6aef]"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-[#e85d75]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#7c6aef] bg-[#7c6aef]/10 py-3 font-body text-xs uppercase tracking-widest text-[#c4b5fd] transition-opacity hover:bg-[#7c6aef]/20 disabled:opacity-40"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
