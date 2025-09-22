<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- Added sections: Code Quality Standards, Performance Requirements, User Experience Consistency
- Enhanced sections: Testing Standards (expanded from Testing), Component-Based Architecture (added quality standards)
- Templates requiring updates:
  - ⚠ .specify/templates/plan-template.md
  - ⚠ .specify/templates/spec-template.md
  - ⚠ .specify/templates/tasks-template.md
-->

# The Warren Tournaments Constitution

## Core Principles

### I. Technology Stack
- **Frontend**: Next.js (React) for a server-rendered Single Page Application (SPA).
- **Backend**: Next.js API routes for serverless functions.
- **Database**: PostgreSQL as the relational database.
- **Styling**: Tailwind CSS for utility-first styling.
- **ORM**: Prisma as the Object-Relational Mapper for database access.
- **Package Manager**: pnpm MUST be used for all dependency management.
- **TypeScript**: All new code MUST be written in TypeScript with strict type checking enabled.

### II. Component-Based Architecture
- All UI elements MUST be built as reusable React components.
- Components MUST be functional components using React Hooks.
- Each component MUST have a clear, single responsibility.
- Components MUST follow the established file structure: `src/components/` for shared components, `src/components/ui/` for base UI primitives.
- Component props MUST be typed with TypeScript interfaces or types.
- Components SHOULD use composition over inheritance patterns.

### III. Code Quality Standards
- All code MUST pass ESLint checks using the `next/core-web-vitals` configuration.
- Code formatting MUST be enforced using Prettier with the project's configuration.
- TypeScript strict mode MUST be enabled and all type errors resolved.
- Code MUST follow consistent naming conventions:
  * Components: PascalCase (e.g., `UserProfile.tsx`)
  * Functions and variables: camelCase (e.g., `getUserData`)
  * Constants: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)
  * Files: kebab-case for utilities, PascalCase for components
- Complex functions MUST include JSDoc comments explaining purpose, parameters, and return values.
- Magic numbers and strings MUST be extracted to named constants.
- Dead code MUST be removed before merging.

### IV. Testing Standards
- Unit tests MUST be written for all critical components and utility functions using Jest and React Testing Library.
- Test coverage MUST be at least 80% for critical business logic.
- Integration tests MUST be written for user authentication flows and data persistence operations.
- Components with complex user interactions MUST have comprehensive test coverage including edge cases.
- Tests MUST follow the Arrange-Act-Assert pattern and have descriptive names.
- Mock data and test utilities SHOULD be centralized and reusable.
- End-to-end tests MAY be written for critical user journeys using Playwright or Cypress.
- All tests MUST pass before code can be merged.

### V. User Experience Consistency
- UI components MUST follow a consistent design system using Tailwind CSS classes.
- Interactive elements MUST provide appropriate feedback (loading states, hover effects, disabled states).
- Forms MUST include proper validation with clear error messages using react-hook-form and Zod.
- Navigation MUST be consistent across all pages with clear visual hierarchy.
- Responsive design MUST work across desktop, tablet, and mobile viewports.
- Accessibility MUST follow WCAG 2.1 AA standards:
  * Proper semantic HTML structure
  * Keyboard navigation support
  * Screen reader compatibility
  * Sufficient color contrast ratios
- Loading states MUST be implemented for all asynchronous operations.
- Error states MUST provide actionable feedback to users.

### VI. State Management
- Client-side state SHOULD be managed with React Context for simple state or Zustand for complex state.
- Server-side state (data fetching) MUST be handled with a library like SWR or React Query.
- Global state SHOULD be minimized; prefer component-level state when possible.
- State updates MUST be immutable and follow React best practices.

### VII. Database Management
- Database schema changes MUST be managed through Prisma Migrate.
- Direct database access is prohibited; all access MUST go through the Prisma client.
- Database queries MUST include proper error handling and transaction management where appropriate.
- Sensitive data MUST be properly encrypted at rest and in transit.

### VIII. API Design
- APIs MUST follow RESTful principles with proper HTTP methods and status codes.
- API routes MUST be defined in the `src/app/api/` directory (App Router structure).
- All API responses MUST be in JSON format with consistent error structures.
- Input validation MUST be performed using Zod schemas.
- API endpoints MUST include proper authentication and authorization checks.
- Rate limiting SHOULD be implemented for public-facing endpoints.

## Technology Stack and Architecture

This project is a modern web application leveraging the Next.js framework for both frontend and backend development. The architecture is designed to be scalable, maintainable, and efficient with emphasis on performance and user experience.

- **Next.js**: Provides a robust framework for building server-rendered React applications, with features like App Router, API routes, and optimized performance.
- **React**: A declarative, component-based library for building user interfaces with strict TypeScript typing.
- **PostgreSQL**: A powerful, open-source object-relational database system optimized for performance.
- **Prisma**: A next-generation ORM that provides type-safe database access and migration management.
- **Tailwind CSS**: A utility-first CSS framework enabling consistent design system implementation.
- **TypeScript**: Provides static type checking and enhanced developer experience.
- **Jest & React Testing Library**: Comprehensive testing framework for unit and integration tests.

## Development Workflow and Quality Assurance

### Code Submission Process
- All code changes MUST be submitted as pull requests with descriptive titles and descriptions.
- All pull requests MUST be reviewed by at least one other developer before merging.
- All pull requests MUST pass automated checks including:
  * ESLint code quality checks
  * Prettier code formatting verification
  * TypeScript type checking
  * Jest test suite execution
  * Build process validation

### Quality Gates
- Code coverage MUST meet minimum thresholds before merging.
- Performance regressions MUST be identified and addressed.
- Accessibility compliance MUST be verified for UI changes.
- Breaking changes MUST be documented and communicated.

### Technical Decision Making
- Architecture decisions MUST be guided by the principles in this constitution.
- Performance impact MUST be considered for all significant changes.
- User experience consistency MUST be maintained across features.
- Security implications MUST be evaluated for all code changes.

## Governance

### Constitution Authority
- This constitution is the single source of truth for all development practices.
- All technical decisions MUST align with the principles outlined herein.
- Deviations from constitutional principles require explicit justification and approval.

### Amendment Process
- Amendments to this constitution require a pull request with detailed rationale.
- Constitutional changes MUST be approved by project maintainers.
- Version bumps MUST follow semantic versioning (MAJOR.MINOR.PATCH).
- All stakeholders MUST be notified of constitutional changes.

### Compliance and Enforcement
- All pull requests and code reviews MUST verify compliance with this constitution.
- Violations of constitutional principles MUST be addressed before code merge.
- Regular constitution compliance audits SHOULD be conducted.
- Training on constitutional principles MUST be provided to new team members.

**Version**: 1.1.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-01-22
