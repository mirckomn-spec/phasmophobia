import { apiJson, requireApiSession } from "@/lib/api-security";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const response = apiJson({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
