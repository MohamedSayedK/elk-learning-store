# Mobile Device Store — Backend Architecture Learning Project

A hands-on learning simulation covering **ELK Stack**, **Redis**, **RabbitMQ**, and **PostgreSQL** query optimization, built with **NestJS** + **Angular**.

## What you will learn

| Technology | What it does in this project |
|---|---|
| **PostgreSQL** | Stores devices, variants, users, orders. We demo N+1 queries to show why indexes and eager loading matter. |
| **Redis** | Caches product listings and sessions. You'll see cache hit/miss rates in real time. |
| **RabbitMQ** | Processes orders async across 3 services. You'll watch messages flow between queues live. |
| **ELK Stack** | Every action you take in the store is logged and searchable in Kibana. |

## Start everything

```bash
docker-compose up
```

That's it. All 11 services start automatically.

## Service URLs

| Service | URL | What to do there |
|---|---|---|
| Angular Store | http://localhost:4200 | Browse and order devices |
| API Gateway | http://localhost:3000 | REST API (used by Angular) |
| RabbitMQ UI | http://localhost:15672 | Watch queues fill/drain (guest/guest) |
| Kibana | http://localhost:5601 | Search and visualize logs |
| Elasticsearch | http://localhost:9200 | Raw log storage (API) |

## First-time Kibana setup

After `docker-compose up` and Kibana loads:

1. Open http://localhost:5601
2. Click **Stack Management** → **Index Patterns**
3. Click **Create index pattern**
4. Pattern: `logstash-*` → Next → Time field: `@timestamp` → Create
5. Go to **Discover** — your logs appear here!

## Reset everything (including data)

```bash
docker-compose down -v
```

The `-v` flag deletes Docker volumes, wiping PostgreSQL, Redis, and Elasticsearch data.

## Project structure

```
/
├── docker-compose.yml        ← starts everything
├── .env                      ← environment variables (not committed)
├── logstash/pipeline/        ← log ingestion config
├── backend/                  ← NestJS monorepo
│   ├── apps/
│   │   ├── api-gateway/      ← main HTTP API (port 3000)
│   │   ├── inventory-service/  ← RabbitMQ consumer (port 3001)
│   │   ├── notification-service/ ← RabbitMQ consumer (port 3002)
│   │   └── analytics-service/  ← RabbitMQ consumer (port 3003)
│   └── libs/shared/          ← shared DTOs and interfaces
└── frontend/                 ← Angular app (port 4200)
```

## Build order (issues)

Each layer is built and demonstrable before adding the next:

1. ✅ **Monorepo scaffold + Docker Compose** ← you are here
2. PostgreSQL schema + seed data
3. Products endpoints (with N+1 demo)
4. Auth (JWT + Redis sessions)
5. Orders endpoint
6. Redis caching layer
7. RabbitMQ 3-step pipeline
8. NestJS health endpoint
9. Angular store UI
10. ELK stack integration
11. Angular admin dashboard
