/**
 * NOTIFICATION SERVICE — RabbitMQ Consumer
 *
 * Listens on the 'order.confirmed' queue.
 * When inventory-service confirms stock is available, this service fires.
 *
 * Flow:
 *   order.confirmed → (this service) → logs mock email/SMS → publishes order.completed
 *
 * In a real app this would call SendGrid, Twilio, etc.
 * Here we just log the event so you can see it flow through in Kibana.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3002);

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       NOTIFICATION SERVICE — STARTED         ║');
  console.log('║   Technology: RabbitMQ (message consumer)    ║');
  console.log('║   Listening on queue: order.confirmed        ║');
  console.log('║   Simulates: email/SMS (logs only)           ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
