/**
 * INVENTORY SERVICE — RabbitMQ Consumer
 *
 * This service does NOT expose any HTTP endpoints.
 * It only listens for messages on the RabbitMQ queue named 'order.created'.
 *
 * Flow:
 *   1. Customer places an order via api-gateway (POST /orders)
 *   2. api-gateway publishes a message to the 'order.created' queue
 *   3. THIS service wakes up, reads that message, deducts stock from the DB
 *   4. Then publishes to 'order.confirmed' (success) or 'order.failed' (out of stock)
 *
 * Why RabbitMQ instead of a direct HTTP call?
 *   - The api-gateway doesn't need to wait for stock deduction to respond to the customer
 *   - If this service crashes, the message stays in the queue and is retried automatically
 *   - Services are decoupled — api-gateway doesn't know or care that inventory-service exists
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This service does not listen on HTTP — it only processes queue messages
  // Port 3001 is kept for health checks only
  await app.listen(3001);

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║         INVENTORY SERVICE — STARTED          ║');
  console.log('║   Technology: RabbitMQ (message consumer)    ║');
  console.log('║   Listening on queue: order.created          ║');
  console.log('║   See it work: place an order in the store   ║');
  console.log('║   then watch RabbitMQ UI → localhost:15672   ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
