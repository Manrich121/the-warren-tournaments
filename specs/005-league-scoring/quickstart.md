# Quickstart: Implementing Scoring System

**Date**: 2026-01-18  
**Feature**: Configure League Scoring System  
**Branch**: `005-league-scoring`

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database running
- Project dependencies installed: `pnpm install`

## Implementation Order

Follow this sequence for systematic implementation:

### Phase 1: Database & Types (Foundation)
1. Update Prisma schema
2. Run migration
3. Seed default scoring system
4. Generate Prisma client
5. Create TypeScript types

### Phase 2: API Layer (Backend)
6. Create validation schemas
7. Implement API routes
8. Add error handling

### Phase 3: UI Components (Frontend)
9. Create scoring system components
10. Add tab navigation to leagues page
11. Integrate with API

### Phase 4: Integration & Testing
12. Update league forms
13. Write tests
14. Validate functionality

---

## Step-by-Step Instructions

### 1. Update Prisma Schema

**File**: `prisma/schema.prisma`

Add the new enums and models from `data-model.md`. Key additions:
- `PointMetricType` enum
- `TieBreakerType` enum
- `ScoringSystem` model
- `ScoreFormula` model
- `TieBreaker` model
- Update `League` model with `scoringSystemId` field

**Validation**:
```bash
pnpx prisma format
pnpx prisma validate
```

### 2. Run Migration

```bash
pnpx prisma migrate dev --name add_scoring_system
```

This creates the migration and applies it to your database.

### 3. Seed Default Scoring System

