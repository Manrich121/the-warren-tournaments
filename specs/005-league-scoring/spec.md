# Feature Specification: Configure League Scoring System

**Feature Branch**: `005-league-scoring`  
**Created**: 2026-01-18  
**Status**: Draft  
**Input**: "Implement a Configure League Scoring System that allows admin users to configure the formula for how players earn league points and which tie-breakers are used to rank players within a particular league. Player earn leagues points in the following ways, (referred to as Point Metrics);
participating in an Event, winning a Match, winning a Game and placing 1st, 2nd or 3rd in an Event. The list of tie-breakers are as follows; "League Points", "Match Points", "Opponent Match Win Percentage", "Game Win Percentage", "Opponent Game Win Percentage" and also the following Aggregated Point Metrics - "Event
Attendance", "Match Wins". A Scoring System consists of a configured set of formulas, each formula an integer N times a Point metric, and an ordered list of Tie-breakers to be used when ranking players in a league. An Admin user creates a new Scoring System, enters a name for the system, then Adds a formula, specifying
the number of points times a Point Metric, selected from a dropdown list. For example "1 x 'Event Attendance'". The user adds another formula, again specifying a number, times a Point Metric, in this example "3 x '1st in Event'". The user can continue to add additional formulas or decide to remove a particular formula. Next
the Admin user configures the Tie-breakers, Adding the first tiebreaker, selected from a dropdown list, for example "1. 'League Points'", then continues to Add to the ordered list, in this example "2. 'Event Attendance', 3. 'Match Points', 4. Opp Match Win %'...". Finally, the user Saves (or Discards) the Scoring System.
Admin users should be able to edit existing Scoring Systems. When creating a New League, the Admin user selects which Scoring System will be used, by selecting from a dropdown list. The associated Scoring System is used when calculating a players points within a league, and the system's tie-breakers ordered list is used
when calculating a player's rank on a league's Leaderboard."

## Clarifications

### Session 2026-01-18

- Q: Should the system allow multiple formulas with the same point metric (e.g., "2 x Event Attendance" AND "3 x Event Attendance")? → A: Allow duplicates - multiple formulas for same metric can coexist
- Q: How does system handle scoring system deletion when it's associated with active leagues? → A: Prevent deletion with clear message listing affected leagues
- Q: What happens when a league has no scoring system associated? → A: Use default scoring system if none selected
- Q: What should the default scoring system contain? → A: Formulas: 1 x Event Attendance, 3 x 1st in Event, 2 x 2nd in Event, 1 x 3rd in Event. Tie-breakers: 1. League Points, 2. Match Points, 3. Opponent Match Win Percentage, 4. Game Win Percentage, 5. Opponent Game Win Percentage
- Q: How are tie-breakers applied when the required data is missing for a player? → A: Treat missing data as zero - player ranks lowest for that metric
- Q: What happens if two players are completely tied on all tie-breakers? → A: Shared rank - both players receive same rank number

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create New Scoring System (Priority: P1)

An admin user needs to create a new scoring system from scratch to define how players earn points in a league. They configure point formulas by specifying multipliers for different point metrics (e.g., "3 points for Event Attendance", "10 points for 1st place finish").

**Why this priority**: This is the core functionality - without the ability to create scoring systems, no other features can function. It delivers immediate value by allowing admins to define their league's point structure.

**Independent Test**: Can be fully tested by creating a new scoring system with multiple formulas and verifying it persists correctly, independent of tie-breakers or league association.

**Acceptance Scenarios**:

1. **Given** an admin user is on the Scoring Systems page, **When** they click "Create New Scoring System" and enter name "Standard Scoring", **Then** a new scoring system form is displayed
2. **Given** a scoring system form is open, **When** admin adds a formula by selecting "Add", **Then** a card with a number input, a text element 'x' and a dropdown appears in the formulas list
3. **Given** a formula card is present, **When** admin enters "1" in number input and selects "Event Attendance" from dropdown, **Then** formula "[1] x [Event Attendance]" is shown in the list
4. **Given** formulas exist in the list, **When** admin adds another formula by selecting "Add", enters "3" and selects "1st in Event" **Then** both formulas are visible in the list
5. **Given** multiple formulas exist, **When** admin removes one formula by selecting a 'X' button to the right of a formula card, **Then** the formula is removed from the list
6. **Given** a scoring system has at least one formula, **When** admin clicks "Save", **Then** the scoring system is persisted and confirmation is shown
7. **Given** a scoring system form is in progress, **When** admin clicks "Discard", **Then** changes are abandoned and admin returns to the main view

---

### User Story 2 - Configure Tie-Breakers (Priority: P2)

An admin user configures an ordered list of tie-breakers to determine player rankings when multiple players have the same league points. They select tie-breakers from a dropdown and arrange them in priority order (e.g., "1. League Points, 2. Event Attendance, 3. Match Points").

