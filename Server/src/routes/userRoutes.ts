// src/routes/userRoutes.ts
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import prisma from "../config/db.js";  // 👈 you forgot this

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// GET /api/users/me
router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/me – update the current user's profile
router.put("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // extract only allowed fields from the request body
    const { phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone: phone ?? undefined,
        address: address ?? undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

export default router;
