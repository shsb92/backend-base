# TypeScript Node.js Backend

A minimal, fast, and powerful TypeScript Node.js backend setup with PostgreSQL.

## Features

- TypeScript with modern configuration
- Vite for fast development and building
- Express.js for the web server
- PostgreSQL with Docker for easy database setup
- Minimal dependencies
- Hot reloading during development
- pnpm for fast and efficient package management

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm (`npm install -g pnpm`)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start the PostgreSQL database:
```bash
pnpm db:up
```

4. Start the development server:
```bash
pnpm dev
```

The server will be running at http://localhost:3000

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:up` - Start PostgreSQL database
- `pnpm db:down` - Stop PostgreSQL database

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
PORT=3000
```