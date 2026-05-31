import { NextResponse } from "next/server";
import { createSession, verifyCredentials, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 });
    }

    const user = verifyCredentials(username, password);
    if (!user) {
      return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
    }

    const token = await createSession(user);
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erro ao autenticar" }, { status: 500 });
  }
}
