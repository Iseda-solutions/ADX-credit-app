// src/routes/adminRoutes.ts
import { Router, type Response, type NextFunction } from "express";
import prisma from "../config/db.js";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { LoanStatus } from "@prisma/client";  // import enum

const router = Router();

// GET /api/admin/loans
router.get(
  "/loans",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const loans = await prisma.loanApplication.findMany({
        include: {
          user: { select: { id: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(loans);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/loans/:loanId/approve
router.put(
  "/loans/:loanId/approve",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { loanId } = req.params as { loanId?: string };
      if (!loanId) {
        return res.status(400).json({ error: "Loan ID is required" });
      }
      const loan = await prisma.loanApplication.update({
        where: { id: loanId },
        data: { status: LoanStatus.APPROVED },  // use enum
      });
      res.json(loan);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/loans/:loanId/reject
router.put(
  "/loans/:loanId/reject",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { loanId } = req.params as { loanId?: string };
      if (!loanId) {
        return res.status(400).json({ error: "Loan ID is required" });
      }
      const loan = await prisma.loanApplication.update({
        where: { id: loanId },
        data: { status: LoanStatus.REJECTED },  // use enum
      });
      res.json(loan);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/loans/:loanId/disburse
router.put(
  "/loans/:loanId/disburse",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { loanId } = req.params as { loanId?: string };
      if (!loanId) {
        return res.status(400).json({ error: "Loan ID is required" });
      }

      // Mark the loan as disbursed
      const loan = await prisma.loanApplication.update({
        where: { id: loanId },
        data: { status: LoanStatus.REPAID },  // or LoanStatus.DISBURSED if you add it to the enum
      });

      // Create a disbursement record (method and reference are required in your schema)
      const disbursement = await prisma.disbursement.create({
        data: {
          loanId: loanId,
          userId: loan.userId,
          amount: loan.amount,
          disbursedAt: new Date(),
          method: "bank_transfer",
          reference: crypto.randomUUID(),
        },
      });

      res.json({ loan, disbursement });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
