// src/middleware/adminMiddleware.ts
import prisma from "../config/db.js";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./authMiddleware.js";

export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ADMIN_IDS is a comma-separated list of user IDs who are admins
  const adminIds = (process.env.ADMIN_IDS || "").split(",");
  if (!adminIds.includes(req.user.id)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
