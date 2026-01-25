-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "StartupAccessKind" AS ENUM ('ASSISTANCE', 'AUDIT', 'TEMP', 'OTHER');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProofKind" AS ENUM ('URL', 'FILE', 'NOTE');

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "notionId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "kpi" TEXT,
    "reason" TEXT,
    "sourcesUrls" TEXT[],
    "standardBeta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "couldHavePhaseId" TEXT,
    "shouldHavePhaseId" TEXT,
    "mustHavePhaseId" TEXT,
    "standards" TEXT[],

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionSource" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "notionId" TEXT,
    "managerId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "notionId" TEXT,
    "sourceDocBetaUrl" TEXT,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "UserOnStartup" (
    "id" TEXT NOT NULL,
    "startupShadowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "StartupAccessKind" NOT NULL DEFAULT 'ASSISTANCE',
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnStartup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
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

-- CreateTable
CREATE TABLE "_ActionToActionSource" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActionToActionSource_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActionToJob" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActionToJob_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Action_notionId_key" ON "Action"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "StartupShadow_externalId_key" ON "StartupShadow"("externalId");

-- CreateIndex
CREATE INDEX "StartupShadow_currentPhaseId_idx" ON "StartupShadow"("currentPhaseId");

-- CreateIndex
CREATE INDEX "UserOnStartup_userId_idx" ON "UserOnStartup"("userId");

-- CreateIndex
CREATE INDEX "UserOnStartup_expiresAt_idx" ON "UserOnStartup"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnStartup_startupShadowId_userId_kind_key" ON "UserOnStartup"("startupShadowId", "userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_providerAccountId_key" ON "Account"("providerId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_token_key" ON "VerificationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_identifier_token_key" ON "VerificationRequest"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

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
CREATE INDEX "_ActionToActionSource_B_index" ON "_ActionToActionSource"("B");

-- CreateIndex
CREATE INDEX "_ActionToJob_B_index" ON "_ActionToJob"("B");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_couldHavePhaseId_fkey" FOREIGN KEY ("couldHavePhaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_shouldHavePhaseId_fkey" FOREIGN KEY ("shouldHavePhaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_mustHavePhaseId_fkey" FOREIGN KEY ("mustHavePhaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StartupShadow" ADD CONSTRAINT "StartupShadow_currentPhaseId_fkey" FOREIGN KEY ("currentPhaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnStartup" ADD CONSTRAINT "UserOnStartup_startupShadowId_fkey" FOREIGN KEY ("startupShadowId") REFERENCES "StartupShadow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnStartup" ADD CONSTRAINT "UserOnStartup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "_ActionToActionSource" ADD CONSTRAINT "_ActionToActionSource_A_fkey" FOREIGN KEY ("A") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionToActionSource" ADD CONSTRAINT "_ActionToActionSource_B_fkey" FOREIGN KEY ("B") REFERENCES "ActionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionToJob" ADD CONSTRAINT "_ActionToJob_A_fkey" FOREIGN KEY ("A") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionToJob" ADD CONSTRAINT "_ActionToJob_B_fkey" FOREIGN KEY ("B") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
