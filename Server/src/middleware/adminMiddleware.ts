import prisma from "../config/db.js";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authMiddleware.js";

/**
 * Checks if the authenticated user is an admin.
 * Assumes your User model has a 'role' field (e.g. 'USER' or 'ADMIN').
 */
export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
