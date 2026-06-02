import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth-constants";

export type AuthUser = {
  username: "naltic" | "neat";
  displayName: "Naltic" | "Neat";
  playerKey: "Naltic" | "Neat";
};

export { SESSION_COOKIE };

const USERS: Record<string, { displayName: "Naltic" | "Neat"; playerKey: "Naltic" | "Neat" }> = {
  naltic: { displayName: "Naltic", playerKey: "Naltic" },
  neat: { displayName: "Neat", playerKey: "Neat" },
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET inválida ou ausente");
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function getExpectedPassword(username: "naltic" | "neat"): string | null {
  const value =
    username === "naltic" ? process.env.NALTIC_PASSWORD : process.env.NEAT_PASSWORD;
  if (!value || value.length < 4) return null;
  return value;
}

export function verifyCredentials(username: string, password: string): AuthUser | null {
  const normalized = username.toLowerCase().trim();
  if (normalized !== "naltic" && normalized !== "neat") return null;

  const user = USERS[normalized];
  const expected = getExpectedPassword(normalized);
  if (!expected || !safeEqual(password, expected)) return null;

  return {
    username: normalized,
    displayName: user.displayName,
    playerKey: user.playerKey,
  };
}

export async function createSession(user: AuthUser): Promise<string> {
  return new SignJWT({ username: user.username, playerKey: user.playerKey })
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
    const username = payload.username;
    if (username !== "naltic" && username !== "neat") return null;

    const meta = USERS[username];
    return {
      username,
      displayName: meta.displayName,
      playerKey: meta.playerKey,
    };
  } catch {
    return null;
  }
}
