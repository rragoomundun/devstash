# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links, and custom types.

## Context Files

Read the following to get the full context of the project:

- @AGENTS.md
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm start` — serve production build

## Tech Stack

- **Next.js 16.2** (App Router) with React 19 and React Compiler enabled
- **TypeScript** (strict mode)
- **Tailwind CSS v4** via PostCSS
- **ESLint 9** flat config with next/core-web-vitals and next/typescript

## Project Structure

- `src/app/` — App Router: pages, layouts, and global styles
- `@/*` path alias maps to `./src/*`

## Key Conventions

- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in the root layout
