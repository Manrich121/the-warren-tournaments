# Data Model: Player Stats and Leaderboard

This document outlines the data models required for the player stats and leaderboard feature. The existing Prisma schema will be used, with the addition of a few calculated fields on the models when they are returned from the API.

## Existing Models

The following existing models from `prisma/schema.prisma` will be used:

- `Player`
- `Match`
- `Event`
- `League`

## Calculated Fields

When returning data from the API, the following calculated fields will be added to the models.

### Player Stats (within an Event context)

These fields will be calculated for each player within a specific event.

- **`matchPoints`**: `Int` - Total match points.
- **`gamePoints`**: `Int` - Total game points.
- **`matchWinPercentage`**: `Float` - Player's match-win percentage.
- **`gameWinPercentage`**: `Float` - Player's game-win percentage.
- **`opponentsMatchWinPercentage`**: `Float` - Average match-win percentage of the player's opponents.
- **`opponentsGameWinPercentage`**: `Float` - Average game-win percentage of the player's opponents.

### Event Ranking

- **`rank`**: `Int` - The player's rank within the event.
- **`eventPoints`**: `Int` - The points awarded to the player for the event.

### League Ranking

- **`rank`**: `Int` - The player's rank within the league.
- **`totalEventPoints`**: `Int` - The sum of all event points for the player in the league.

## No Schema Changes

There are no required changes to the `prisma/schema.prisma` file for this feature. All new data is calculated from the existing data.