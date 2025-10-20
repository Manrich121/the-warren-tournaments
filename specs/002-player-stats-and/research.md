# Research: Player Stats and Leaderboard Calculations

## Objective

Determine the best approach for implementing the player statistics and leaderboard calculations as defined in the feature specification.

## Research & Decisions

### 1. Calculation Logic

- **Decision**: Implement the calculation logic in a new TypeScript module `src/lib/playerStats.ts`.
- **Rationale**: The calculations are complex and involve multiple steps. Separating this logic into its own module will improve code organization, maintainability, and testability. It also aligns with the existing project structure where utility functions are kept in the `src/lib` directory.
- **Alternatives considered**: 
    - Implementing the logic directly in the API route handlers: This would make the route handlers bloated and difficult to test.
    - Implementing the logic in the database as stored procedures: This would move business logic into the database, making it harder to manage and version control.

### 2. Data Fetching

- **Decision**: Use the existing Prisma client to fetch the necessary data (players, matches, events, leagues) for the calculations.
- **Rationale**: The project is already using Prisma as its ORM. Using the existing client is the most efficient and consistent way to interact with the database.
- **Alternatives considered**: None, as using the existing ORM is the only sensible option.

### 3. API Endpoints

- **Decision**: Create new API endpoints to expose the leaderboard data.
- **Rationale**: The frontend will need to fetch the calculated leaderboard data. New API endpoints are required for this.
- **Alternatives considered**: None.

## Conclusion

The research confirms that the feature can be implemented within the existing architecture. The core of the work will be to create the calculation logic in a new module and expose the data through new API endpoints.