# Feature Specification: Fix League Dashboard and Leaderboard Display

**Feature Branch**: `003-fix-league-dashboard`
**Created**: 2025-11-02
**Status**: Draft
**Input**: User description: "The Active league concept is problematic and breaks the home / dashboard page. The home page should display a leaderboard of the most recent league, which could also be the active league, determinded by comparing the league's end date with the current date. The home page should allow easy viewing the leaderboard of the current, most recent or any previous league. The Quick Stats cards should display the correct stats."

## Clarifications

### Session 2025-11-02

- Q: When multiple leagues have the same end date, which attribute should be the definitive tie-breaker? → A: Most recently created (newest createdAt timestamp wins)
- Q: How should players be ordered in the leaderboard display? → A: Players are ranked based on their League points, if two or more players are tied, use tie-breakers in the order of match win rate, opponents' match win rate, game win rate, opponents' game win rate across the events in the particular league
- Q: Where should the league selector be positioned on the home page? → A: Above the leaderboard as a prominent selector with clear label
- Q: What specific message should be displayed when a league has no matches or participants? → A: No matches played in this league yet
- Q: What should the league selector label be and how should league options be formatted? → A: Label: "Select League" with options showing league name and date range

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Most Recent League Leaderboard (Priority: P1)

Users visit the home page and immediately see the leaderboard for the most recent league (which may be active or recently completed), providing instant visibility into the latest tournament standings without manual navigation.

**Why this priority**: This is the primary use case and delivers immediate value by fixing the broken dashboard. Users can see current or most recent league standings instantly.

**Independent Test**: Can be fully tested by visiting the home page and verifying that a leaderboard is displayed showing players from the most recent league (determined by end date). Delivers core value of showing tournament standings.

**Acceptance Scenarios**:

1. **Given** multiple leagues exist with different end dates, **When** user visits the home page, **Then** the leaderboard displays players from the league with the most recent end date
2. **Given** an active league exists (current date is between start and end dates), **When** user visits the home page, **Then** the leaderboard displays the active league standings
3. **Given** only past leagues exist (all end dates before current date), **When** user visits the home page, **Then** the leaderboard displays the league with the most recent past end date
4. **Given** no leagues exist in the system, **When** user visits the home page, **Then** the dashboard displays gracefully without a leaderboard section

---

### User Story 2 - View Quick Stats for Current/Recent League (Priority: P1)

Users see accurate Quick Stats cards on the home page that reflect the data for the currently selected league (most recent by default), enabling them to understand league participation and activity at a glance.

**Why this priority**: Broken stats undermine user trust and make the dashboard unusable. This must be fixed alongside P1 to provide a complete working dashboard.

**Independent Test**: Can be tested by verifying that Quick Stats cards (Total Leagues, Total Events, Total Players, Total Matches) display correct values for the selected league. Delivers value by providing accurate league overview.

**Acceptance Scenarios**:

1. **Given** the most recent league is displayed, **When** user views Quick Stats cards, **Then** each card shows correct totals: league count (1 for selected), events in this league, unique players who participated, and total matches played
2. **Given** a league has 3 events with 5 unique players across 12 matches, **When** user views the Quick Stats, **Then** cards display "1 active" league, "3" events, "5" players, "12" matches
3. **Given** user switches to view a different league, **When** Quick Stats update, **Then** the displayed numbers reflect only that league's data

---

### User Story 3 - Switch Between League Leaderboards (Priority: P2)

Users can select any previous league from a prominent selector positioned above the leaderboard to view its historical leaderboard and stats, enabling comparison of performance across different tournament periods.

**Why this priority**: Enhances usability by allowing historical analysis, but the default view (P1) provides core functionality.

**Independent Test**: Can be tested by selecting different leagues from a selector and verifying that the leaderboard and Quick Stats update to show data for the selected league. Delivers value by enabling historical league comparison.

**Acceptance Scenarios**:

1. **Given** multiple leagues exist, **When** user selects a different league from the dropdown, **Then** the leaderboard updates to show players and standings from the selected league
2. **Given** user has selected a past league, **When** user selects "Most Recent" or "Current" option, **Then** the display returns to showing the most recent league leaderboard
3. **Given** user selects a league with no matches/events, **When** viewing the leaderboard, **Then** system displays the message "No matches played in this league yet"

---

### Edge Cases

- What happens when a league's end date exactly matches the current date/time?
  - System should treat as active (inclusive comparison: endDate >= currentDate)
- What happens when two leagues have identical end dates?
  - System MUST use the creation timestamp (createdAt) as tie-breaker, selecting the most recently created league to ensure consistent display
- How does system handle timezone differences in date comparisons?
  - Use UTC for all date comparisons to ensure consistency across regions
- What happens when there are no players in the most recent league?
  - Display an empty leaderboard with the message "No matches played in this league yet"
- What happens if the Quick Stats calculation encounters missing data (e.g., events without matches)?
  - Display zero for missing counts rather than errors
- What happens when two or more players are tied on all ranking criteria (league points and all tie-breakers)?
  - Players with identical statistics should share the same rank position, displayed in alphabetical order by player name

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST determine the most recent league by comparing all league end dates with the current date and selecting the league with the latest end date
- **FR-002**: System MUST display a leaderboard on the home page showing players and standings from the most recent league (whether active or past)
- **FR-003**: System MUST calculate Quick Stats (Total Leagues, Total Events, Total Players, Total Matches) based on the currently selected/displayed league, not global totals
- **FR-004**: System MUST provide a prominent league selector positioned above the leaderboard with the label "Select League", displaying options that show each league's name and date range, allowing users to select and view leaderboards from any league
- **FR-005**: System MUST update both the leaderboard and Quick Stats when a user switches to a different league
- **FR-006**: System MUST handle cases where no leagues exist by displaying the dashboard gracefully without errors
- **FR-007**: System MUST handle cases where the selected league has no events or matches by displaying the message "No matches played in this league yet"
- **FR-008**: System MUST use inclusive date comparison (startDate <= now AND endDate >= now) when determining if a league is active
- **FR-009**: Quick Stats "Total Leagues" card MUST display the count of all leagues in the system (not just the selected league)
- **FR-010**: Quick Stats other cards (Events, Players, Matches) MUST display counts specific to the currently displayed league
- **FR-011**: System MUST use creation timestamp (createdAt) as tie-breaker when multiple leagues have identical end dates, selecting the most recently created league
- **FR-012**: Leaderboard MUST rank players by league points in descending order (highest points first)
- **FR-013**: When players have equal league points, system MUST apply tie-breakers in this order: match win rate, opponents' match win rate, game win rate, opponents' game win rate (all calculated across events in the particular league)

### Key Entities

- **League**: Tournament period with start date, end date, name; determines which leaderboard to display based on recency
- **Leaderboard Entry**: Player statistics within a specific league including league points, match win rate, game win rate, opponents' match win rate, opponents' game win rate; used for ranking with cascading tie-breakers
- **Event**: Tournament event belonging to a specific league
- **Match**: Game record associated with an event, contributes to player statistics within the league
- **Player**: Participant in matches; appears in leaderboard when they have matches in the selected league

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users visiting the home page see a leaderboard within 2 seconds that displays data from the most recent league (active or past)
- **SC-002**: Quick Stats cards display accurate counts that match the selected league's actual data with 100% accuracy
- **SC-003**: Users can switch between different league leaderboards and see updated data within 1 second of selection
- **SC-004**: System correctly identifies the active league when current date falls within league start and end dates in 100% of cases
- **SC-005**: Dashboard remains functional and displays appropriate messaging when no leagues exist or selected league has no data, with zero errors or crashes
