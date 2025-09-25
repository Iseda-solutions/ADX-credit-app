-- CreateEnum
CREATE TYPE "public"."LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REPAID');

-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."KYCProfile" (
    "userId" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "bvn" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "status" "public"."KYCStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "KYCProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."LoanApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "status" "public"."LoanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Repayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT NOT NULL,

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disbursement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "disbursedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT NOT NULL,

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KYCProfile_nin_key" ON "public"."KYCProfile"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "KYCProfile_bvn_key" ON "public"."KYCProfile"("bvn");

-- CreateIndex
CREATE UNIQUE INDEX "Repayment_reference_key" ON "public"."Repayment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Disbursement_reference_key" ON "public"."Disbursement"("reference");

-- AddForeignKey
ALTER TABLE "public"."KYCProfile" ADD CONSTRAINT "KYCProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoanApplication" ADD CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repayment" ADD CONSTRAINT "Repayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repayment" ADD CONSTRAINT "Repayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."LoanApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disbursement" ADD CONSTRAINT "Disbursement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disbursement" ADD CONSTRAINT "Disbursement_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."LoanApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
