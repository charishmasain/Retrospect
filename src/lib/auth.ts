import { SignJWT, jwtVerify } from "jose";
import { hashSync, compareSync } from "bcryptjs";

const JWT_SECRET_STR = process.env.JWT_SECRET || "retrospect-secret-key-change-me";
const secret = new TextEncoder().encode(JWT_SECRET_STR);

export async function createToken(payload: {
  userId: number;
  email: string;
  name: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number; email: string; name: string };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}
