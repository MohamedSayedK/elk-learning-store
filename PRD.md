# PRD: Mobile Device Store — Backend Architecture Learning Simulation

## Problem Statement

A developer joining a team that uses enterprise backend infrastructure (ELK stack, Redis, RabbitMQ, PostgreSQL query optimization) has no hands-on experience with any of these technologies. Reading documentation alone is insufficient — the developer learns best by seeing systems react in real time. There is no existing project that combines all these technologies in a single, runnable, visually demonstrable simulation.

## Solution

A full-stack Mobile Device Store application that serves as a living demonstration of enterprise backend architecture. The store is functionally realistic (browse devices, configure variants, place orders) but architecturally instrumented — every infrastructure layer is visible and interactive. An Angular admin dashboard and Kibana instance surface Redis cache stats, RabbitMQ queue depth, slow query indicators, and live log streams so the developer can observe each technology reacting to their own actions in real time.

The project is built incrementally, one technology layer at a time, so each concept is understood before the next is introduced.

## User Stories

### Customer (Store UI)

1. As a customer, I want to see a listing of available mobile devices, so that I can browse what is for sale.
2. As a customer, I want to see each device's name, image, starting price, and available brands, so that I can compare options at a glance.
3. As a customer, I want to click on a device and be taken to a configuration page, so that I can customize my purchase.
4. As a customer, I want to select a color variant for a device, so that I can get the device in my preferred color.
5. As a customer, I want to select a storage variant for a device, so that I can choose the capacity I need.
6. As a customer, I want to see the price update when I change configuration options, so that I know what I will pay.
7. As a customer, I want to see stock availability for my selected configuration, so that I know if the item can be ordered.
8. As a customer, I want to place an order for my configured device, so that I can purchase it.
9. As a customer, I want to see an order confirmation screen after placing an order, so that I know my order was received.
10. As a customer, I want to register an account, so that I can place orders and view my history.
11. As a customer, I want to log in to my account, so that my session is preserved across visits.
12. As a customer, I want to view my order history, so that I can track past purchases.
13. As a customer, I want to see the current status of each order (pending, confirmed, completed), so that I know where my order is in the pipeline.
14. As a customer, I want to log out of my account, so that my session is terminated securely.

### Admin (Dashboard UI)

15. As an admin, I want to log in with elevated privileges, so that I can access the system dashboard.
16. As an admin, I want to see live RabbitMQ queue depth for each queue (order.created, order.confirmed, order.completed), so that I can observe messages flowing through the pipeline.
17. As an admin, I want to see messages drain from queues in real time after placing a test order, so that I can understand async message processing visually.
18. As an admin, I want to see Redis cache hit and miss counts, so that I can understand how caching reduces database load.
19. As an admin, I want to see which Redis keys are currently active, so that I can observe session tokens and product cache entries.
20. As an admin, I want to see a slow query indicator when a database query exceeds a threshold, so that I can understand what makes a query expensive.
21. As an admin, I want to see a side-by-side response time comparison between cached and uncached product listing requests, so that I can measure the Redis performance benefit.
22. As an admin, I want to see a live stream of recent log events (last 20), so that I can observe system activity without leaving the app.
23. As an admin, I want to see total orders placed, so that I can monitor store activity.
24. As an admin, I want to trigger a cache flush for the product listing, so that I can observe cache invalidation and the next request repopulating it.

### Developer / Learning Scenarios

25. As a learner, I want to place an order and watch three RabbitMQ queue events fire in sequence on the dashboard, so that I understand async pipeline chaining.
26. As a learner, I want to load the product listing page twice and see cache hit rate increase on the second load, so that I understand read-through caching.
27. As a learner, I want to open Kibana and see structured log events for every action I just performed, so that I understand what ELK captures.
28. As a learner, I want to build a Kibana dashboard showing orders per minute and cache hit rate over time, so that I understand ELK visualization.
29. As a learner, I want to see an N+1 query warning in the admin dashboard when the product listing is fetched without eager loading, so that I understand what makes a query expensive.
30. As a learner, I want to start the entire project with a single `docker-compose up` command, so that I spend time learning, not configuring.

## Implementation Decisions

### Project Structure

- Single monorepo with two top-level directories: `backend/` and `frontend/`
- `docker-compose.yml` at root orchestrates all services
- Backend is a NestJS monorepo using `@nestjs/cli` workspace mode

### Backend Services

**api-gateway** — Main REST API, handles all client-facing HTTP requests:
- Auth module (register, login, logout, JWT issuance)
- Products module (listing, detail, variants)
- Orders module (create order, order history, order status)
- Cache module (Redis integration, cache hit/miss metrics endpoint)
- Health module (exposes RabbitMQ queue depth, Redis stats for admin dashboard)

**inventory-service** — RabbitMQ consumer for `order.created` queue:
- Deducts stock for ordered variant
- Publishes to `order.confirmed` queue on success
- Publishes to `order.failed` queue on insufficient stock

**notification-service** — RabbitMQ consumer for `order.confirmed` queue:
- Simulates sending email/SMS (logs the notification, no real sending)
- Publishes to `order.completed` queue

**analytics-service** — RabbitMQ consumer for `order.completed` queue:
- Increments order count aggregates in PostgreSQL
- Updates sales stats used by admin dashboard

### Database Schema (PostgreSQL + TypeORM)

