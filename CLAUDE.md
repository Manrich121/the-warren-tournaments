# the-warren-tournaments Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-21

## Active Technologies
- Next.js (TypeScript) + shadcn/ui, tailwind CSS, Prisma (001-create-a-modern)
- TypeScript 5.9+ with Next.js 16.0.0 (App Router) + React 19.2, @tanstack/react-query 5.90, Prisma 6.17, Next-Auth 5.0, Zod 4.1 (003-fix-league-dashboard)
- PostgreSQL (via Prisma ORM) with existing League, Event, Match, Player schema (003-fix-league-dashboard)

## Project Structure
```
src/
tests/
```

## Commands
pnpm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
Next.js (TypeScript): Follow standard conventions

## Recent Changes
- 003-fix-league-dashboard: Added TypeScript 5.9+ with Next.js 16.0.0 (App Router) + React 19.2, @tanstack/react-query 5.90, Prisma 6.17, Next-Auth 5.0, Zod 4.1
- 002-player-stats-and: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 001-create-a-modern: Added Next.js (TypeScript) + shadcn/ui, tailwind CSS, Prisma

<!-- MANUAL ADDITIONS START -->
Constitution @.specify/memory/constitution.md

When adding shadcn/ui components, use `pnpx shadcn@latest add <component-name>` instead of `pnpx shadcn-ui@latest add <component-name>`

Use `pnpx` and `pnpm` instead of `npx` and `npm`.
<!-- MANUAL ADDITIONS END -->
