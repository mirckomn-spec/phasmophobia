import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Reset direto desativado. Proponha o reset e aguarde confirmação de Naltic e Neat.",
    },
    { status: 403 }
  );
}
