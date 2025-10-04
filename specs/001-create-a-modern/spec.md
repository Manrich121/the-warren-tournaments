# Feature Specification: Magic: The Gathering League Tracker

**Feature Branch**: `001-create-a-modern`
**Created**: 2025-09-21
**Status**: Draft
**Input**: User description: "Create a modern web app to track player points, match history, and a dynamic prize pool for our local Magic: The Gathering league. The app is not a tournament organizer, but a results aggregator. Players will have a public, view-only experience. No login is required. They can view the leaderboard, their personal match history, and overall player stats. Admins log in to a separate secure admin dashboard to manage all data."

---
## 1. General Information
**App Name**: The Warren Tournaments

**Brief Description**: A web app to track player points, match history, and a dynamic prize pool for our local Magic: The Gathering league. The app is not a tournament organizer, but a results aggregator used in conjunction with Wizards EventLink.

---

## 2. User Scenarios & Testing *(mandatory)*

### Primary User Story
As a player in the Magic: The Gathering league, I want to view a public website that shows the current leaderboard, my personal match history, and overall player statistics, so that I can easily track my performance and the league's progress.

As an admin, I want to log in to a secure dashboard to manage player data, match results, and the prize pool, so that I can keep the public-facing website up-to-date.

### Acceptance Scenarios
1. **Given** a user navigates to the website, **When** they are on the homepage, **Then** they should see the league leaderboard and the current prize pool.
2. **Given** a user is viewing the leaderboard, **When** they click on a player's name, **Then** they should be taken to a page with that player's match history and stats.
3. **Given** an admin navigates to the admin login page, **When** they enter their credentials, **Then** they should be granted access to the admin dashboard.
4. **Given** an admin is in the dashboard, **When** they add a new match result, **Then** the public leaderboard and player stats should update accordingly.
5. **Given** an admin adds a new participant to an event, **When** the prize pool is viewed on the main page, **Then** it should increase by R50.

### Edge Cases
- How does the system handle a player leaving the league?
- What is displayed for a new player with no match history?
- How are tie-breakers displayed on the leaderboard?

---

## 3. Requirements *(mandatory)*

### User Roles & Permissions
- **Admin / Tournament Organizer**: Can log in to a secure admin dashboard to manage all data. Permissions include:
    - Create/delete leagues and events.
    - Add/remove players.
    - Enter individual match results (best out of three).
    - Manually adjust points.
    - Update prize pool.
- **Player**: Public, view-only experience with no login required. They can view:
    - The leaderboard.
    - Their personal match history.
    - Overall player stats.

### Events and Matches
- **Event Winner Determination**: The app will automatically calculate the top 3 finishers for each event based on match results.
- **Match Point System**: Win = 3 points, Draw = 1 point, Loss = 0 points.
- **League Points System**:
    - 1st place = 3 points
    - 2nd place = 2 points
    - 3rd place = 1 point
    - Event Attendance = 1 point for all players.
- **Match History Detail**: Must record the specific score (e.g., "Player A defeated Player B 2-1") and draws.

### Player Statistics & Leaderboard
- **Win Rate Calculation**: Game Win Percentage (Individual Games Won / Total Games Played).
- **Leaderboard Tie-breakers**:
    1. Head-to-head match history.
    2. Overall Match Win Rate.
    3. Opponent Match Win % (Strength of Schedule).

### Prize Pool Calculation
- The prize pool increases by R50 for every participant who registers for an event.
- The total prize pool must be displayed on the main landing page.

### Functional Requirements
- **FR-001**: The system MUST provide a public, view-only website.
- **FR-002**: The public website MUST display a leaderboard of all players, ranked by total league points and applying tie-breaker rules.
- **FR-003**: The public website MUST display individual player pages with detailed match history (scores) and statistics (win rates).
- **FR-004**: The system MUST provide a separate, secure admin dashboard.
- **FR-005**: Admins MUST be able to log in to the dashboard.
- **FR-006**: Admins MUST be able to manage leagues, events, players, and match results.
- **FR-007**: Admins MUST be able to register players using their full name.
- **FR-008**: The system MUST automatically calculate and award match points and league points.
- **FR-009**: The system MUST calculate and display a dynamic prize pool on the main page.

### Key Entities *(include if feature involves data)*
- **Player**: Represents a league participant. Attributes: full name, points, match history.
- **Match**: Represents a single game. Attributes: players involved, result (e.g., 2-1), date played.
- **Event**: Represents a single tournament. Attributes: name, date, participants, match results.
- **League**: Represents a collection of events over a season.
- **Admin**: Represents a user with privileges to manage the league data.
- **Prize Pool**: Represents the total prize money for the league.

---

## 4. Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## 5. Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
