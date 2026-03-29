/**
 * Prisma seed: technical User for Discord threads (DISCORD_BOT_CONVERSATION_USER_ID)
 * Run: docker compose run --rm app npx prisma db seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const DISCORD_SYSTEM_EMAIL = 'discord-bot@system.internal';

async function main() {
  const passwordHash = await bcrypt.hash('__no_login_discord_system_user__', 10);
  const user = await prisma.user.upsert({
    where: { email: DISCORD_SYSTEM_EMAIL },
    create: {
      email: DISCORD_SYSTEM_EMAIL,
      name: 'Discord',
      surname: 'System',
      passwordHash,
    },
    update: {},
  });
  console.log(`Discord thread owner user id - set DISCORD_BOT_CONVERSATION_USER_ID=${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
