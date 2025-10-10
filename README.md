# The Warren Tournaments

A comprehensive tournament management system designed for Magic: The Gathering tournaments and leagues. Built with modern web technologies, this application provides a complete solution for organizing, managing, and tracking tournament events.

### Landing
<img width="1574" height="575" alt="Screenshot 2025-09-26 at 13 11 14" src="https://github.com/user-attachments/assets/19e99f58-71af-4357-a2d5-f962ce574930" />

### Admin Dashboard
<img width="1560" height="964" alt="Screenshot 2025-09-26 at 13 11 22" src="https://github.com/user-attachments/assets/583f4978-ecb9-4935-be47-cdd9f6aa4250" />

## 🚀 Features

### 🏆 League Management
- Create and manage multiple tournament leagues
- Set league start and end dates
- Track league standings and statistics
- Prize pool management

### 📅 Event Organization  
- Schedule tournament events within leagues
- Track event participants and matches
- View upcoming, active, and completed events
- Event-specific statistics and reporting

### 👥 Player Management
- Player registration
- Comprehensive player profiles
- Win/loss/draw statistics tracking
- League-specific player standings

### ⚔️ Match Tracking
- Record match results with scores
- Support for draws and different round formats
- Real-time match statistics
- Sortable match history

### 📊 Dashboard & Analytics
- Admin dashboard with overview statistics
- League performance metrics
- Player leaderboards with win rates
- Recent activity tracking

### 🔐 Admin System
- Secure authentication system
- Protected admin routes
- User session management
- Data management controls

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query (React Query)
- **Testing**: Jest with Testing Library
- **Package Manager**: pnpm

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database running
- pnpm package manager installed

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd the-warren-tournaments
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials and other configuration:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/warren_tournaments"
   AUTH_SECRET="your-secret-key"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run database migrations
   pnpm db:migrate
   
   # Push schema to database
   pnpm db:push
   ```

5. **Create Admin User**
   ```bash
   pnpm db:create-admin
   ```

## 🚀 Running the Application

### Development Mode
```bash
pnpm dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
```

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

## 🎨 Code Quality

### Linting
```bash
pnpm lint
```

### Formatting
```bash
# Check formatting
pnpm format:check

# Auto-fix formatting
pnpm format
```

## 📂 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/     # Main admin dashboard
│   │   ├── leagues/       # League management
│   │   ├── events/        # Event management
│   │   ├── players/       # Player management
│   │   └── matches/       # Match management
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── types/                # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations

tests/                    # Test files
```

## 🗃️ Database Schema

The application uses the following main entities:

- **Player**: Tournament participants with full name
- **League**: Tournament leagues with date ranges
- **Event**: Individual tournament events within leagues  
- **Match**: Individual matches between players
- **Admin**: Administrative users
- **PrizePool**: Prize pool information for leagues

## 🔒 Authentication

The application uses NextAuth.js for secure authentication:

- Admin login at `/admin/login`
- Session-based authentication
- Protected admin routes
- Automatic redirects for unauthenticated users

## 📈 Usage

1. **Login as Admin**: Navigate to `/admin/login` and use your admin credentials
2. **Create League**: Start by creating your first tournament league
3. **Add Players**: Register players with their full name
4. **Schedule Events**: Create tournament events within your leagues
5. **Record Matches**: Enter match results as tournaments progress
6. **Track Progress**: Monitor league standings and statistics

## 🚧 Development Commands

```bash
# Clean build artifacts
pnpm clean

# Database operations
pnpm db:generate      # Generate Prisma client
pnpm db:push         # Push schema changes
pnpm db:migrate      # Run migrations
pnpm db:create-admin # Create admin user

# Code quality
pnpm lint            # Run ESLint
pnpm format         # Format code with Prettier
pnpm format:check   # Check code formatting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Issues & Support

If you encounter any issues or need support, please create an issue in the repository with:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment information

---

Built with ❤️ for The Warren tournament community
