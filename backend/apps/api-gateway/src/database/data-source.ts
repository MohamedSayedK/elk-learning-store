/**
 * DATA SOURCE — TypeORM CLI Configuration
 *
 * TypeORM has two ways to configure the database connection:
 *   1. Inside NestJS module (for the running app)
 *   2. This file (for the CLI — running migrations from the terminal)
 *
 * Why a separate file?
 *   The NestJS app uses dependency injection and environment variables loaded
 *   at runtime. The CLI runs OUTSIDE NestJS, so it needs its own config.
 *
 * Usage:
 *   npx typeorm migration:run -d apps/api-gateway/src/database/data-source.ts
 *   npx typeorm migration:revert -d apps/api-gateway/src/database/data-source.ts
 */

import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';
import { DeviceVariant } from './entities/device-variant.entity';
import { Order } from './entities/order.entity';
import { OrderEvent } from './entities/order-event.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',

  // In Docker, services talk to each other by container name ('postgres')
  // On your local machine (outside Docker), use 'localhost'
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'elk_store',

  // All entities that should be tracked by this data source
  entities: [User, Device, DeviceVariant, Order, OrderEvent],

  // Where migration files live
  migrations: [__dirname + '/migrations/*.ts'],

  // synchronize: false — NEVER use true in anything resembling production
  // synchronize:true would auto-alter your tables on every app start,
  // potentially dropping columns or data. Use migrations instead.
  synchronize: false,

  logging: true, // log every SQL query — great for learning what TypeORM generates
});
