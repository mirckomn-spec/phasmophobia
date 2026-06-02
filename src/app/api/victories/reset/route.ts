import { apiError, requireApiSession } from "@/lib/api-security";

export async function POST() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;
  return apiError("Endpoint desativado. Use /api/matches com confirmação dupla.", 410);
}
