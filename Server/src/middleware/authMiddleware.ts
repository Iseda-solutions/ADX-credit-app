import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  // extract token; it could be undefined if the header is malformed
  const [, token] = authHeader.split(" ");
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // ensure your secret exists at runtime
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  const secret: string = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { id?: string };

    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = { id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
