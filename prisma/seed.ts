import { config } from "dotenv"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import ws from "ws"

config() // load .env before anything uses DATABASE_URL

neonConfig.webSocketConstructor = ws

const systemItemTypes = [
  { name: "Snippet", icon: "Code",       color: "#3b82f6" },
  { name: "Prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { name: "Command", icon: "Terminal",   color: "#f97316" },
  { name: "Note",    icon: "StickyNote", color: "#fde047" },
  { name: "File",    icon: "File",       color: "#6b7280" },
  { name: "Image",   icon: "Image",      color: "#ec4899" },
  { name: "Link",    icon: "Link",       color: "#10b981" },
]

async function main() {
  // Create inside function so DATABASE_URL is available after config()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! }) as any
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const existing = await prisma.itemType.count({ where: { isSystem: true } })

    if (existing > 0) {
      console.log(`${existing} system item types already exist — skipping.`)
      return
    }

    await prisma.itemType.createMany({
      data: systemItemTypes.map(t => ({ ...t, isSystem: true, userId: null })),
    })

    console.log(`Seeded ${systemItemTypes.length} system item types.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
