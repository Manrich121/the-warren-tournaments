# Tasks for: Magic: The Gathering League Tracker

**Feature Branch**: `001-create-a-modern`
**Implementation Plan**: [plan.md](plan.md)
**Quickstart**: [quickstart.md](quickstart.md)

This document outlines the tasks required to implement the Magic: The Gathering League Tracker.

---

## Phase 1: Project Setup

- [X] **T001**: Initialize a new Next.js project with TypeScript.
- [X] **T002**: Install dependencies: `prisma`, `next-auth`, `shadcn/ui`, `tailwindcss`, `next-themes`, `jest`, `@testing-library/react`, `@testing-library/jest-dom`.
- [X] **T003**: Configure Prisma and connect to the PostgreSQL database.
- [X] **T004**: Set up Tailwind CSS and shadcn/ui.
- [X] **T005**: Configure Jest and React Testing Library.

---

## Phase 2: Data Models

- [X] **T006**: Create the Prisma schema based on `data-model.md`.
- [X] **T007**: Generate the Prisma client.

---

## Phase 3: Backend Development

- [X] **T008**: Implement API route for `GET /players`.
- [X] **T009**: Implement API route for `GET /players/{id}`.
- [X] **T010**: Implement API route for `GET /matches`.
- [X] **T011**: Implement API route for `GET /matches/{id}`.
- [X] **T012**: Implement API route for `GET /events`.
- [X] **T013**: Implement API route for `GET /events/{id}`.
- [X] **T014**: Implement API route for `GET /leagues`.
- [X] **T015**: Implement API route for `GET /leagues/{id}`.
- [X] **T016**: Implement API route for `POST /admin/login`.
- [X] **T017**: Implement API route for `POST /admin/logout`.
- [X] **T018**: Implement API route for `GET /prize-pool`.
- [X] **T019**: Implement admin authentication using NextAuth.js.

---

## Phase 4: Frontend Development

- [X] **T020**: Create the public-facing leaderboard page.
- [X] **T021**: Create the public-facing player stats page.
- [X] **T022**: Create the admin login page.
- [X] **T023**: Create the admin dashboard for managing players.
- [X] **T024**: Create the admin dashboard for managing matches.
- [X] **T025**: Create the admin dashboard for managing events.
- [X] **T026**: Create the admin dashboard for managing leagues.
- [X] **T027**: Implement the prize pool display on the main page.
- [X] **T028**: Implement the dark theme using `next-themes`.

---

## Phase 5: Testing

- [X] **T029**: Write integration tests for the user scenarios in `quickstart.md`.
- [X] **T030**: Write unit tests for critical components and utility functions.

---

## Phase 6: CRUD Operations

- [X] **T031**: Implement API route for `POST /players` and wire up the "Add New Player" form in the admin dashboard.
- [X] **T032**: Move the "Add New Player" form on admin dashboard to a dialog.