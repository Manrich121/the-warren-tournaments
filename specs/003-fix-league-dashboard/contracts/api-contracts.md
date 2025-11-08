# API Contracts: Fix League Dashboard and Leaderboard Display

**Date**: 2025-11-02
**Feature**: 003-fix-league-dashboard
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the HTTP API contracts for the league dashboard feature. All endpoints follow RESTful conventions with JSON request/response bodies, proper HTTP status codes, and Zod schema validation.

**Base URL**: `/api/leagues`

---

## 1. GET `/api/leagues`

Retrieve all leagues in the system, ordered by end date (most recent first).

### Request

**Method**: `GET`
**Path**: `/api/leagues`
**Query Parameters**: None
**Headers**: None required
**Authentication**: Not required (public endpoint)

### Response

**Success (200 OK)**:
```typescript
{
  leagues: League[]
}
```

**Example**:
```json
{
  "leagues": [
    {
      "id": "clxxxx1",
      "name": "Summer League 2024",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.999Z",
      "createdAt": "2024-05-15T10:00:00.000Z",
      "updatedAt": "2024-05-15T10:00:00.000Z"
    },
    {
      "id": "clxxxx2",
      "name": "Spring League 2024",
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-05-31T23:59:59.999Z",
      "createdAt": "2024-02-15T10:00:00.000Z",
      "updatedAt": "2024-02-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error`: Database connection failed or unexpected error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch leagues"
}
```

### Implementation Notes
- Prisma query: `prisma.league.findMany({ orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }] })`
- No pagination required initially (expected league count < 100)
- Add pagination if league count exceeds 100 in the future

---

## 2. GET `/api/leagues/most-recent`

Retrieve the league with the most recent end date (active or past). Uses `createdAt` as tie-breaker.

### Request

**Method**: `GET`
**Path**: `/api/leagues/most-recent`
**Query Parameters**: None
**Headers**: None required
**Authentication**: Not required (public endpoint)

### Response

**Success (200 OK)** - League found:
```typescript
League
```

**Example**:
```json
{
  "id": "clxxxx1",
  "name": "Summer League 2024",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.999Z",
  "createdAt": "2024-05-15T10:00:00.000Z",
  "updatedAt": "2024-05-15T10:00:00.000Z"
}
```

**Success (200 OK)** - No leagues exist:
```json
null
```

**Error Responses**:
- `500 Internal Server Error`: Database connection failed or unexpected error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch most recent league"
}
```

### Implementation Notes
- Prisma query: `prisma.league.findFirst({ orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }] })`
- Returns `null` (not 404) when no leagues exist for graceful UI handling
- Tie-breaking logic implements FR-011: most recently created league wins when end dates match

---

## 3. GET `/api/leagues/active` (MODIFIED)

Retrieve the currently active league (current date between start and end dates).

### Request

**Method**: `GET`
**Path**: `/api/leagues/active`
**Query Parameters**: None
**Headers**: None required
**Authentication**: Not required (public endpoint)

### Response

**Success (200 OK)** - Active league found:
```typescript
League
```

**Example**:
```json
{
  "id": "clxxxx1",
  "name": "Summer League 2024",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.999Z",
  "createdAt": "2024-05-15T10:00:00.000Z",
  "updatedAt": "2024-05-15T10:00:00.000Z"
}
```

**Not Found (404 Not Found)** - No active league:
```json
{
  "error": "No active league found",
  "message": "There is currently no league in progress"
}
```

**Error Responses**:
- `500 Internal Server Error`: Database connection failed or unexpected error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch active league"
}
```

### Changes from Current Implementation
- **Before**: Returns 404 with generic error message
- **After**: Returns 404 with user-friendly error object containing `error` and `message` fields
- **Reason**: Consistent error structure across all endpoints (per constitution Section VIII)

### Implementation Notes
- Prisma query: `prisma.league.findFirst({ where: { startDate: { lte: now }, endDate: { gte: now } } })`
- Uses inclusive date comparison per FR-008
- Client-side hook (`useActiveLeague`) must handle 404 gracefully by returning `null`

---

## 4. GET `/api/leagues/[id]/leaderboard`

Calculate and return the ranked leaderboard for a specific league.

### Request

**Method**: `GET`
**Path**: `/api/leagues/{leagueId}/leaderboard`
**Path Parameters**:
- `leagueId` (string, required): League unique identifier (CUID format)

**Query Parameters**: None
**Headers**: None required
**Authentication**: Not required (public endpoint)

### Response

**Success (200 OK)**:
```typescript
{
  leagueId: string;
  leaderboard: LeaderboardEntry[];
}
```

**Example**:
```json
{
  "leagueId": "clxxxx1",
  "leaderboard": [
    {
      "playerId": "player1",
      "playerName": "Alice",
      "rank": 1,
      "leaguePoints": 150,
      "matchesWon": 10,
      "matchesPlayed": 12,
      "matchWinRate": 0.8333,
      "gamePoints": 240,
      "gamePossiblePoints": 288,
      "gameWinRate": 0.8333,
      "opponentsMatchWinRate": 0.6500,
      "opponentsGameWinRate": 0.6800
    },
    {
      "playerId": "player2",
      "playerName": "Bob",
      "rank": 2,
      "leaguePoints": 150,
      "matchesWon": 9,
      "matchesPlayed": 12,
      "matchWinRate": 0.7500,
      "gamePoints": 220,
      "gamePossiblePoints": 288,
      "gameWinRate": 0.7639,
      "opponentsMatchWinRate": 0.7000,
      "opponentsGameWinRate": 0.7200
    }
  ]
}
```

**Success (200 OK)** - League exists but has no matches:
```json
{
  "leagueId": "clxxxx1",
  "leaderboard": []
}
```

**Error Responses**:

**400 Bad Request** - Invalid league ID format:
```json
{
  "error": "Invalid league ID",
  "message": "League ID must be a valid CUID"
}
```

**404 Not Found** - League doesn't exist:
```json
{
  "error": "League not found",
  "message": "No league exists with ID: clxxxx1"
}
```

**500 Internal Server Error** - Calculation or database error:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to calculate leaderboard"
}
```

