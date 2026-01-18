# API Contracts: Scoring System

**Date**: 2026-01-18  
**Feature**: Configure League Scoring System  
**Branch**: `005-league-scoring`

## Base URL

All endpoints are relative to `/api/scoring-systems`

## Authentication

All endpoints require admin authentication via NextAuth session.

## Endpoints

### 1. List Scoring Systems

**GET** `/api/scoring-systems`

List all scoring systems with summary information.

**Response**: `200 OK`
```typescript
{
  data: Array<{
    id: string
    name: string
    isDefault: boolean
    formulaCount: number
    tieBreakerCount: number
    leagueCount: number
    createdAt: string  // ISO 8601
    updatedAt: string  // ISO 8601
  }>
}
```

---

### 2. Get Scoring System

**GET** `/api/scoring-systems/[id]`

Retrieve a single scoring system with all formulas and tie-breakers.

**Response**: `200 OK`
```typescript
{
  data: {
    id: string
    name: string
    isDefault: boolean
    formulas: Array<{
      id: string
      multiplier: number
      pointMetric: PointMetricType
      order: number
    }>
    tieBreakers: Array<{
      id: string
      type: TieBreakerType
      order: number
    }>
    leagueCount: number
    createdAt: string
    updatedAt: string
  }
}
```

**Errors**:
- `404 Not Found`: System not found

---

### 3. Create Scoring System

**POST** `/api/scoring-systems`

Create a new scoring system.

**Request Body**:
```typescript
{
  name: string  // 1-100 chars, unique
  formulas: Array<{
    multiplier: number  // integer
    pointMetric: PointMetricType
    order: number  // positive integer
  }>  // min: 1, max: 10, no duplicate metrics
  tieBreakers?: Array<{
    type: TieBreakerType
    order: number  // positive integer
  }>  // max: 7
}
```

**Response**: `201 Created`
```typescript
{
  data: {
    id: string
    name: string
    // ... (same as GET response)
  },
  message: "Scoring system created successfully"
}
```

**Errors**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Name already exists

---

### 4. Update Scoring System

**PATCH** `/api/scoring-systems/[id]`

Update an existing scoring system.

**Request Body**: Same as Create

**Response**: `200 OK`
```typescript
{
  data: {
    id: string
    name: string
    // ... (same as GET response)
  },
  message: "Scoring system updated successfully"
}
```

**Errors**:
- `400 Bad Request`: Validation errors
- `404 Not Found`: System not found
- `409 Conflict`: Name already exists (if changed)

---

### 5. Delete Scoring System

**DELETE** `/api/scoring-systems/[id]`

Delete a scoring system (only if not associated with leagues).

**Response**: `200 OK`
```typescript
{
  message: "Scoring system deleted successfully"
}
```

**Errors**:
- `404 Not Found`: System not found
- `400 Bad Request`: System is associated with leagues
  ```typescript
  {
    error: "Cannot delete scoring system",
    details: {
      associatedLeagues: Array<{
        id: string
        name: string
      }>
    }
  }
  ```
- `403 Forbidden`: Cannot delete default system

---

### 6. Get Default Scoring System

**GET** `/api/scoring-systems/default`

Retrieve the default scoring system.

**Response**: `200 OK` (same structure as GET /[id])

---

## Error Response Format

All error responses follow this structure:

```typescript
{
  error: string  // Human-readable error message
  details?: Record<string, unknown>  // Optional additional context
}
```

## Validation Rules

### Name Validation
- Required: ✓
- Min length: 1
- Max length: 100
- Unique: ✓
- Trimmed: ✓

### Formulas Validation
- Min count: 1
- Max count: 10
- No duplicate pointMetric values
- Multiplier: integer (can be zero or negative)
- Order: positive integer

### Tie-Breakers Validation
- Max count: 7
- Order: positive integer (unique within system)
