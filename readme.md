# High-Performance API with Real-time Data Processing

## Project Overview

This project demonstrates enterprise-level backend architecture with:
- **High-Performance API**: Optimized database queries, caching strategies, and pagination
- **Real-time Processing**: WebSocket support, background job processing, and event streaming
- **Load Testing**: Comprehensive performance metrics and stress testing

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Databases**: PostgreSQL
- **Caching**: Redis
- **Message Queue**: Bull (Redis-based)
- **Real-time**: WebSocket (ws)
- **Load Testing**: Artillery
- **Containerization**: Docker & Docker Compose

## Deployment

- **Deployed At**:  [https://high-perf-api.onrender.com](https://high-perf-api.onrender.com)

- **Swagger / API Docs**: [https://high-perf-api.onrender.com/api/docs](https://high-perf-api.onrender.com/api/docs)  
- **Bull Board (Job Queue Dashboard)**: [https://high-perf-api.onrender.com/api/queues](https://high-perf-api.onrender.com/api/queues)


## Project Structure

```
.
├── Dockerfile                # Container configuration
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Example environment variables for reference
├── .github                     # GitHub workflows
│   └── workflows
│       └── deploy-high-perf-api.yml   # CI/CD workflow for deployment
├── .gitignore                  # Files/folders ignored by Git
├── package.json              # Dependencies
├── package-lock.json           # Exact versions of installed dependencies
├── tsconfig.json             # TypeScript configuration
├── index.ts                  # Application entry point
│
├── src/
│   ├── config/               # Environment and configuration
│   │   ├── config.ts
│   │   └── env.schema.ts
│   ├── controllers/          # Request handlers
│   │   ├── order.controller.ts
│   │   └── data-record.controller.ts
│   ├── services/             # Business logic
│   │   ├── order.service.ts
│   │   └── data-record.service.ts
│   ├── repositories/         # Data access layer
│   │   ├── order.repository.ts
│   │   └── data-record.repository.ts
│   ├── routes/               # API endpoints
│   │   ├── order.route.ts
│   │   ├── data-record.route.ts
│   │   └── index.ts
│   ├── entities/             # Database models
│   │   ├── order.entity.ts
│   │   └── data-record.entity.ts
│   ├── database/             # Database setup
│   │   ├── data-source.ts
│   │   ├── database.ts
│   │   ├── migrations/       # Database migrations
│   │   └── seeders/          # Database seeders
│   ├── middleware/           # Express middleware
│   │   ├── loggerMiddleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── queue/                # Background jobs
│   │   ├── dataQueue.ts
│   │   └── bullBoard.ts      # Bull job dashboard
│   ├── swagger/              # Swagger/OpenAPI setup
│   │   └── swaggerService.ts
│   ├── workers/              # Job processors
│   │   └── dataWorker.ts
│   ├── ws/                   # WebSocket server
│   │   └── webSocketServer.ts
│   ├── schemas/              # Validation schemas
│   │   ├── order.schema.ts
│   │   └── data-record.schema.ts
│   ├── dtos/                 # Data transfer objects
│   ├── interfaces/           # TypeScript interfaces
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   │   └── redis.ts
│   ├── server.ts             # Server initialization
│   └── logger.ts             # Logging configuration
│
├── artillery/                # Load testing
│   ├── test/                 # Test configurations
│   │   ├── high-throughput.yml
│   │   └── load-test-orders.yml
│   └── reports/              # Test results
│       ├── high-throughput.json
│       └── orders-load.json
│
├── bruno/                    # API client configuration
│   └── high-perf-api.json
│
├── reports/                  # Test reports and screenshots
│   ├── orders-test-metrics.pdf
│   ├── orders-test-overview.pdf
│   └── screenshots/          # Test execution screenshots
│       ├── data-record/      # Data processing test results
│       └── orders/           # Orders API test results
│
├── logs/                     # Application logs
    ├── 2025-12-02.log
    └── 2025-12-03.log
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Environment Variables
Key environment variables in `.env`:

```en
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Server
PORT=8000

# Database Configuration
DB_LOGGING=false
DB_POOL_SIZE=50
SLOW_QUERY_TIME=400

# Redis
REDIS_URL=redis://localhost:6379
```

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run migration:run

# Seed initial data
npm run orders:seed
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Core Features

### System 1: High-Performance Orders API

#### Endpoints
- `GET /api/orders` - Retrieve orders with pagination and caching
- `GET /api/orders/:id` - Get single order by ID
- `GET /api/orders/stats` - Aggregated order statistics (cached)
- `POST /api/orders` - Create single or batch orders
- `GET /api/orders/search` - Full-text search with filtering

### System 2: Real-time Data Processing

#### Endpoints
- `POST /api/data/ingest` - Stream or batch data ingestion
- `GET /api/data/stats` - Real-time statistics
- `GET /api/data/history` - Historical data retrieval
- `GET /api/queues` - Access the Bull job queue dashboard at to monitor
- `WS /ws` - WebSocket real-time updates

---

## Test Results & Screenshots

### Data Record Tests - Real-time Data Processing

#### Test 1: Batch Data Ingestion

* ![Batch Ingest](./reports/screenshots/data-record/test-1-batch-ingest.png)
  *Verification of batch data ingestion endpoint processing multiple records simultaneously*
* ![Bull Board - Batch](./reports/screenshots/data-record/test-1-bull-board.png)
  *Bull job queue dashboard showing queued jobs after batch ingestion*

#### Test 2: Live WebSocket Updates

* ![Live Update](./reports/screenshots/data-record/test-2-live-update.png)
  *WebSocket connection receiving live data updates in real-time*

#### Test 3: Multiple WebSocket Connections

* ![WebSocket Client 1](./reports/screenshots/data-record/test-3-ws1.png)
  *First WebSocket client connection and message receipt*
* ![WebSocket Client 2](./reports/screenshots/data-record/test-3-ws2.png)
  *Second WebSocket client connection verifying broadcast functionality*

#### Test 4: Job Queue Status with Multiple Connections

* ![Bull Board - Multiple Connections](./reports/screenshots/data-record/test-4-queue-status-bull-board.png)
  *Bull dashboard showing job processing with multiple concurrent WebSocket connections*

#### Test 5: High-Throughput Load (1000 requests)

* ![Bull Board - 1000 Requests](./reports/screenshots/data-record/test-5-1000req-board.png)
  *Bull job queue managing 1000 concurrent data processing requests*
* ![Redis - 1000 Requests](./reports/screenshots/data-record/test-5-redis-bullmq.png)
  *BullMQ queue in Redis used for concurrent data processing requests*
* ![API Response - 1000 Requests](./reports/screenshots/data-record/test-5-1000req.png)
  *API performance metrics under 1000 simultaneous requests*
* ![Database Performance](./reports/screenshots/data-record/test-5-database.png)
  *Database metrics showing connection pool and query performance at peak throughput*
* ![WebSocket Event Processing](./reports/screenshots/data-record/test-5-processed-ws-event.png)
  *Verified WebSocket events processed and delivered to all connected clients*

---

### Orders API Tests - High-Performance Database Queries

#### Test 1: GET Orders

* ![Orders with Cache](./reports/screenshots/orders/test-1-orders-with-cache.png)
  *Orders endpoint response time with Redis caching enabled - Response time < 100ms*
* ![Orders without Cache](./reports/screenshots/orders/test-1-orders-without-cached.png)
  *Orders endpoint response time with direct database queries - Response time < 500ms*

#### Test 2: Order Statistics

* ![Stats with Cache](./reports/screenshots/orders/test-2-stats-with-cached.png)
  *Aggregated statistics endpoint with Redis cache - Sub-100ms response time*
* ![Stats without Cache](./reports/screenshots/orders/test-2-stats-without-cached.png)
  *Aggregated statistics endpoint with direct database aggregation*

#### Test 3: Search Functionality

* ![Search with Cache](./reports/screenshots/orders/test-3-search-with-cached.png)
  *Full-text search endpoint with indexed queries and caching - Fast response*
* ![Search without Cache](./reports/screenshots/orders/test-3-search-without-cached.png)
  *Full-text search using database indexes directly*

#### Test 4: Order Creation

* ![Create Orders Batch](./reports/screenshots/orders/test-4-test-1-create-orders-batch.png)
  *POST endpoint batch inserting 100 orders efficiently*
* ![Create Order Single](./reports/screenshots/orders/test-4-test-1-create-orders-single.png)
  *POST endpoint creating single order with validation*

#### Test 5: Final Performance Summary

* ![Performance Summary](./reports/screenshots/orders/test-5-Screenshot%202025-12-03%20at%2002.31.05.png)
  *Comprehensive performance metrics summary for all Orders API endpoints*

---


## Load Testing

### Artillery Tests
Test configurations are located in `artillery/test/`:

```bash
# Run orders API load test
npx artillery run artillery/test/load-test-orders.yml

# Run high-throughput test
npx artillery run artillery/test/high-throughput.yml
```

### Test Reports
- **High-Throughput Report**: `artillery/reports/high-throughput.json`
- **Orders Load Report**: `artillery/reports/orders-load.json`

## Contact

Author: [mykks32](https://github.com/mykks32)