### Implementation Notes
- Validate `leagueId` using Zod schema: `z.string().cuid()`
- Fetch all events for league, then all matches for those events
- Call `calculateLeaderboardRankings()` utility function (see data-model.md)
- Return empty array (not 404) for leagues with no matches (per FR-007 empty state handling)
- Performance target: <200ms for up to 100 players

---

## 5. GET `/api/leagues/[id]/stats`

Retrieve aggregated statistics for a specific league.

### Request

**Method**: `GET`
**Path**: `/api/leagues/{leagueId}/stats`
**Path Parameters**:
- `leagueId` (string, required): League unique identifier (CUID format)

**Query Parameters**: None
**Headers**: None required
**Authentication**: Not required (public endpoint)

### Response

**Success (200 OK)**:
```typescript
LeagueStats
```

**Example**:
```json
{
  "leagueId": "clxxxx1",
  "eventsCount": 5,
  "matchesCount": 60,
  "playersCount": 12,
  "prizePoolAmount": 1000.00
}
```

**Error Responses**:

**400 Bad Request** - Invalid league ID format:
```json
{
  "error": "Invalid league ID",
  "message": "League ID must be a valid CUID"
}
```

**404 Not Found** - League doesn't exist:
```json
{
  "error": "League not found",
  "message": "No league exists with ID: clxxxx1"
}
```

**500 Internal Server Error** - Database error:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch league statistics"
}
```

### Implementation Notes
- Alternative to client-side calculation (see research.md decision 5)
- Useful if stats API becomes preferred over deriving from existing data
- Query events and matches via Prisma, aggregate in TypeScript
- Prize pool may be null/undefined, default to 0

---

## Error Response Schema

All error responses follow this consistent structure:

```typescript
interface ErrorResponse {
  /** Machine-readable error code */
  error: string;

  /** Human-readable error message */
  message: string;

  /** Optional: Additional error details for debugging */
  details?: unknown;
}
```

**HTTP Status Code Mapping**:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input (validation failure)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error, database failure, unexpected exception

---

## Request/Response Headers

### Standard Headers (All Endpoints)

**Request Headers**:
- `Content-Type`: Not applicable (GET requests, no body)
- `Accept`: `application/json` (optional, defaults to JSON)

**Response Headers**:
- `Content-Type`: `application/json`
- `Cache-Control`: `public, max-age=60` (1-minute cache for league data)
- `ETag`: Generated hash of response body (for conditional requests)

### CORS Headers (If Needed)

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Rate Limiting

**Policy**: Not implemented initially (per constitution: "SHOULD be implemented for public-facing endpoints")

**Future Implementation** (if needed):
- Limit: 100 requests per minute per IP
- Response when exceeded:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

**Status Code**: `429 Too Many Requests`

---

## Validation Schemas (Zod)

### League ID Parameter

```typescript
import { z } from 'zod';

const LeagueIdParamSchema = z.object({
  id: z.string().cuid({
    message: "League ID must be a valid CUID"
  })
});
```

### Leaderboard Entry Response

```typescript
const LeaderboardEntrySchema = z.object({
  playerId: z.string().cuid(),
  playerName: z.string().min(1),
  rank: z.number().int().min(1),
  leaguePoints: z.number().int().min(0),
  matchesWon: z.number().int().min(0),
  matchesPlayed: z.number().int().min(0),
  matchWinRate: z.number().min(0).max(1),
  gamePoints: z.number().int().min(0),
  gamePossiblePoints: z.number().int().min(0),
  gameWinRate: z.number().min(0).max(1),
  opponentsMatchWinRate: z.number().min(0).max(1),
  opponentsGameWinRate: z.number().min(0).max(1),
});

const LeaderboardResponseSchema = z.object({
  leagueId: z.string().cuid(),
  leaderboard: z.array(LeaderboardEntrySchema),
});
```

---

## Summary Table

| Endpoint | Method | Purpose | Auth Required | Cache Duration |
|----------|--------|---------|---------------|----------------|
| `/api/leagues` | GET | List all leagues | No | 1 minute |
| `/api/leagues/most-recent` | GET | Get most recent league | No | 30 seconds |
| `/api/leagues/active` | GET | Get active league (MODIFIED) | No | 5 minutes |
| `/api/leagues/[id]/leaderboard` | GET | Get league leaderboard | No | 1 minute |
| `/api/leagues/[id]/stats` | GET | Get league statistics | No | 1 minute |

**Note**: Cache durations are recommendations for TanStack Query `staleTime` configuration, not server-side `Cache-Control` headers (which are set to 1 minute universally for simplicity).

---

**Next**: Proceed to generate `quickstart.md` for developer onboarding.
