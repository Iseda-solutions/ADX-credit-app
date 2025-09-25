// src/routes/loanRoutes.ts
import { Router, type Response, type NextFunction } from "express";
import prisma from "../config/db.js";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { LoanStatus } from "@prisma/client";
import { randomUUID } from "crypto";

const router = Router();

// POST /api/loans/apply
router.post("/apply", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, term } = req.body as { amount?: number; term?: number };
    if (!amount || !term) {
      return res.status(400).json({ error: "Amount and term are required" });
    }

    const application = await prisma.loanApplication.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),
        termMonths: Number(term),
        status: LoanStatus.PENDING,
      },
      select: { id: true, amount: true, termMonths: true, status: true, createdAt: true },
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

// GET /api/loans
router.get("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const applications = await prisma.loanApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, termMonths: true, status: true, createdAt: true },
    });

    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// POST /api/loans/:loanId/repay
router.post(
  "/:loanId/repay",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { loanId } = req.params as { loanId?: string };
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!loanId) {
        return res.status(400).json({ error: "Loan ID is required" });
      }

      const { amount, method } = req.body as { amount?: number; method?: string };
      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      // Verify the loan belongs to the user
      const loan = await prisma.loanApplication.findFirst({
        where: { id: loanId, userId: req.user.id },
      });
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const payment = await prisma.repayment.create({
        data: {
          loanId,
          userId: req.user.id,
          amount: Number(amount),
          method: method ?? "bank_transfer",
          reference: randomUUID(),
        },
        select: { id: true, amount: true, paymentDate: true, method: true, reference: true },
      });

      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/loans/:loanId/payments
router.get(
  "/:loanId/payments",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { loanId } = req.params as { loanId?: string };
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!loanId) {
        return res.status(400).json({ error: "Loan ID is required" });
      }

      // Verify ownership
      const loan = await prisma.loanApplication.findFirst({
        where: { id: loanId, userId: req.user.id },
      });
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const repayments = await prisma.repayment.findMany({
        where: { loanId },
        orderBy: { paymentDate: "desc" },
        select: { id: true, amount: true, paymentDate: true, method: true, reference: true },
      });

      const disbursements = await prisma.disbursement.findMany({
        where: { loanId },
        orderBy: { disbursedAt: "desc" },
        select: { id: true, amount: true, disbursedAt: true, method: true, reference: true },
      });

      res.json({ repayments, disbursements });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
