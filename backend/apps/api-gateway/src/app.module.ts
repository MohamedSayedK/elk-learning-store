/**
 * APP MODULE — NestJS Root Module
 *
 * NestJS organizes code into modules. The AppModule is the root —
 * everything else gets imported here.
 *
 * Modules we import here:
 *   ConfigModule  — loads .env variables so all other modules can use them
 *   TypeOrmModule — connects to PostgreSQL and makes repositories available
 *
 * Future modules (added in later issues):
 *   ProductsModule — Issue #3
 *   AuthModule     — Issue #4
 *   OrdersModule   — Issue #5
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './database/entities/user.entity';
import { Device } from './database/entities/device.entity';
import { DeviceVariant } from './database/entities/device-variant.entity';
import { Order } from './database/entities/order.entity';
import { OrderEvent } from './database/entities/order-event.entity';

@Module({
  imports: [
    // ConfigModule — reads .env file and makes values available via ConfigService
    // isGlobal: true means you don't need to import ConfigModule in every sub-module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // relative to where the app is started (project root in Docker)
    }),

    // TypeOrmModule — connects to PostgreSQL
    // useFactory lets us use async config (needed because ConfigService is async)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        // In Docker, this is the container name ('postgres')
        // Locally (outside Docker), it's 'localhost'
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get('POSTGRES_USER', 'postgres'),
        password: config.get('POSTGRES_PASSWORD', 'postgres'),
        database: config.get('POSTGRES_DB', 'elk_store'),

        // All entities that TypeORM should know about
        // Adding an entity here tells TypeORM to look for its table
        entities: [User, Device, DeviceVariant, Order, OrderEvent],

        // synchronize: false — use migrations instead (see database/migrations/)
        // NEVER set to true in anything resembling production
        synchronize: false,

        // logging: true — prints every SQL query to the console
        // Extremely useful for learning what NestJS/TypeORM generates
        // You'll see the difference between N+1 queries and optimized JOIN queries
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
