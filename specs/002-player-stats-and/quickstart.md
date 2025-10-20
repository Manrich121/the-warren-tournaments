# Quickstart: Player Stats and Leaderboard

This guide provides a quick way to test the player stats and leaderboard functionality.

## 1. Seed the database

First, you will need to seed the database with some test data. You can use the existing `create-admin.ts` script as a template to create a new script to seed the database with players, leagues, events, and matches.

## 2. Run the application

Start the development server:

```bash
pnpm dev
```

## 3. Test the API endpoints

You can use a tool like `curl` or Postman to test the new API endpoints.

### Event Leaderboard

To get the leaderboard for an event, make a GET request to `/api/events/{id}/leaderboard`, replacing `{id}` with the ID of the event.

```bash
curl http://localhost:3000/api/events/your-event-id/leaderboard
```

### League Leaderboard

To get the leaderboard for a league, make a GET request to `/api/leagues/{id}/leaderboard`, replacing `{id}` with the ID of the league.

```bash
curl http://localhost:3000/api/leagues/your-league-id/leaderboard
```

## 4. Verify the results

Check that the results from the API match the expected calculations based on the data you seeded. Verify that the rankings and tie-breakers are correct.
