# Research Findings

## 1. Best practices for using Prisma with Next.js API routes
- **Decision**: Instantiate a single Prisma client and reuse it across the application.
- **Rationale**: Creating a new Prisma client for each request can exhaust the database connection pool. A single, shared instance is more efficient.
- **Implementation**: Create a `lib/prisma.ts` file that exports a singleton `PrismaClient` instance.

## 2. Implementing authentication for the admin dashboard in a Next.js application
- **Decision**: Use NextAuth.js for authentication.
- **Rationale**: NextAuth.js is a complete open-source authentication solution for Next.js applications. It's simple to set up and supports various authentication providers.
- **Implementation**: Add NextAuth.js to the project and configure it with a credentials provider for email/password login.

## 3. Using shadcn/ui and Tailwind CSS to create a dark-themed design system based on https://thewarren.co.za
- **Decision**: Use the `next-themes` library to manage themes.
- **Rationale**: `next-themes` is a simple library that makes it easy to add dark mode to a Next.js application. It integrates well with Tailwind CSS.
- **Implementation**: Install `next-themes` and configure it to toggle a `dark` class on the `html` element. Use Tailwind's `dark:` variant to style components for dark mode. The color palette will be inspired by thewarren.co.za.
