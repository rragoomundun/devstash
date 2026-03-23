import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = { connectionString: process.env.DATABASE_URL! };
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing database connection...\n');

  // Item types
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: 'asc' } });
  console.log(`✓ ItemType — ${itemTypes.length} rows`);
  itemTypes.forEach((t) => console.log(`    ${t.name} (${t.color})`));

  // Users
  const userCount = await prisma.user.count();
  console.log(`✓ User — ${userCount} rows`);

  // Items
  const itemCount = await prisma.item.count();
  console.log(`✓ Item — ${itemCount} rows`);

  // Collections
  const collectionCount = await prisma.collection.count();
  console.log(`✓ Collection — ${collectionCount} rows`);

  console.log('\nAll checks passed.');
}

main()
  .catch((e) => {
    console.error('Connection failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
