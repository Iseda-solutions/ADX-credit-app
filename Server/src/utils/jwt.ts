import jwt from "jsonwebtoken";
import type { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "fallbacksecret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as any;

export function signToken(payload: object): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
