import { apiError, requireApiSession } from "@/lib/api-security";

export async function POST() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  return apiError(
    "Use o fluxo de proposta com confirmação dupla para resetar o histórico.",
    403
  );
}
