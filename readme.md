# 🚀 Superteam Backend

This repository contains the backend codebase for the **Superteam** project. It is built using **Node.js**, **TypeScript**, **Express**, and **Prisma** ORM.

The backend provides APIs for managing exploits, analytics, contributions, resources, and live alerts related to blockchain protocols. It also includes scripts for ingesting and scraping exploit data.

---

## 📚 Table of Contents

- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Exploits](#exploits)
  - [Analytics](#analytics)
  - [Contributions](#contributions)
  - [Resources](#resources)
  - [Live Tracker](#live-tracker)
- [Scripts](#scripts)
  - [Ingest Sample Exploits](#ingest-sample-exploits)
  - [Scrape Rekt](#scrape-rekt)
- [Docker Support](#docker-support)
- [Development](#development)
- [License](#license)

---

## 📁 Project Structure

 
.
├── .env                  # Environment variables (not included in version control)
├── .gitignore            # Git ignore file
├── Dockerfile            # Docker configuration
├── exploits.json         # Sample exploit data
├── package.json          # Node.js dependencies and scripts
├── prisma/               # Prisma ORM configuration and migrations
│   ├── migrations/       # Database migrations
│   └── schema.prisma     # Prisma schema
├── src/                  # Source code
│   ├── config/           # Configuration files
│   ├── routes/           # API route handlers
│   ├── scripts/          # Utility scripts
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main entry point
├── tsconfig.json         # TypeScript configuration
└── tsconfig.tsbuildinfo  # TypeScript build info
---

## Key Directories and Files

- **`prisma/`**: Contains the Prisma schema and database migrations.
- **`src/routes/`**: Contains route handlers for various API endpoints.
- **`src/scripts/`**: Contains scripts for ingesting and scraping exploit data.
- **`src/types/`**: Contains TypeScript type definitions.
- **`Dockerfile`**: Configuration for containerizing the application.

---
\
## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/harshdev2909/Superteam-Security-Dashboard-backend.git
   cd superteam-backend 
2. Install dependencies:
    ```bash
npm install

3. Set up the .env file with the following variables:
    ```bash
    DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
4. Apply Prisma migrations to set up the database
    ```bash
    npx prisma migrate dev
5.  Start the development server:
    npm run dev


## 🌱 Environment Variables

The application requires the following environment variables:

- **`DATABASE_URL`**: Connection string for the PostgreSQL database.

---

## 🗂️ Database Schema

The database schema is defined in `schema.prisma`. It includes the following models:

- **`Exploit`**: Stores information about blockchain exploits.
- **`Analytics`**: Stores aggregated analytics data.
- **`Resource`**: Stores educational resources.
- **`Contribution`**: Stores user-submitted contributions.
- **`Alert`**: Stores live alerts for suspicious activities.

## 🚀 API Endpoints

Exposes RESTful APIs for managing exploits, analytics, contributions, resources, and live alerts.

### 🔍 Exploits

- `GET /exploits`: Fetch a list of exploits with optional filters (e.g., date, protocol, type).
- `GET /exploits/:id`: Fetch a single exploit by ID.
- `POST /exploits`: Create a new exploit (admin use).  
**Implementation**: `exploits.ts`

### 📊 Analytics

- `GET /analytics`: Fetch aggregated analytics data (e.g., total exploits, funds lost, response time).  
**Implementation**: `analytics.ts`

### 🙌 Contributions

- `GET /contributions`: Fetch all contributions with optional status filters.
- `GET /contributions/:id`: Fetch a single contribution by ID.
- `POST /contributions`: Submit a new contribution.  
**Implementation**: `contributions.ts`

### 📚 Resources

- `GET /resources`: Fetch all resources.
- `POST /resources`: Add a new resource.  
**Implementation**: `resources.ts`

### 📡 Live Tracker

- `WebSocket /api/live-tracker`: Provides real-time alerts for suspicious activities.  
**Implementation**: `live-tracker.ts`

---

## 🛠️ Scripts
    
### Ingest Sample Exploits

Script to ingest sample exploit data from `exploits.json` into the database. :-
    
```bash
    ts-node src/scripts/ingestSampleExploits.ts

---
## Prisma Client Generation

If you update the Prisma schema, regenerate the Prisma client:

    ```bash
npx prisma generate
