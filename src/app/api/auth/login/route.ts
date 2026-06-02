import { NextResponse } from "next/server";
import { apiError, apiJson } from "@/lib/api-security";
import { createSession, verifyCredentials, SESSION_COOKIE } from "@/lib/auth";
import { consumeRateLimit, getClientIp, LOGIN_COOLDOWN_MS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = consumeRateLimit(`login:${ip}`, LOGIN_COOLDOWN_MS);

    if (!rate.allowed) {
      const seconds = Math.ceil(rate.retryAfterMs / 1000);
      return apiError(`Aguarde ${seconds}s antes de tentar novamente.`, 429);
    }

    let body: { username?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return apiError("Credenciais inválidas", 400);
    }

    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password || password.length > 128 || username.length > 32) {
      return apiError("Credenciais inválidas", 400);
    }

    const user = verifyCredentials(username, password);
    if (!user) {
      return apiError("Usuário ou senha incorretos", 401);
    }

    const token = await createSession(user);
    const response = apiJson({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return apiError("Erro ao autenticar", 500);
  }
}
