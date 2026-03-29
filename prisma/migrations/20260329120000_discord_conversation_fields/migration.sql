-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "discordChannelId" TEXT,
ADD COLUMN     "discordUserId" TEXT;

-- CreateIndex
CREATE INDEX "conversations_discordChannelId_discordUserId_idx" ON "conversations"("discordChannelId", "discordUserId");

-- One active Discord thread per channel + Discord user (web rows keep both NULL)
CREATE UNIQUE INDEX "conversations_discord_channel_user_key" ON "conversations" ("discordChannelId", "discordUserId") WHERE "discordChannelId" IS NOT NULL AND "discordUserId" IS NOT NULL;
