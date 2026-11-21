-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('READY', 'NEEDS_CHANGES', 'POSTED');

-- CreateTable
CREATE TABLE "ContentClip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "streamDate" TIMESTAMP(3),
    "note" TEXT,
    "status" "ClipStatus" NOT NULL DEFAULT 'READY',
    "feedback" TEXT,
    "tiktokAt" TIMESTAMP(3),
    "youtubeAt" TIMESTAMP(3),
    "instagramAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "handledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentClip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentClip_status_createdAt_idx" ON "ContentClip"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ContentClip" ADD CONSTRAINT "ContentClip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentClip" ADD CONSTRAINT "ContentClip_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
