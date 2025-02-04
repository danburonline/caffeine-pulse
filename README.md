# Caffeine Tracker

A comprehensive caffeine tracking application that provides real-time, personalized insights into users' caffeine metabolism and consumption patterns.

## Features

- Track daily caffeine intake
- Real-time metabolism calculation
- Interactive data visualization
- Personalized tracking and insights
- Sleep schedule integration

## Tech Stack

- Frontend: TypeScript, React, Vite
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Drizzle
- UI Components: shadcn/ui
- Charts: Recharts

## Development Options

There are several ways to run the application for development:

### Option 1: Frontend Development (Backend + DB in Docker)
This setup runs the backend and database in Docker while you develop the frontend locally.

1. Start the backend and database:
```bash
docker compose up
```

2. Install dependencies locally:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev:frontend
```

### Option 2: Full Local Development (DB in Docker)
This setup runs only the database in Docker while you develop both frontend and backend locally.

1. Start the database:
```bash
docker compose -f docker-compose.dev.yml up
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server (both frontend and backend):
```bash
npm run dev
```

### Option 3: Fully Local Setup (No Docker)

#### Prerequisites:
- Node.js >= 18
- npm >= 9
- PostgreSQL >= 15

1. Set up your local PostgreSQL database and create a database named `caffeine_tracker`

2. Create a `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/caffeine_tracker
```

3. Install dependencies:
```bash
npm install
```

4. Initialize the database:
```bash
psql -U postgres -d caffeine_tracker -f init.sql
```

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run dev:frontend`: Start only the frontend in development mode
- `npm run dev:backend`: Start only the backend in development mode
- `npm run build`: Build the application for production
- `npm run db:push`: Push database schema changes

## API Endpoints

- `GET /api/user`: Get user settings
- `GET /api/drinks`: Get available drinks
- `GET /api/intakes`: Get caffeine intake history
- `POST /api/intakes`: Add new caffeine intake
- `DELETE /api/intakes/:id`: Delete a caffeine intake record
- `POST /api/drinks/init`: Initialize default drinks

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT