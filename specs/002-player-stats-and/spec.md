# Feature Specification: Player Stats and Leaderboard Calculations

**Feature Branch**: `002-player-stats-and`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "Player stats and leaderboard calculations should be calculated as: League leaderboard is determined by event points. A player earns event points per event, 1 point for attendance, 1 point for 3rd place, 2 points for 2nd place and 3 points for 1st in an event. Event rankings are determined by a player's match points accross all round played in the event. Players earn 3 match points for each match win, 0 points for each match loss, and 1 match point for each match ending in a draw. Game points are similar to match points in that players earn 3 game points for each game they win 1 point for each game that ends in a draw, and 0 points for any game lost. When determining the ranking in a particular event, if two or more players are tied use tiebreakers in the order 1. Match point, 2. Opponents’ match-win percentage, 3. Game-win percentage, 4. Opponents’ game-win percentage. A player’s match-win percentage is that player’s accumulated match points divided by the total match points possible in those rounds (generally, 3 times the number of rounds played). If this number is lower than 0.33, use 0.33 instead. A player’s game-win percentage is the total number of game points they earned divided by the total game points possible (generally, 3 times the number of games played). Again, use 0.33 if the actual game-win percentage is lower than that. A player’s opponent’s match-win percentage is the average match-win percentage of each opponent that the player faced. Similar to opponents’ match-win percentage, a player’s opponent’s game-win percentage is simply the average game-win percentage of all that player’s opponents. And, as with opponents’ match-win percentage, each opponent has a minimum game-win percentage of 0.33. The leaderboard on the dashboard page should be the leaderboard of the current active league. When viewing a particular league the leaderboard should be calculated based on all the events in that league. When viewing an event, the leaderboard should be the Event rankings of the particular event."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors (Player), actions (earns points, is ranked), data (Match, Event, League, Points), constraints (tie-breaker rules)
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale (Core Web Vitals compliance)
   - Error handling behaviors and user feedback
   - Integration requirements
   - Security/compliance needs
   - Responsive design breakpoints
   - Form validation and error messaging
   - Loading states and async operation feedback

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a player, I want to see my ranking on the leaderboard for the current league, a specific league, or a specific event, so that I can track my performance against other players based on a clear and fair scoring system.

### Acceptance Scenarios
1.  **Given** a player has participated in an event, **When** they view the event's leaderboard, **Then** they should see their ranking calculated based on match points and specified tie-breakers.
2.  **Given** a player has earned event points from multiple events in a league, **When** they view the league's leaderboard, **Then** they should see their ranking based on the sum of their event points.
3.  **Given** two players in an event have the same number of match points, **When** the event leaderboard is calculated, **Then** their relative ranking should be determined by the tie-breaker rules in the correct order.
4.  **Given** a user is on the dashboard page, **When** the page loads, **Then** the leaderboard for the currently active league should be displayed.

### Edge Cases
- What happens when a player has not played any matches in an event?
  - A player with no matches should have 0 match points and be ranked accordingly.
- How are rankings displayed if all players have zero points?
  - Order players alphabetically by name if all have zero points.
- What happens if an opponent's match-win percentage cannot be calculated (e.g., they have played no matches)?
  - If a player has not played any matches, they will not have any opponents.
- How is the "active" league determined for the dashboard leaderboard?
  - An active league is defined as the most recent league with ongoing or upcoming events.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST calculate a player's total match points for an event by summing points from all matches played (3 for a win, 1 for a draw, 0 for a loss).
- **FR-002**: The system MUST calculate a player's total game points for an event by summing points from all games played (3 for a win, 1 for a draw, 0 for a loss).
- **FR-003**: The system MUST calculate a player's match-win percentage for an event as their total match points divided by the total possible match points. This value MUST NOT be less than 0.33.
- **FR-004**: The system MUST calculate a player's game-win percentage for an event as their total game points divided by the total possible game points. This value MUST NOT be less than 0.33.
- **FR-005**: The system MUST calculate an opponent's match-win percentage as the average of the match-win percentages of all of a player's opponents in an event.
- **FR-006**: The system MUST calculate an opponent's game-win percentage as the average of the game-win percentages of all of a player's opponents in an event.
- **FR-007**: The system MUST rank players within an event leaderboard based on the following criteria in order: 1. Match Points, 2. Opponent's Match-Win Percentage, 3. Game-Win Percentage, 4. Opponent's Game-Win Percentage.
- **FR-008**: The system MUST award event points to players based on their final ranking in an event: 3 points for 1st, 2 points for 2nd, 1 point for 3rd, and 1 point for attendance.
- **FR-009**: The system MUST calculate a player's league ranking by summing all event points earned within that league.
- **FR-010**: The dashboard page MUST display the leaderboard for the currently active league.
- **FR-011**: The league details page MUST display a leaderboard calculated from all events within that league.
- **FR-012**: The event details page MUST display a leaderboard reflecting the event-specific rankings.

### Key Entities *(include if feature involves data)*
- **Player**: Represents an individual participant. Attributes: Name.
- **Match**: Represents a single match between two players, matches are best-of-3 games. Attributes: Player1, Player2, Winner, Draw.
- **Game**: Represents a single game within a match. Attributes: Player1, Player2, Winner, Draw.
- **Event**: Represents a single tournament. Attributes: Name, Date, Players, Matches.
- **League**: Represents a series of events. Attributes: Name, Events.
- **Leaderboard**: A calculated ranking of players for a specific league or event. Attributes: Player, Rank, Points, Tie-breaker stats.

---

## Review & Acceptance Checklist
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

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
