/**
 * API GATEWAY — Main Entry Point
 *
 * This is the ONLY service that exposes HTTP endpoints to the outside world.
 * Angular talks to this. Nothing else is directly reachable from the browser.
 *
 * Responsibilities:
 *   - Auth (register, login, logout)
 *   - Products (listing, detail, variants)
 *   - Orders (place order, order history)
 *   - Cache stats (Redis hit/miss metrics)
 *   - Health endpoint (system-wide stats for admin dashboard)
 *
 * Port: 3000
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow Angular (localhost:4200) to call this API during development
  // CORS = Cross-Origin Resource Sharing — browsers block cross-origin requests by default
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true, // needed to send Authorization header with JWT
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║          API GATEWAY — STARTED               ║');
  console.log('║   Technology: NestJS + PostgreSQL            ║');
  console.log('║   HTTP API:   http://localhost:3000          ║');
  console.log('║   Test it:    GET http://localhost:3000      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
