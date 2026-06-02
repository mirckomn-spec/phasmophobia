import { NextResponse } from "next/server";
import { getSession, type AuthUser } from "./auth";

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};

export function apiJson<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE_HEADERS });
}

export async function requireApiSession(): Promise<
  { session: AuthUser; response: null } | { session: null; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { session: null, response: apiError("Não autorizado", 401) };
  }
  return { session, response: null };
}

/** Nunca expõe mensagens de erro internas (MongoDB, stack) ao cliente. */
export function handleApiFailure(
  error: unknown,
  publicMessage = "Erro interno. Tente novamente."
): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    console.error("[api]", error);
  }
  return apiError(publicMessage, 500);
}
