import { Router } from "express";
import prisma from "../config/db.js"           // adjust path if needed
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * POST /api/loans/apply
 * Create a new loan application for the current user.
 * Expects { amount: number, term: number } in the request body.
 */
router.post("/apply", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, term } = req.body;
    if (!amount || !term) {
      return res.status(400).json({ error: "Amount and term are required" });
    }

    const application = await prisma.loanApplication.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),  // convert to number or use Decimal if configured
        termMonths: Number(term),
        status: "PENDING",       // optional: set initial status
      },
      select: {
        id: true,
        amount: true,
        termMonths: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/loans
 * List all loan applications for the current user.
 */
router.get("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const applications = await prisma.loanApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        termMonths: true,
        status: true,
        createdAt: true,
      },
    });

    res.json(applications);
  } catch (err) {
    next(err);
  }
});


/**
 * POST /api/loans/:loanId/repay
 * Record a repayment for a specific loan.
 */
router.post("/:loanId/repay", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { loanId } = req.params;
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Verify loan belongs to current user
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
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
      },
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/loans/:loanId/payments
 * Return repayments and disbursements for a specific loan.
 */
router.get("/:loanId/payments", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { loanId } = req.params;
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify loan belongs to current user
    const loan = await prisma.loanApplication.findFirst({
      where: { id: loanId, userId: req.user.id },
    });
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const repayments = await prisma.repayment.findMany({
      where: { loanId },
      orderBy: { paymentDate: "desc" },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
      },
    });
    const disbursements = await prisma.disbursement.findMany({
      where: { loanId },
      orderBy: { disbursedAt: "desc" },
      select: {
        id: true,
        amount: true,
        disbursedAt: true,
      },
    });

    res.json({ repayments, disbursements });
  } catch (err) {
    next(err);
  }
});


export default router;
