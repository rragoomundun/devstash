import 'dotenv/config';
import * as readline from 'readline';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = 'demo@devstash.io';

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const force = process.argv.includes('--force');

  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    console.error(`✗ Demo user (${DEMO_EMAIL}) not found — aborting.`);
    process.exit(1);
  }

  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true, name: true },
  });

  if (usersToDelete.length === 0) {
    console.log('No other users found. Nothing to delete.');
    return;
  }

  console.log(`\nUsers to delete (${usersToDelete.length}):`);
  usersToDelete.forEach((u) =>
    console.log(`  - ${u.name ?? '(no name)'} <${u.email ?? '(no email)'}>`)
  );

  if (!force) {
    const ok = await confirm(
      '\nThis will permanently delete these users and all their content. Continue?'
    );
    if (!ok) {
      console.log('Aborted.');
      return;
    }
  }

  const userIds = usersToDelete.map((u) => u.id);
  const userEmails = usersToDelete.map((u) => u.email).filter(Boolean) as string[];

  // Delete verification tokens — not FK-linked to User, keyed by email (identifier)
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: userEmails } },
  });

  // Delete users — cascades to accounts, sessions, items, collections, itemTypes
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });

  // Clean up tags that are now orphaned (no onDelete cascade from Item → Tag)
  const orphanedTags = await prisma.tag.findMany({
    where: { items: { none: {} } },
    select: { id: true },
  });
  const deletedTags =
    orphanedTags.length > 0
      ? await prisma.tag.deleteMany({
          where: { id: { in: orphanedTags.map((t) => t.id) } },
        })
      : { count: 0 };

  console.log(`\n✓ Deleted ${deletedUsers.count} user(s)`);
  if (deletedTokens.count > 0)
    console.log(`✓ Deleted ${deletedTokens.count} verification token(s)`);
  if (deletedTags.count > 0) console.log(`✓ Deleted ${deletedTags.count} orphaned tag(s)`);
  console.log('\nDone. Demo user and their content are intact.');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
