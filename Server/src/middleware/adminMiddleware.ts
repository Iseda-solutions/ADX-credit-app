// src/middleware/adminMiddleware.ts
import prisma from "../config/db.js";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { UserRole } from "@prisma/client";
export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Look up the user's role
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
