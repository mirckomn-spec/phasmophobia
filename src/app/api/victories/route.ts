import { apiError, requireApiSession } from "@/lib/api-security";

const DISABLED = "Endpoint desativado. Use /api/matches com confirmação dupla.";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;
  return apiError(DISABLED, 410);
}

export async function POST() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;
  return apiError(DISABLED, 410);
}

export async function DELETE() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;
  return apiError(DISABLED, 410);
}
