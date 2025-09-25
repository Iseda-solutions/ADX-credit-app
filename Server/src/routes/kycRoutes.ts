import { Router } from "express";
import prisma from "../config/db.js";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * POST /api/users/kyc
 * Create or update the current user's KYC profile.
 */
router.post("/kyc", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { nin, bvn, documentType } = req.body;
    if (!nin || !bvn || !documentType) {
      return res.status(400).json({ error: "nin, bvn and documentType are required" });
    }

    // Check if profile exists
    const existing = await prisma.kYCProfile.findUnique({
      where: { userId: req.user.id },
    });

    let profile;
    if (existing) {
      // Update existing profile
      profile = await prisma.kYCProfile.update({
        where: { userId: req.user.id },
        data: {
          nin,
          bvn,
          documentType,
          status: "PENDING", // you can set logic later
        },
      });
    } else {
      // Create new profile
      profile = await prisma.kYCProfile.create({
        data: {
          userId: req.user.id,
          nin,
          bvn,
          documentType,
          status: "PENDING",
        },
      });
    }

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/kyc
 * Fetch the current user's KYC profile.
 */
router.get("/kyc", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const profile = await prisma.kYCProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res.status(404).json({ error: "No KYC profile found" });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