- `users` — id, email, password hash, role (customer/admin), created_at
- `devices` — id, name, brand, description, base_price, image_url
- `device_variants` — id, device_id (FK), color, storage_gb, price_delta, stock_count
- `orders` — id, user_id (FK), variant_id (FK), status (pending/confirmed/completed/failed), total_price, created_at
- `order_events` — id, order_id (FK), event_type, payload (JSON), created_at

### Redis Cache Layers

- **Product listing cache** — key: `products:listing`, TTL: 5 minutes, stores serialized product array with variant summaries
- **Product detail cache** — key: `products:detail:{id}`, TTL: 10 minutes, stores full product with all variants
- **Session store** — key: `session:{userId}`, TTL: matches JWT expiry (24h), stores JWT payload for fast validation

Cache invalidation: product listing and detail caches are cleared when an admin triggers a flush via the dashboard endpoint.

### RabbitMQ Pipeline

```
POST /orders
  └─► publish → [order.created]
        └─► inventory-service consumes
              ├─► stock OK → publish → [order.confirmed]
              └─► stock fail → publish → [order.failed]
                    └─► notification-service consumes
                          └─► publish → [order.completed]
                                └─► analytics-service consumes
```

Exchange type: direct. Each queue has a dead-letter queue for failed messages.

### Logging (ELK)

- NestJS services use Winston with a custom transport that writes structured JSON to stdout
- Logstash configured to tail stdout via Docker log driver, parse JSON, forward to Elasticsearch
- Log schema fields: `timestamp`, `level`, `service`, `event`, `userId`, `metadata` (object)
- Events logged: product_viewed, variant_selected, order_placed, queue_event_published, queue_event_consumed, cache_hit, cache_miss, slow_query_detected, auth_login, auth_logout
- Slow query threshold: 200ms, detected via TypeORM query subscriber

### Auth

- JWT issued on login, signed with secret from environment variable
- JWT payload: `{ sub: userId, role: 'customer'|'admin', sessionKey: string }`
- On each request, NestJS guard validates JWT signature then checks Redis session key exists (allows server-side logout)
- Angular stores token in memory (service variable), not localStorage
- `@Roles('admin')` guard decorator restricts admin endpoints

### Angular App Structure

- Two route groups: `/store/*` (customer) and `/admin/*` (admin)
- Store: `/store/devices` (listing), `/store/devices/:id` (config page), `/store/checkout`, `/store/orders`
- Admin: `/admin/dashboard` (live stats), `/admin/logs` (log stream)
- Admin dashboard polls NestJS health endpoint every 3 seconds for queue/cache stats
- Kibana embedded via iframe in admin panel for full ELK access

### Docker Compose Services

| Service | Port | Purpose |
|---|---|---|
| postgres | 5432 | Primary database |
| redis | 6379 | Cache + sessions |
| rabbitmq | 5672 / 15672 | Message broker + management UI |
| elasticsearch | 9200 | Log storage + search |
| logstash | 5044 | Log ingestion pipeline |
| kibana | 5601 | Log visualization |
| api-gateway | 3000 | Main NestJS API |
| inventory-service | 3001 | Order queue consumer |
| notification-service | 3002 | Confirmed queue consumer |
| analytics-service | 3003 | Completed queue consumer |
| frontend | 4200 | Angular dev server |

### Build Order

Each layer is fully functional and demonstrable before the next is added:

1. PostgreSQL + NestJS api-gateway (products, auth, orders CRUD)
2. Redis caching (product listing + detail + sessions)
3. RabbitMQ pipeline (all 3 consumers)
4. ELK stack (Winston logging + Logstash + Kibana)
5. Angular store UI (customer flows)
6. Angular admin dashboard (live stats + Kibana iframe)

## Testing Decisions

**What makes a good test here:** Test observable behavior at service boundaries — HTTP responses, database state after a queue message is consumed, cache state after a product is fetched. Do not test internal implementation details (do not assert that a specific Redis method was called, assert that the second request returns faster and the cache hit count increased).

**Modules to test:**

- **api-gateway products module** — integration tests: fetch listing, assert Redis populated; fetch again, assert cache hit; flush cache, assert Redis cleared
- **api-gateway orders module** — integration test: place order, assert order row created with status `pending`, assert RabbitMQ message published to `order.created`
- **inventory-service** — integration test: consume a mock `order.created` message, assert stock decremented, assert `order.confirmed` published
- **auth module** — integration test: login, assert JWT returned, assert Redis session key exists; logout, assert Redis key deleted

**Not tested (out of scope for learning project):** Angular unit tests, E2E browser tests, notification-service (it only logs), analytics-service.

## Out of Scope

- Real payment processing
- Real email/SMS sending
- Product image upload (use static URLs)
- Search functionality (Elasticsearch used only for logs, not product search)
- Order cancellation
- Stock replenishment / admin product management
- Mobile responsive design
- Production deployment, CI/CD, secrets management
- Performance load testing
- Angular unit tests

## Further Notes

- RabbitMQ management UI (port 15672) is a free bonus visual tool — credentials `guest/guest` in dev
- Kibana setup requires creating an index pattern for `logstash-*` on first run — document this step clearly in README
- The N+1 query demo should be a dedicated endpoint `/products/listing/slow` that intentionally does not eager-load variants, next to `/products/listing` which does — makes the comparison concrete
- All services should log their startup with a banner showing which technology they represent, so the learner always knows what they are looking at
- Seed data script should pre-populate 6 devices with 3 color × 3 storage variants each (54 variant rows) — enough to make listing queries meaningfully expensive
