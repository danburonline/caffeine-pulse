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

## Local Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 15

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/caffeine_tracker
```

### Local Setup (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Start the development server (both frontend and backend):
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Docker Development Setup

### Database Setup

1. Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: caffeine_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Start the PostgreSQL container:
```bash
docker compose up -d
```

### Development with Docker Compose

For a complete development environment, create a `docker-compose.dev.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: caffeine_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/caffeine_tracker
    depends_on:
      - postgres
    command: npm run dev

  frontend:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend
    command: npm run dev:frontend

volumes:
  postgres_data:
```

To start the development environment:
```bash
docker compose -f docker-compose.dev.yml up
```

## Available Scripts

- `npm run dev`: Start both frontend and backend in development mode
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