**Why this priority**: While important for complete functionality, tie-breakers only matter when there are actual ties. A system can function with formulas alone using simple point-based ranking.

**Independent Test**: Can be tested by creating a scoring system, adding tie-breakers in a specific order, saving, and verifying the order is preserved and retrievable.

**Acceptance Scenarios**:

1. **Given** a scoring system form is open, **When** admin selects "Add" **Then** a tie-breaker dropdown "1. League Points" appears as the first tie-breaker.
2. **Given** one tie-breaker exists, **When** admin adds a tie-breaker **Then** a tie-breaker dropdown with the next available value "2. Event Attendance" appears below the first
3. **Given** a tie-breaker is present, **When** the user selects a different tie-breaker value from the dropdown **Then** the selected tie-breaker is updated accordingly.
3. **Given** multiple tie-breakers exist, **When** admin adds more tie-breakers, **Then** they appear in the list numbered sequentially
4. **Given** tie-breakers are configured, **When** admin removes a tie-breaker by selecting a 'X' button to the right of the dropdown, **Then** remaining tie-breakers are renumbered automatically
5. **Given** tie-breakers are configured in order, **When** admin saves the scoring system, **Then** the tie-breaker order is persisted

---

### User Story 3 - Edit Existing Scoring System (Priority: P3)

An admin user needs to modify an existing scoring system to adjust point formulas or tie-breaker order. They can add, remove, or modify formulas and reorder tie-breakers.

**Why this priority**: While useful for refinement, leagues can start with initial scoring systems. Editing capability is enhancement for flexibility but not required for MVP.

**Independent Test**: Can be tested by loading an existing scoring system, making changes to formulas and tie-breakers, saving, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** scoring systems exist, **When** admin selects a scoring system to edit, **Then** the system's current formulas and tie-breakers are loaded into the form
2. **Given** an existing scoring system is loaded, **When** admin modifies a formula multiplier, **Then** the change is reflected in the form
3. **Given** an existing scoring system is loaded, **When** admin adds new formulas or tie-breakers, **Then** they are added to the existing list
4. **Given** changes are made to an existing system, **When** admin saves, **Then** the updated system replaces the previous version

---

### User Story 4 - Associate Scoring System with League (Priority: P2)

When creating or editing a league, an admin user selects which scoring system will be used for that league from a dropdown list of available scoring systems. This association determines how player points and rankings are calculated.

**Why this priority**: This is essential for scoring systems to be used in practice, but can only be valuable once scoring systems exist (depends on P1).

**Independent Test**: Can be tested by creating a league, selecting a scoring system from dropdown, and verifying the association is saved and retrievable.

**Acceptance Scenarios**:

1. **Given** admin is creating a new league, **When** they reach the scoring system selection field, **Then** a dropdown shows all available scoring systems
2. **Given** a dropdown of scoring systems is shown, **When** admin selects a scoring system, **Then** the selection is marked as the league's scoring system
3. **Given** a league with an associated scoring system exists, **When** viewing league details, **Then** the associated scoring system name is displayed
4. **Given** a league is being edited, **When** admin changes the scoring system selection, **Then** the new scoring system becomes associated with the league

---

### User Story 5 - Calculate Player Points Using Scoring System (Priority: P3)

The system automatically calculates player league points by applying the league's associated scoring system formulas to player performance data (event attendance, match wins, game wins, and placement positions).

**Why this priority**: This is the end goal but depends on all previous stories. It can be implemented after the configuration interface is complete.

**Independent Test**: Can be tested by creating test data (players, events, matches), associating a known scoring system, and verifying calculated points match expected values from the formulas.

**Acceptance Scenarios**:

1. **Given** a player participated in an event with scoring system "[1] x [Event Attendance]", **When** points are calculated, **Then** player receives 1 point
2. **Given** a player won a match and scoring system has "[2] x [Match Wins]", **When** points are calculated, **Then** player receives 2 points
3. **Given** a player placed 1st in event and system has "[10] x [1st in Event]", **When** points are calculated, **Then** player receives 10 points
4. **Given** multiple formulas apply to a player, **When** points are calculated, **Then** all applicable formula results are summed

---

### User Story 6 - Rank Players Using Tie-Breakers (Priority: P3)

When generating a league leaderboard, the system ranks players first by league points, then applies the configured tie-breakers in order to resolve ties between players with equal points.

**Why this priority**: Depends on both point calculation (P3) and tie-breaker configuration (P2). This is the final piece of complete functionality.

**Independent Test**: Can be tested by creating players with identical league points but different performance in tie-breaker metrics, and verifying rank order matches the configured tie-breaker sequence.

**Acceptance Scenarios**:

1. **Given** two players have equal league points, **When** leaderboard is generated with tie-breaker "Event Attendance", **Then** player with more event attendance ranks higher
2. **Given** players tied on first tie-breaker, **When** second tie-breaker is applied, **Then** player with better second tie-breaker metric ranks higher
3. **Given** multiple tie-breakers are configured, **When** players are tied on several metrics, **Then** tie-breakers are applied in configured order until tie is resolved
4. **Given** players are tied on all metrics, **When** leaderboard is generated, **Then** players with identical metrics share the same rank (subsequent players skip rank positions accordingly)

---

### Edge Cases

- Q: What happens when an admin creates a scoring system with no formulas? A: Should require at least one formula
- Q: Can formulas have zero or negative multipliers? A: yes 
- Q: What is the maximum number of formulas or tie-breakers allowed? A: Max of 10 formulas and 7 tie-breakers

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admin users to create new scoring systems with a unique name
- **FR-002**: System MUST allow admin users to add formulas to a scoring system, each consisting of an integer multiplier and a point metric
- **FR-003**: System MUST provide the following point metrics for formula selection: "Event Attendance", "Match Wins", "Game Wins", "1st in Event", "2nd in Event", "3rd in Event"
- **FR-004**: System MUST allow admin users to remove formulas from a scoring system
- **FR-004a**: System MUST allow multiple formulas with the same point metric to coexist in a scoring system
- **FR-005**: System MUST allow admin users to add tie-breakers to a scoring system in a specific order
- **FR-006**: System MUST provide the following tie-breakers for selection: "League Points", "Match Points", "Opponent Match Win Percentage", "Game Win Percentage", "Opponent Game Win Percentage", "Event Attendance", "Match Wins"
- **FR-007**: System MUST maintain the order of tie-breakers as configured by the admin
- **FR-008**: System MUST allow admin users to remove tie-breakers from a scoring system
- **FR-009**: System MUST allow admin users to save completed scoring systems
- **FR-010**: System MUST allow admin users to discard changes to a scoring system without saving
- **FR-011**: System MUST allow admin users to edit existing scoring systems
- **FR-012**: System MUST allow admin users to select a scoring system when creating a new league
- **FR-012a**: System MUST apply a default scoring system to leagues when no scoring system is explicitly selected
- **FR-012b**: The default scoring system MUST contain formulas: 1 x Event Attendance, 3 x 1st in Event, 2 x 2nd in Event, 1 x 3rd in Event
- **FR-012c**: The default scoring system MUST contain tie-breakers in order: League Points, Match Points, Opponent Match Win Percentage, Game Win Percentage, Opponent Game Win Percentage
- **FR-013**: System MUST display available scoring systems in a dropdown when associating with a league
- **FR-014**: System MUST calculate player league points by applying all formulas from the league's associated scoring system
- **FR-015**: System MUST rank players on league leaderboards first by total league points (descending)
- **FR-016**: System MUST apply tie-breakers in configured order when players have equal league points
- **FR-016a**: System MUST treat missing tie-breaker data as zero when calculating player rankings
- **FR-016b**: System MUST assign shared rank to players who are completely tied on all metrics, with subsequent players skipping rank positions
- **FR-017**: System MUST validate that scoring system names are unique
- **FR-018**: System MUST require at least one formula before allowing a scoring system to be saved
- **FR-019**: System MUST persist scoring system configuration including formulas and tie-breaker order
- **FR-020**: System MUST prevent deletion of scoring systems that are associated with active leagues and display a clear message listing the affected leagues

### Key Entities

- **Scoring System**: Represents a complete point calculation and ranking configuration. Contains a unique name, collection of formulas, and ordered list of tie-breakers. Can be associated with multiple leagues.

- **Formula**: Represents a single point calculation rule. Contains an integer multiplier (N) and a point metric type. Multiple formulas can exist in one scoring system.

- **Point Metric**: Enumerated type representing ways players earn points: Event Attendance, Match Wins, Game Wins, 1st in Event, 2nd in Event, 3rd in Event. Each metric corresponds to measurable player performance.

- **Tie-Breaker**: Enumerated type representing metrics used to rank players when tied: League Points, Match Points, Opponent Match Win Percentage, Game Win Percentage, Opponent Game Win Percentage, Event Attendance, Match Wins. Applied in configured order.

- **League** (existing): Modified to include reference to associated Scoring System. Uses the scoring system's formulas for point calculation and tie-breakers for ranking.

- **Player** (existing): League points are calculated by applying scoring system formulas to player's performance data. Rank determined by points and tie-breakers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can create a complete scoring system (with name, formulas, and tie-breakers) in under 3 minutes
- **SC-002**: System correctly calculates league points for 100+ players using configured formulas with results available within 2 seconds
- **SC-003**: League leaderboards correctly rank players according to configured tie-breakers with no manual intervention required
- **SC-004**: Admin users can successfully associate a scoring system with a league in under 30 seconds
- **SC-005**: Scoring system configuration persists accurately with 100% data integrity across all formulas and tie-breaker order
- **SC-006**: 95% of admin users can create and configure a scoring system without requiring support documentation
- **SC-007**: System prevents configuration errors (duplicate names, missing formulas) with clear validation messages in real-time