**File**: `prisma/seed.ts` (create if doesn't exist)

Add the seed function from `data-model.md` to create the default scoring system.

**Run seed**:
```bash
pnpx prisma db seed
```

### 4. Generate Prisma Client

```bash
pnpm run db:generate
```

Regenerates the Prisma client with new types.

### 5. Create TypeScript Types

**Files to create**:
- `src/types/scoring-system.ts` - Domain types
- `src/lib/constants/scoring-labels.ts` - Display labels

Copy content from `data-model.md` sections.

**Validation**:
```bash
pnpx tsc --noEmit
```

### 6. Create Validation Schemas

**File**: `src/lib/validations/scoring-system.ts`

Implement Zod schemas from `data-model.md`.

**Test validation**:
```bash
pnpm test -- src/lib/validations/scoring-system.test.ts
```

### 7. Implement API Routes

Create these route files:

**`src/app/api/scoring-systems/route.ts`**
- GET: List all systems
- POST: Create new system

**`src/app/api/scoring-systems/[id]/route.ts`**
- GET: Get single system
- PATCH: Update system
- DELETE: Delete system

**`src/app/api/scoring-systems/default/route.ts`**
- GET: Get default system

Follow patterns from existing API routes in `src/app/api/`.

**Test API**:
```bash
pnpm run dev
curl http://localhost:3000/api/scoring-systems
```

### 8. Add Error Handling

Ensure all API routes handle errors consistently:
- Zod validation errors → 400
- Not found → 404
- Uniqueness violations → 409
- Auth failures → 401

### 9. Create UI Components

**Component structure**:
```
src/components/scoring-system/
├── scoring-system-dialog.tsx      # Main dialog (create/edit)
├── scoring-system-table.tsx       # TanStack Table
├── formula-list.tsx               # Formulas manager
├── formula-card.tsx               # Single formula input
├── tie-breaker-list.tsx           # Tie-breakers manager
└── tie-breaker-card.tsx           # Single tie-breaker dropdown
```

**Add shadcn/ui tabs** (if not already present):
```bash
pnpx shadcn@latest add tabs
```

**Validation**:
```bash
pnpm run lint
pnpx tsc --noEmit
```

### 10. Add Tab Navigation to Leagues Page

**File**: `src/app/leagues/page.tsx`

Modify to add tabs:
```typescript
<Tabs defaultValue="leagues">
  <TabsList>
    <TabsTrigger value="leagues">Leagues</TabsTrigger>
    <TabsTrigger value="scoring-systems">Scoring Systems</TabsTrigger>
  </TabsList>
  <TabsContent value="leagues">
    {/* Existing league content */}
  </TabsContent>
  <TabsContent value="scoring-systems">
    <ScoringSystemTable />
  </TabsContent>
</Tabs>
```

### 11. Integrate with API

Use TanStack Query for data fetching:

```typescript
// src/lib/hooks/use-scoring-systems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useScoringSystems() {
  return useQuery({
    queryKey: ['scoring-systems'],
    queryFn: async () => {
      const res = await fetch('/api/scoring-systems')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })
}

export function useCreateScoringSystem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateScoringSystemInput) => {
      const res = await fetch('/api/scoring-systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-systems'] })
    }
  })
}
```

### 12. Update League Forms

Add scoring system selector to league creation/edit forms.

**Import**:
```typescript
import { useScoringS ystems } from '@/lib/hooks/use-scoring-systems'
```

**Add to form**:
```typescript
<FormField
  control={form.control}
  name="scoringSystemId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Scoring System</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select scoring system" />
        </SelectTrigger>
        <SelectContent>
          {scoringSystems?.data.map((system) => (
            <SelectItem key={system.id} value={system.id}>
              {system.name} {system.isDefault && "(Default)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

### 13. Write Tests

**Unit tests**:
- `src/lib/validations/scoring-system.test.ts`
- `src/lib/utils/calculate-points.test.ts`

**Component tests**:
- `src/components/scoring-system/scoring-system-dialog.test.tsx`

**API tests**:
- `src/app/api/scoring-systems/route.test.ts`

**Run tests**:
```bash
pnpm test
pnpm test -- --coverage
```

### 14. Validate Functionality

**Manual testing checklist**:
- [ ] Can view list of scoring systems
- [ ] Can create new scoring system
- [ ] Can edit existing scoring system
- [ ] Cannot save without at least one formula
- [ ] Cannot add duplicate point metrics
- [ ] Cannot delete system in use by leagues
- [ ] League form shows scoring system dropdown
- [ ] Default system is used when none selected
- [ ] Formulas display correctly with labels
- [ ] Tie-breakers maintain order

**Full validation**:
```bash
pnpm run build
pnpm run lint
pnpx tsc --noEmit
pnpm test
```

---

## Common Issues & Solutions

### Issue: Prisma Client Out of Sync
**Solution**: `pnpm run db:generate`

### Issue: Migration Fails
**Solution**: Check database connection, ensure PostgreSQL is running

### Issue: TypeScript Errors on Prisma Types
**Solution**: Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

### Issue: Form Validation Not Working
**Solution**: Check Zod schema matches form fields, ensure react-hook-form resolver is configured

### Issue: API Returns 401
**Solution**: Verify NextAuth session middleware is applied to scoring-systems routes

---

## Development Commands

```bash
# Start development server
pnpm run dev

# Run linting
pnpm run lint

# Format code
pnpm run format

# Type check
pnpx tsc --noEmit

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build for production
pnpm run build

# Database commands
pnpm run db:generate    # Generate Prisma client
pnpm run db:push        # Push schema without migration
pnpm run db:migrate     # Create and run migration
```

---

## Next Steps

After completing implementation:
1. Run full test suite
2. Perform accessibility audit
3. Test with screen reader
4. Verify mobile responsiveness
5. Update documentation
6. Create pull request

---

## Reference Files

- **Spec**: `specs/005-league-scoring/spec.md`
- **Data Model**: `specs/005-league-scoring/data-model.md`
- **API Contracts**: `specs/005-league-scoring/contracts/api-spec.md`
- **Research**: `specs/005-league-scoring/research.md`
- **Wireframe**: `specs/005-league-scoring/Configure Leauge Scoring System - Wireframe.png`
