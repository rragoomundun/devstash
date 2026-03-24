import { config } from "dotenv"
config()

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const SYSTEM_TYPES = [
  { id: "stype_snippet", name: "Snippet", icon: "Code",       color: "#3b82f6" },
  { id: "stype_prompt",  name: "Prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { id: "stype_command", name: "Command", icon: "Terminal",   color: "#f97316" },
  { id: "stype_note",    name: "Note",    icon: "StickyNote", color: "#fde047" },
  { id: "stype_file",    name: "File",    icon: "File",       color: "#6b7280" },
  { id: "stype_image",   name: "Image",   icon: "Image",      color: "#ec4899" },
  { id: "stype_link",    name: "Link",    icon: "Link",       color: "#10b981" },
]

// Fixed IDs for idempotency
const T = {
  snippet: "stype_snippet",
  prompt:  "stype_prompt",
  command: "stype_command",
  note:    "stype_note",
  file:    "stype_file",
  image:   "stype_image",
  link:    "stype_link",
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    // ── System item types ──────────────────────────────────────────────────
    const existingTypes = await prisma.itemType.count({ where: { isSystem: true } })
    if (existingTypes === 0) {
      await prisma.itemType.createMany({
        data: SYSTEM_TYPES.map(t => ({ ...t, isSystem: true, userId: null })),
      })
      console.log(`✓ Seeded ${SYSTEM_TYPES.length} system item types`)
    } else {
      console.log(`  System item types already seeded (${existingTypes})`)
    }

    // ── Demo user ──────────────────────────────────────────────────────────
    let user = await prisma.user.findUnique({ where: { email: "demo@devstash.io" } })
    if (!user) {
      const hashedPassword = await bcrypt.hash("12345678", 12)
      user = await prisma.user.create({
        data: {
          email: "demo@devstash.io",
          name: "Demo User",
          hashedPassword,
          isPro: false,
          emailVerified: new Date(),
        },
      })
      console.log("✓ Created demo user (demo@devstash.io / 12345678)")
    } else {
      console.log("  Demo user already exists")
    }

    // Skip collections if already seeded
    const existingCollections = await prisma.collection.count({ where: { userId: user.id } })
    if (existingCollections > 0) {
      console.log(`  Collections already seeded (${existingCollections})`)
      return
    }

    // ── React Patterns ─────────────────────────────────────────────────────
    await prisma.collection.create({
      data: {
        name: "React Patterns",
        description: "Reusable React patterns and hooks",
        userId: user.id,
        items: {
          create: [
            {
              item: {
                create: {
                  title: "useDebounce & useLocalStorage",
                  description: "Custom hooks for debouncing values and persisting state to localStorage",
                  contentType: "TEXT",
                  language: "typescript",
                  userId: user.id,
                  itemTypeId: T.snippet,
                  content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })
  const set = (val: T) => {
    setValue(val)
    window.localStorage.setItem(key, JSON.stringify(val))
  }
  return [value, set] as const
}`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Context Provider Pattern",
                  description: "Compound component with typed React context",
                  contentType: "TEXT",
                  language: "typescript",
                  userId: user.id,
                  itemTypeId: T.snippet,
                  content: `import { createContext, useContext, useState, ReactNode } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "TypeScript Utility Types",
                  description: "Handy generic utility types for everyday TypeScript",
                  contentType: "TEXT",
                  language: "typescript",
                  userId: user.id,
                  itemTypeId: T.snippet,
                  content: `// Deep partial — make all nested properties optional
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

// Awaited return type of an async function
type AsyncReturn<T extends (...args: unknown[]) => Promise<unknown>> =
  Awaited<ReturnType<T>>

// Strict omit — compile error on unknown keys
type StrictOmit<T, K extends keyof T> = Omit<T, K>

// Prettify — expand intersections for readable hover types
type Prettify<T> = { [K in keyof T]: T[K] } & {}`,
                },
              },
            },
          ],
        },
      },
    })
    console.log(`✓ Created "React Patterns" (3 snippets)`)

    // ── AI Workflows ───────────────────────────────────────────────────────
    await prisma.collection.create({
      data: {
        name: "AI Workflows",
        description: "AI prompts and workflow automations",
        userId: user.id,
        items: {
          create: [
            {
              item: {
                create: {
                  title: "Code Review Prompt",
                  description: "Structured prompt for thorough AI code reviews",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.prompt,
                  content: `Review the following code and provide feedback on:

1. **Correctness** — Are there any bugs, edge cases, or logic errors?
2. **Security** — Are there any vulnerabilities (injection, auth bypass, data exposure)?
3. **Performance** — Any unnecessary re-renders, N+1 queries, or inefficient algorithms?
4. **Readability** — Is the code clear, well-named, and easy to maintain?
5. **Patterns** — Does it follow best practices for the language/framework?

For each issue found, provide:
- The specific line or section
- What the problem is
- A suggested fix with example code

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Documentation Generator",
                  description: "Generate JSDoc comments and README sections from code",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.prompt,
                  content: `Generate comprehensive documentation for the following code:

1. **JSDoc comments** for every exported function, class, and type including:
   - @param with types and descriptions
   - @returns with type and description
   - @throws if applicable
   - @example with realistic usage

2. **README section** including:
   - Brief description of what this module does
   - Installation / import instructions
   - Usage examples
   - API reference table

Keep descriptions concise but complete. Use plain language, not jargon.

Code:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Refactoring Assistant",
                  description: "Systematic refactoring with clear before/after",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.prompt,
                  content: `Refactor the following code with these goals:
- Improve readability without changing behavior
- Remove duplication (DRY)
- Simplify complex conditionals
- Extract reusable helpers
- Apply consistent naming conventions

Requirements:
- Do NOT change the external API or function signatures
- Do NOT add new features
- Explain each change you made and why

Provide the output as:
1. Refactored code block
2. Bullet list of changes made

Code to refactor:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
                },
              },
            },
          ],
        },
      },
    })
    console.log(`✓ Created "AI Workflows" (3 prompts)`)

    // ── DevOps ─────────────────────────────────────────────────────────────
    await prisma.collection.create({
      data: {
        name: "DevOps",
        description: "Infrastructure and deployment resources",
        userId: user.id,
        items: {
          create: [
            {
              item: {
                create: {
                  title: "Dockerfile for Node.js",
                  description: "Production-ready multi-stage Dockerfile for Node.js apps",
                  contentType: "TEXT",
                  language: "dockerfile",
                  userId: user.id,
                  itemTypeId: T.snippet,
                  content: `# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Docker build & push to registry",
                  description: "Build image, tag, and push to container registry",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.command,
                  content: `IMAGE=ghcr.io/USERNAME/APP_NAME
TAG=$(git rev-parse --short HEAD)

docker build -t $IMAGE:$TAG -t $IMAGE:latest .
docker push $IMAGE:$TAG
docker push $IMAGE:latest`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Docker Documentation",
                  description: "Official Docker docs — references, guides, and CLI reference",
                  contentType: "URL",
                  url: "https://docs.docker.com",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
            {
              item: {
                create: {
                  title: "GitHub Actions Documentation",
                  description: "Automate workflows with GitHub Actions — CI/CD, deployments, and more",
                  contentType: "URL",
                  url: "https://docs.github.com/en/actions",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
          ],
        },
      },
    })
    console.log(`✓ Created "DevOps" (1 snippet, 1 command, 2 links)`)

    // ── Terminal Commands ──────────────────────────────────────────────────
    await prisma.collection.create({
      data: {
        name: "Terminal Commands",
        description: "Useful shell commands for everyday development",
        userId: user.id,
        items: {
          create: [
            {
              item: {
                create: {
                  title: "Git branch cleanup",
                  description: "Delete merged local branches and prune remote tracking refs",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.command,
                  content: `# Delete all local branches already merged into main
git branch --merged main | grep -v '\\* main' | xargs git branch -d

# Prune stale remote-tracking refs
git fetch --prune

# Show branches not yet merged
git branch --no-merged main`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Docker system cleanup",
                  description: "Free up disk space by removing unused Docker resources",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.command,
                  content: `# Remove stopped containers, dangling images, unused networks
docker system prune -f

# Also remove unused volumes (caution: data loss)
docker system prune -f --volumes

# Remove all unused images (not just dangling)
docker image prune -a -f`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Kill process on port",
                  description: "Find and kill whatever is listening on a given port",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.command,
                  content: `PORT=3000

# Find PID
lsof -ti tcp:$PORT

# Kill it
kill -9 $(lsof -ti tcp:$PORT)

# One-liner
lsof -ti tcp:$PORT | xargs kill -9`,
                },
              },
            },
            {
              item: {
                create: {
                  title: "npm / pnpm utilities",
                  description: "Handy package manager commands for auditing and cleaning",
                  contentType: "TEXT",
                  userId: user.id,
                  itemTypeId: T.command,
                  content: `# List outdated packages
npm outdated
pnpm outdated

# Clean install (delete node_modules first)
rm -rf node_modules && npm ci

# Check for security vulnerabilities
npm audit
npm audit fix

# List all installed package sizes (sorted)
du -sh node_modules/* | sort -rh | head -20`,
                },
              },
            },
          ],
        },
      },
    })
    console.log(`✓ Created "Terminal Commands" (4 commands)`)

    // ── Design Resources ───────────────────────────────────────────────────
    await prisma.collection.create({
      data: {
        name: "Design Resources",
        description: "UI/UX resources and references",
        userId: user.id,
        items: {
          create: [
            {
              item: {
                create: {
                  title: "Tailwind CSS Docs",
                  description: "Official Tailwind CSS documentation — utilities, configuration, and guides",
                  contentType: "URL",
                  url: "https://tailwindcss.com/docs",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
            {
              item: {
                create: {
                  title: "shadcn/ui",
                  description: "Beautifully designed components built with Radix UI and Tailwind CSS",
                  contentType: "URL",
                  url: "https://ui.shadcn.com",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Material Design 3",
                  description: "Google's open-source design system with components, guidelines, and tokens",
                  contentType: "URL",
                  url: "https://m3.material.io",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
            {
              item: {
                create: {
                  title: "Lucide Icons",
                  description: "Beautiful & consistent icon library — open-source, MIT license",
                  contentType: "URL",
                  url: "https://lucide.dev/icons",
                  userId: user.id,
                  itemTypeId: T.link,
                },
              },
            },
          ],
        },
      },
    })
    console.log(`✓ Created "Design Resources" (4 links)`)

    console.log("\nSeed complete.")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
