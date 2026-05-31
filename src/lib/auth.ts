import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AuthUser = {
  username: "naltic" | "neat";
  displayName: "Naltic" | "Neat";
  playerKey: "Naltic" | "Neat";
};

const SESSION_COOKIE = "nn-session";

const USERS: Record<string, { displayName: "Naltic" | "Neat"; playerKey: "Naltic" | "Neat" }> = {
  naltic: { displayName: "Naltic", playerKey: "Naltic" },
  neat: { displayName: "Neat", playerKey: "Neat" },
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurada");
  return new TextEncoder().encode(secret);
}

export function verifyCredentials(username: string, password: string): AuthUser | null {
  const normalized = username.toLowerCase().trim();
  const user = USERS[normalized];
  if (!user) return null;

  const expected =
    normalized === "naltic"
      ? process.env.NALTIC_PASSWORD ?? "892892"
      : process.env.NEAT_PASSWORD ?? "092092";

  if (password !== expected) return null;

  return {
    username: normalized as "naltic" | "neat",
    displayName: user.displayName,
    playerKey: user.playerKey,
  };
}

export async function createSession(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
