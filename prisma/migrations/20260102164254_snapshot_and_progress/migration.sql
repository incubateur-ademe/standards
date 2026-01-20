/*
  Warnings:

  - The primary key for the `UserOnStartup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `UserOnStartup` table. All the data in the column will be lost.
  - You are about to drop the column `startupId` on the `UserOnStartup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notionId]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[startupShadowId,userId,kind]` on the table `UserOnStartup` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `UserOnStartup` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `startupShadowId` to the `UserOnStartup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StartupAccessKind" AS ENUM ('ASSISTANCE', 'AUDIT', 'TEMP', 'OTHER');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProofKind" AS ENUM ('URL', 'FILE', 'NOTE');

-- DropIndex
DROP INDEX "Standard_id_notionId_key";

-- AlterTable
ALTER TABLE "UserOnStartup" DROP CONSTRAINT "UserOnStartup_pkey",
DROP COLUMN "role",
DROP COLUMN "startupId",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "kind" "StartupAccessKind" NOT NULL DEFAULT 'ASSISTANCE',
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "startupShadowId" TEXT NOT NULL,
ADD CONSTRAINT "UserOnStartup_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "StartupShadow" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT,
    "currentPhaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StartupShadow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionProgress" (
    "id" TEXT NOT NULL,
    "startupShadowId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'TODO',
    "ownerId" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionProof" (
    "id" TEXT NOT NULL,
    "actionProgressId" TEXT NOT NULL,
    "kind" "ProofKind" NOT NULL DEFAULT 'URL',
    "ref" TEXT,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActionProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionComment" (
    "id" TEXT NOT NULL,
    "actionProgressId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdById" TEXT,
    "authorRole" "UserRole",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "startupShadowId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotActionProgress" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL,

    CONSTRAINT "SnapshotActionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotActionProof" (
    "id" TEXT NOT NULL,
    "snapshotActionProgressId" TEXT NOT NULL,
    "kind" "ProofKind" NOT NULL,
    "ref" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnapshotActionProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StartupShadow_externalId_key" ON "StartupShadow"("externalId");

-- CreateIndex
CREATE INDEX "StartupShadow_currentPhaseId_idx" ON "StartupShadow"("currentPhaseId");

-- CreateIndex
CREATE INDEX "ActionProgress_startupShadowId_idx" ON "ActionProgress"("startupShadowId");

-- CreateIndex
CREATE INDEX "ActionProgress_actionId_idx" ON "ActionProgress"("actionId");

-- CreateIndex
CREATE INDEX "ActionProgress_status_idx" ON "ActionProgress"("status");

-- CreateIndex
CREATE INDEX "ActionProgress_ownerId_idx" ON "ActionProgress"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionProgress_startupShadowId_actionId_key" ON "ActionProgress"("startupShadowId", "actionId");

-- CreateIndex
CREATE INDEX "ActionProof_actionProgressId_createdAt_idx" ON "ActionProof"("actionProgressId", "createdAt");

-- CreateIndex
CREATE INDEX "ActionProof_deletedAt_idx" ON "ActionProof"("deletedAt");

-- CreateIndex
CREATE INDEX "ActionProof_createdById_idx" ON "ActionProof"("createdById");

-- CreateIndex
CREATE INDEX "ActionComment_actionProgressId_createdAt_idx" ON "ActionComment"("actionProgressId", "createdAt");

-- CreateIndex
CREATE INDEX "ActionComment_deletedAt_idx" ON "ActionComment"("deletedAt");

-- CreateIndex
CREATE INDEX "ActionComment_createdById_idx" ON "ActionComment"("createdById");

-- CreateIndex
CREATE INDEX "Snapshot_startupShadowId_createdAt_idx" ON "Snapshot"("startupShadowId", "createdAt");

-- CreateIndex
CREATE INDEX "Snapshot_phaseId_idx" ON "Snapshot"("phaseId");

-- CreateIndex
CREATE INDEX "SnapshotActionProgress_snapshotId_idx" ON "SnapshotActionProgress"("snapshotId");

-- CreateIndex
CREATE INDEX "SnapshotActionProgress_actionId_idx" ON "SnapshotActionProgress"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotActionProgress_snapshotId_actionId_key" ON "SnapshotActionProgress"("snapshotId", "actionId");

-- CreateIndex
CREATE INDEX "SnapshotActionProof_snapshotActionProgressId_idx" ON "SnapshotActionProof"("snapshotActionProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "Action_notionId_key" ON "Action"("notionId");

-- CreateIndex
CREATE INDEX "Action_standardId_idx" ON "Action"("standardId");

-- CreateIndex
CREATE INDEX "UserOnStartup_userId_idx" ON "UserOnStartup"("userId");

-- CreateIndex
CREATE INDEX "UserOnStartup_expiresAt_idx" ON "UserOnStartup"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnStartup_startupShadowId_userId_kind_key" ON "UserOnStartup"("startupShadowId", "userId", "kind");

-- AddForeignKey
ALTER TABLE "StartupShadow" ADD CONSTRAINT "StartupShadow_currentPhaseId_fkey" FOREIGN KEY ("currentPhaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnStartup" ADD CONSTRAINT "UserOnStartup_startupShadowId_fkey" FOREIGN KEY ("startupShadowId") REFERENCES "StartupShadow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnStartup" ADD CONSTRAINT "UserOnStartup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProgress" ADD CONSTRAINT "ActionProgress_startupShadowId_fkey" FOREIGN KEY ("startupShadowId") REFERENCES "StartupShadow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProgress" ADD CONSTRAINT "ActionProgress_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProgress" ADD CONSTRAINT "ActionProgress_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProgress" ADD CONSTRAINT "ActionProgress_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProof" ADD CONSTRAINT "ActionProof_actionProgressId_fkey" FOREIGN KEY ("actionProgressId") REFERENCES "ActionProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionProof" ADD CONSTRAINT "ActionProof_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionComment" ADD CONSTRAINT "ActionComment_actionProgressId_fkey" FOREIGN KEY ("actionProgressId") REFERENCES "ActionProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionComment" ADD CONSTRAINT "ActionComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_startupShadowId_fkey" FOREIGN KEY ("startupShadowId") REFERENCES "StartupShadow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotActionProgress" ADD CONSTRAINT "SnapshotActionProgress_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotActionProgress" ADD CONSTRAINT "SnapshotActionProgress_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotActionProof" ADD CONSTRAINT "SnapshotActionProof_snapshotActionProgressId_fkey" FOREIGN KEY ("snapshotActionProgressId") REFERENCES "SnapshotActionProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
