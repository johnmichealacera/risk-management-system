-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BARANGAY_STAFF', 'MUNICIPAL_ADMIN', 'MDRRMC_OFFICER', 'MAYOR', 'DEPARTMENT_HEAD');

-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('TYPHOON', 'STORM', 'FLOOD', 'EARTHQUAKE', 'FIRE', 'LANDSLIDE', 'VOLCANIC_ERUPTION', 'DROUGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "DisasterStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('SIGNAL_1', 'SIGNAL_2', 'SIGNAL_3', 'SIGNAL_4', 'SIGNAL_5', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EvacueeStatus" AS ENUM ('EVACUATED', 'RETURNED_HOME', 'RELOCATED', 'MISSING');

-- CreateEnum
CREATE TYPE "ReliefDistributionStatus" AS ENUM ('PENDING', 'APPROVED', 'DISTRIBUTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SITREPStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "barangayId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barangay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "population" INTEGER,
    "contactInfo" TEXT,
    "coordinates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisasterEvent" (
    "id" TEXT NOT NULL,
    "type" "DisasterType" NOT NULL,
    "severity" "AlertLevel" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "DisasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisasterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisasterEventBarangay" (
    "id" TEXT NOT NULL,
    "disasterEventId" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisasterEventBarangay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "headOfFamily" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "contactInfo" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvacuationCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvacuationCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evacuee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "evacuationCenterId" TEXT,
    "familyId" TEXT,
    "status" "EvacueeStatus" NOT NULL DEFAULT 'EVACUATED',
    "specialNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "contactInfo" TEXT,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evacuee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliefGood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReliefGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliefDistribution" (
    "id" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "disasterEventId" TEXT,
    "reliefGoodId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "distributedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distributedById" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "status" "ReliefDistributionStatus" NOT NULL DEFAULT 'PENDING',
    "distributionPoint" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReliefDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SITREP" (
    "id" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "disasterEventId" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evacueeCount" INTEGER NOT NULL DEFAULT 0,
    "damages" JSONB,
    "status" "SITREPStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SITREP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_barangayId_idx" ON "User"("barangayId");

-- CreateIndex
CREATE UNIQUE INDEX "Barangay_code_key" ON "Barangay"("code");

-- CreateIndex
CREATE INDEX "Barangay_code_idx" ON "Barangay"("code");

-- CreateIndex
CREATE INDEX "DisasterEvent_status_idx" ON "DisasterEvent"("status");

-- CreateIndex
CREATE INDEX "DisasterEvent_startDate_idx" ON "DisasterEvent"("startDate");

-- CreateIndex
CREATE INDEX "DisasterEventBarangay_disasterEventId_idx" ON "DisasterEventBarangay"("disasterEventId");

-- CreateIndex
CREATE INDEX "DisasterEventBarangay_barangayId_idx" ON "DisasterEventBarangay"("barangayId");

-- CreateIndex
CREATE UNIQUE INDEX "DisasterEventBarangay_disasterEventId_barangayId_key" ON "DisasterEventBarangay"("disasterEventId", "barangayId");

-- CreateIndex
CREATE INDEX "Family_barangayId_idx" ON "Family"("barangayId");

-- CreateIndex
CREATE INDEX "EvacuationCenter_barangayId_idx" ON "EvacuationCenter"("barangayId");

-- CreateIndex
CREATE INDEX "Evacuee_barangayId_idx" ON "Evacuee"("barangayId");

-- CreateIndex
CREATE INDEX "Evacuee_evacuationCenterId_idx" ON "Evacuee"("evacuationCenterId");

-- CreateIndex
CREATE INDEX "Evacuee_familyId_idx" ON "Evacuee"("familyId");

-- CreateIndex
CREATE INDEX "Evacuee_status_idx" ON "Evacuee"("status");

-- CreateIndex
CREATE INDEX "ReliefGood_category_idx" ON "ReliefGood"("category");

-- CreateIndex
CREATE INDEX "ReliefDistribution_barangayId_idx" ON "ReliefDistribution"("barangayId");

-- CreateIndex
CREATE INDEX "ReliefDistribution_disasterEventId_idx" ON "ReliefDistribution"("disasterEventId");

-- CreateIndex
CREATE INDEX "ReliefDistribution_reliefGoodId_idx" ON "ReliefDistribution"("reliefGoodId");

-- CreateIndex
CREATE INDEX "ReliefDistribution_status_idx" ON "ReliefDistribution"("status");

-- CreateIndex
CREATE INDEX "ReliefDistribution_distributedDate_idx" ON "ReliefDistribution"("distributedDate");

-- CreateIndex
CREATE INDEX "SITREP_barangayId_idx" ON "SITREP"("barangayId");

-- CreateIndex
CREATE INDEX "SITREP_disasterEventId_idx" ON "SITREP"("disasterEventId");

-- CreateIndex
CREATE INDEX "SITREP_reportDate_idx" ON "SITREP"("reportDate");

-- CreateIndex
CREATE INDEX "SITREP_status_idx" ON "SITREP"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisasterEventBarangay" ADD CONSTRAINT "DisasterEventBarangay_disasterEventId_fkey" FOREIGN KEY ("disasterEventId") REFERENCES "DisasterEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisasterEventBarangay" ADD CONSTRAINT "DisasterEventBarangay_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationCenter" ADD CONSTRAINT "EvacuationCenter_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evacuee" ADD CONSTRAINT "Evacuee_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evacuee" ADD CONSTRAINT "Evacuee_evacuationCenterId_fkey" FOREIGN KEY ("evacuationCenterId") REFERENCES "EvacuationCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evacuee" ADD CONSTRAINT "Evacuee_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evacuee" ADD CONSTRAINT "Evacuee_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefDistribution" ADD CONSTRAINT "ReliefDistribution_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefDistribution" ADD CONSTRAINT "ReliefDistribution_disasterEventId_fkey" FOREIGN KEY ("disasterEventId") REFERENCES "DisasterEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefDistribution" ADD CONSTRAINT "ReliefDistribution_reliefGoodId_fkey" FOREIGN KEY ("reliefGoodId") REFERENCES "ReliefGood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefDistribution" ADD CONSTRAINT "ReliefDistribution_distributedById_fkey" FOREIGN KEY ("distributedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SITREP" ADD CONSTRAINT "SITREP_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SITREP" ADD CONSTRAINT "SITREP_disasterEventId_fkey" FOREIGN KEY ("disasterEventId") REFERENCES "DisasterEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SITREP" ADD CONSTRAINT "SITREP_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
