# Tasks for: Magic: The Gathering League Tracker

**Feature Branch**: `001-create-a-modern`
**Implementation Plan**: [plan.md](plan.md)
**Quickstart**: [quickstart.md](quickstart.md)

This document outlines the tasks required to implement the Magic: The Gathering League Tracker.

---

## Phase 1: Project Setup

- **T001**: Initialize a new Next.js project with TypeScript.
- **T002**: Install dependencies: `prisma`, `next-auth`, `shadcn/ui`, `tailwindcss`, `next-themes`, `jest`, `@testing-library/react`, `@testing-library/jest-dom`.
- **T003**: Configure Prisma and connect to the PostgreSQL database.
- **T004**: Set up Tailwind CSS and shadcn/ui.
- **T005**: Configure Jest and React Testing Library.

---

## Phase 2: Data Models

- **T006**: Create the Prisma schema based on `data-model.md`.
- **T007**: Generate the Prisma client.

---

## Phase 3: Backend Development

- **T008**: Implement API route for `GET /players`.
- **T009**: Implement API route for `GET /players/{id}`.
- **T010**: Implement API route for `GET /matches`.
- **T011**: Implement API route for `GET /matches/{id}`.
- **T012**: Implement API route for `GET /events`.
- **T013**: Implement API route for `GET /events/{id}`.
- **T014**: Implement API route for `GET /leagues`.
- **T015**: Implement API route for `GET /leagues/{id}`.
- **T016**: Implement API route for `POST /admin/login`.
- **T017**: Implement API route for `POST /admin/logout`.
- **T018**: Implement API route for `GET /prize-pool`.
- **T019**: Implement admin authentication using NextAuth.js.

---

## Phase 4: Frontend Development

- **T020**: Create the public-facing leaderboard page.
- **T021**: Create the public-facing player stats page.
- **T022**: Create the admin login page.
- **T023**: Create the admin dashboard for managing players.
- **T024**: Create the admin dashboard for managing matches.
- **T025**: Create the admin dashboard for managing events.
- **T026**: Create the admin dashboard for managing leagues.
- **T027**: Implement the prize pool display on the main page.
- **T028**: Implement the dark theme using `next-themes`.

---

## Phase 5: Testing

- **T029**: Write integration tests for the user scenarios in `quickstart.md`.
- **T030**: Write unit tests for critical components and utility functions.

---

## Parallel Execution Examples

The following tasks can be run in parallel:

- `T008` - `T018` (API route implementation)
- `T020` - `T028` (Frontend development)

Example:
```bash
# Terminal 1
gemini -p "Implement API route for GET /players"

# Terminal 2
gemini -p "Implement API route for GET /matches"
```
