# Data Model

## Player
- `id`: Int (Primary Key)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Match
- `id`: Int (Primary Key)
- `eventId`: Int (Foreign Key to Event)
- `player1Id`: Int (Foreign Key to Player)
- `player2Id`: Int (Foreign Key to Player)
- `player1Score`: Int
- `player2Score`: Int
- `draw`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Event
- `id`: Int (Primary Key)
- `leagueId`: Int (Foreign Key to League)
- `name`: String
- `date`: DateTime
- `participants`: Player[]
- `matches`: Match[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

## League
- `id`: Int (Primary Key)
- `name`: String
- `startDate`: DateTime
- `endDate`: DateTime
- `events`: Event[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Admin
- `id`: Int (Primary Key)
- `email`: String (Unique)
- `password`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## PrizePool
- `id`: Int (Primary Key)
- `leagueId`: Int (Foreign Key to League)
- `amount`: Float
- `createdAt`: DateTime
- `updatedAt`: DateTime
