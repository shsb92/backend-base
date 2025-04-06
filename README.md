# TypeScript Node.js Backend

A minimal, fast, and powerful TypeScript Node.js backend setup with PostgreSQL.

## Features

- TypeScript with modern configuration
- Vite for fast development and building
- Express.js for the web server
- PostgreSQL with Docker for easy database setup
- Flexible storage system supporting local, S3, and Google Cloud Storage
- Minimal dependencies
- Hot reloading during development
- pnpm for fast and efficient package management

## Project Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/
├── core/                  # Core functionality
│   ├── database/          # Database connection and migrations
│   ├── storage/           # Storage system (local, S3, GCS)
│   │   ├── providers/     # Storage provider implementations
│   │   ├── types.ts       # Storage interfaces and types
│   │   └── index.ts       # Storage factory and configuration
│   └── ...
├── models/                # Data models and database schemas
├── routes/                # API route definitions
├── handler/               # Request handlers and business logic
└── index.ts               # Application entry point
```

### Key Components

- **Core**: Contains fundamental functionality like database connections, storage systems, and utilities
- **Models**: Defines data structures and database schemas
- **Routes**: Maps HTTP endpoints to handler functions
- **Handler**: Implements business logic and request processing
- **Storage System**: Provides a unified interface for file storage across different providers

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

## Storage System

The backend includes a flexible storage system that supports multiple storage providers:

### Supported Storage Providers

- **Local Storage**: Store files on the local filesystem
- **Amazon S3**: Store files in AWS S3 buckets
- **Google Cloud Storage**: Store files in Google Cloud Storage buckets

### Configuration

Configure your storage provider in the `.env` file:

```
# Storage Configuration
STORAGE_TYPE=local # Options: local, s3, gcs

# Local Storage
STORAGE_LOCAL_PATH=./storage

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Google Cloud Storage
GCS_PROJECT_ID=your_project_id
GCS_KEY_FILENAME=path/to/your/service-account-key.json
GCS_BUCKET=your_bucket_name
```

### Usage Example

```typescript
import { StorageFactory, createStorageConfig } from './core/storage';

// Initialize storage
const config = createStorageConfig();
const storage = StorageFactory.getInstance(config);
const provider = storage.getProvider();

// Store a file
const filePath = await provider.store({
  path: 'path/to/file.txt',
  content: 'Hello, World!',
  contentType: 'text/plain',
  metadata: { author: 'System' }
});

// Get file content
const content = await provider.get(filePath);

// Delete file
await provider.delete(filePath);
```

## Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
PORT=3000

# Storage Configuration
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage
```