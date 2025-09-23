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
- [X] **T045**: Add `round` to `Match` model and migrate the database.

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
- [X] **T033**: Implement API route for `POST /leagues` and wire up the "Add New League" form in the admin dashboard.
- [X] **T034**: Implement API route for `POST /events` and wire up the "Add New Event" form in the admin dashboard.
- [X] **T035**: Implement API route for `DELETE /leagues/{id}` and wire up the "Delete" button in the admin dashboard.
- [X] **T036**: Implement API route for `PUT /leagues/{id}` and wire up the "Edit" button in the admin dashboard.
- [X] **T037**: Implement API route for `DELETE /events/{id}` and wire up the "Delete" button in the admin dashboard.
- [X] **T038**: Implement API route for `PUT /events/{id}` and wire up the "Edit" button in the admin dashboard.
- [X] **T043**: Implement API route for `POST /matches` and wire up the "Add New Match" form in the admin dashboard.

---

## Phase 7: Admin Dashboard Refactor

- [X] **T039**: Refactor the admin dashboard into separate pages for players, leagues, events, and matches.
- [X] **T040**: Create a new dashboard page with overview cards for key metrics.
- [X] **T041**: Create a shared admin layout with navigation.
- [X] **T042**: Update the main `Header` component and add it to the root layout.
- [X] **T044**: Fix data loading for matches on the admin dashboard to correctly display player information and improve UI resilience.
- [X] **T050**: Update "Add new Match" form to use a toggle-group for score entry.
- [X] **T051**: Refactor "Add New Match" form into a dialog component.
- [X] **T052**: Move the `AddMatchDialog` component to a separate file for better code organization.
- [X] **T053**: Refactor `Add New Player` dialog to a separate component and update players page layout.
- [X] **T054**: Refactor `Add New League` dialog to a separate component and update leagues page layout.
- [X] **T055**: Refactor `Add New Event` dialog to a separate component and update events page layout.

---

## Phase 8: Data Fetching Refactor

- [X] **T046**: Setup `@tanstack/react-query` for client-side data fetching.
- [X] **T047**: Create reusable hooks for all API resources (`players`, `leagues`, `events`, `matches`, `prize-pools`).
- [X] **T048**: Create reusable mutation hooks for all `POST`, `PUT`, `DELETE` API endpoints.
- [X] **T049**: Refactor all pages and components to use the new data fetching and mutation hooks.

---

## Phase 9: UI/UX Improvements and Complete CRUD Operations

- [X] **T056**: Update dialog animations to use simple fade in with grow from 95% to 100%.
- [X] **T057**: Convert Delete buttons to icon buttons using TrashIcon across all admin pages.
- [X] **T058**: Add proper button alignment using flex containers with consistent gap spacing.
- [X] **T059**: Install and configure shadcn/ui tooltip component.
- [X] **T060**: Convert Edit buttons to icon buttons using PencilIcon across all admin pages.
- [X] **T061**: Add tooltips for both Edit and Delete buttons on hover across all admin pages.
- [X] **T062**: Create `useDeleteMatch` and `useUpdateMatch` hooks with corresponding API endpoints.
- [X] **T063**: Add complete Edit and Delete functionality to matches admin page with form dialogs.
- [X] **T064**: Create `useDeletePlayer` and `useUpdatePlayer` hooks with corresponding API endpoints.
- [X] **T065**: Update `AddPlayerDialog` component to function as both add and edit dialog.
- [X] **T066**: Add complete Edit and Delete functionality to players admin page with consistent UI.

---

## Phase 10: Database Schema Migration to CUID

- [X] **T067**: Remove previous database migrations and update Prisma schema to use CUID for all ID fields.
- [X] **T068**: Reset database and create new initial migration with CUID-based schema.
- [X] **T069**: Replace manual TypeScript types with Prisma-generated types across the application.
- [X] **T070**: Update all API routes to handle string IDs instead of numeric IDs (remove parseInt calls).
- [X] **T071**: Update frontend components and hooks to work with string IDs instead of numeric IDs.
- [X] **T072**: Update business logic functions to handle string IDs (e.g., calculatePlayerStats).
- [~] **T073**: Fix all TypeScript compilation errors related to ID type changes (mostly complete, some minor issues remain).
- [ ] **T074**: Test all CRUD operations with the new CUID-based schema.
