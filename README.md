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

## API Endpoints

- `GET /api/user`: Get user settings
- `GET /api/drinks`: Get available drinks
- `GET /api/intakes`: Get caffeine intake history
- `POST /api/intakes`: Add new caffeine intake
- `DELETE /api/intakes/:id`: Delete a caffeine intake record
- `POST /api/drinks/init`: Initialize default drinks
