import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { getSession } from "@/lib/auth";
import { poppinsBold, poppinsExtraBold, poppinsSemiBold } from "@/lib/fonts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Naltic & Neat — Investigadores de Elite",
  description:
    "Os maiores investigadores paranormais da atualidade. Centenas de entidades identificadas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body
        className={`${poppinsExtraBold.variable} ${poppinsBold.variable} ${poppinsSemiBold.variable} antialiased`}
      >
        <Navigation session={session} />
        <main>{children}</main>
        {session && (
          <footer className="border-t border-[#171717] px-6 py-10">
            <div className="mx-auto max-w-7xl lg:px-4">
              <p className="label text-[#7c6aef]">Naltic & Neat</p>
              <p className="mt-2 font-body text-xs text-[#8A8A8A]">
                Documento confidencial. Operador: {session.displayName}
              </p>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}
