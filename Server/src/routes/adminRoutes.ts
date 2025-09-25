import { Router } from "express";
import prisma from "../config/db.js";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

/**
 * GET /api/admin/loans
 * List all loan applications (admin only).
 */
router.get("/loans", authMiddleware, adminMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      include: {
        user: {
          select: { id: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(loans);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/loans/:loanId/approve
 * Approve a loan application (admin only).
 */
router.put("/loans/:loanId/approve", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const loan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: { status: "APPROVED" },
    });
    res.json(loan);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/loans/:loanId/reject
 * Reject a loan application (admin only).
 */
router.put("/loans/:loanId/reject", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const loan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: { status: "REJECTED" },
    });
    res.json(loan);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/loans/:loanId/disburse
 * Mark a loan as disbursed and record the disbursement (admin only).
 */
router.put("/loans/:loanId/disburse", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { loanId } = req.params;

    // First, mark the loan status as DISBURSED
    const loan = await prisma.loanApplication.update({
      where: { id: loanId },
      data: { status: "DISBURSED" },
    });

    // Then create a disbursement record
    // Adjust 'amount' and 'disbursedAt' field names as per your schema
    const disbursement = await prisma.disbursement.create({
      data: {
        loanId,
        amount: loan.amount,
        disbursedAt: new Date(),
      },
    });

    res.json({ loan, disbursement });
  } catch (err) {
    next(err);
  }
});

export default router;
