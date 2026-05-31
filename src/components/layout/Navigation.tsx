"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/investigadores", label: "Investigadores" },
  { href: "/ranks", label: "Ranks" },
  { href: "/streak", label: "Win Streak" },
  { href: "/ghosts", label: "Entidades" },
  { href: "/tools", label: "Ferramentas" },
];

interface NavigationProps {
  session: AuthUser | null;
}

export function Navigation({ session }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#171717] bg-black/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link href="/" className="font-display text-xs tracking-wide text-white">
          N&N
        </Link>

        <ul className="flex flex-1 items-center justify-center gap-4 overflow-x-auto sm:gap-5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`label whitespace-nowrap transition-opacity duration-300 ${
                    active ? "text-[#c4b5fd]" : "text-[#8A8A8A] hover:text-[#D9D9D9]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {session ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="label hidden text-[#7c6aef] sm:inline">{session.displayName}</span>
            <button
              onClick={logout}
              className="label text-[#8A8A8A] transition-opacity hover:text-[#e85d75]"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link href="/login" className="label shrink-0 text-[#7c6aef]">
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
