"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LOGIN_COOLDOWN_MS = 3000;

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);
  const lastAttemptRef = useRef(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((ms: number) => {
    lastAttemptRef.current = Date.now();
    setCooldownMs(ms);

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      const remaining = LOGIN_COOLDOWN_MS - (Date.now() - lastAttemptRef.current);
      if (remaining <= 0) {
        setCooldownMs(0);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        return;
      }
      setCooldownMs(remaining);
    }, 200);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sinceLast = Date.now() - lastAttemptRef.current;
    if (sinceLast < LOGIN_COOLDOWN_MS) {
      setError(`Aguarde ${Math.ceil((LOGIN_COOLDOWN_MS - sinceLast) / 1000)}s para tentar novamente.`);
      return;
    }

    setLoading(true);
    setError("");
    startCooldown(LOGIN_COOLDOWN_MS);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429 && typeof data.error === "string") {
          setError(data.error);
        } else if (res.status === 401) {
          setError("Usuário ou senha incorretos.");
        } else {
          setError("Não foi possível entrar. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      setPassword("");
      router.push("/");
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Verifique sua conexão.");
      setLoading(false);
    }
  };

  const blocked = loading || cooldownMs > 0;

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
              maxLength={32}
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
              maxLength={128}
              className="w-full border border-[#171717] bg-[#0A0A0A] px-4 py-3 font-body text-sm text-white outline-none transition-colors focus:border-[#7c6aef]"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-[#e85d75]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={blocked}
            className="w-full border border-[#7c6aef] bg-[#7c6aef]/10 py-3 font-body text-xs uppercase tracking-widest text-[#c4b5fd] transition-opacity hover:bg-[#7c6aef]/20 disabled:opacity-40"
          >
            {loading
              ? "Entrando..."
              : cooldownMs > 0
                ? `Aguarde ${Math.ceil(cooldownMs / 1000)}s`
                : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
