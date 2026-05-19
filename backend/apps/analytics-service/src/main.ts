/**
 * ANALYTICS SERVICE — RabbitMQ Consumer
 *
 * Listens on the 'order.completed' queue — the final step in the pipeline.
 *
 * Flow:
 *   order.completed → (this service) → increments order count in PostgreSQL
 *
 * Why a separate service for counting?
 *   - Aggregation (counting, summing) is a write-heavy operation
 *   - Keeping it out of the main API prevents it from blocking customer requests
 *   - Demonstrates that RabbitMQ lets you add new consumers without changing existing code
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3003);

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        ANALYTICS SERVICE — STARTED           ║');
  console.log('║   Technology: RabbitMQ (message consumer)    ║');
  console.log('║   Listening on queue: order.completed        ║');
  console.log('║   Updates: order count aggregates in DB      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
