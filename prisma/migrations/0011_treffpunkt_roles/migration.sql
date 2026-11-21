-- AlterTable: Rolle nach bestandener Probezeit (z. B. Test-Mod → Moderator)
ALTER TABLE "Position" ADD COLUMN     "passRoleId" TEXT,
ADD COLUMN     "extraRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable: Discord-Rolle „Team-Sperre“ zur Sperre im Portal (vergeben / wieder entfernt)
ALTER TABLE "UserBan" ADD COLUMN     "roleAddedAt" TIMESTAMP(3),
ADD COLUMN     "roleRemovedAt" TIMESTAMP(3);
