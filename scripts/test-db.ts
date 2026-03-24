import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing database connection...\n');

  // ── System item types ────────────────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: 'asc' } });
  console.log(`✓ ItemType — ${itemTypes.length} rows`);
  itemTypes.forEach((t) => console.log(`    ${t.name} (${t.color})`));

  // ── Demo user ────────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({ where: { email: 'demo@devstash.io' } });
  if (!user) {
    console.log('\n✗ Demo user not found — run the seed first');
    return;
  }
  console.log(`\n✓ Demo user — ${user.name} <${user.email}>`);
  console.log(`    isPro: ${user.isPro}  |  emailVerified: ${user.emailVerified?.toISOString() ?? 'null'}`);

  // ── Items per type ───────────────────────────────────────────────────────
  const itemCountsByType = await prisma.item.groupBy({
    by: ['itemTypeId'],
    where: { userId: user.id },
    _count: { id: true },
  });
  const typeMap = Object.fromEntries(itemTypes.map((t) => [t.id, t.name]));
  console.log(`\n✓ Items — ${itemCountsByType.reduce((s, r) => s + r._count.id, 0)} total`);
  itemCountsByType.forEach((r) =>
    console.log(`    ${typeMap[r.itemTypeId] ?? r.itemTypeId}: ${r._count.id}`)
  );

  // ── Collections with items ───────────────────────────────────────────────
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      items: {
        include: { item: { include: { itemType: true } } },
      },
    },
  });
  console.log(`\n✓ Collections — ${collections.length} total`);
  collections.forEach((col) => {
    console.log(`\n  📁 ${col.name} (${col.items.length} items)`);
    if (col.description) console.log(`     ${col.description}`);
    col.items.forEach(({ item }) =>
      console.log(`     • [${item.itemType.name}] ${item.title}`)
    );
  });

  console.log('\nAll checks passed.');
}

main()
  .catch((e) => {
    console.error('Connection failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
