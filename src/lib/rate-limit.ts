const lastAttempt = new Map<string, number>();

/** Intervalo mínimo entre requisições com a mesma chave (ex.: IP no login). */
export function consumeRateLimit(
  key: string,
  minIntervalMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const previous = lastAttempt.get(key) ?? 0;
  const elapsed = now - previous;

  if (elapsed < minIntervalMs) {
    return { allowed: false, retryAfterMs: minIntervalMs - elapsed };
  }

  lastAttempt.set(key, now);

  if (lastAttempt.size > 10_000) {
    const cutoff = now - minIntervalMs * 2;
    for (const [k, t] of lastAttempt) {
      if (t < cutoff) lastAttempt.delete(k);
    }
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export const LOGIN_COOLDOWN_MS = 3000;
