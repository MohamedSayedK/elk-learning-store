/**
 * MIGRATION: InitialSchema
 *
 * A migration is a versioned, reversible change to the database schema.
 * Think of it like a git commit, but for your database structure.
 *
 * Every migration has two methods:
 *   up()   — apply the change (create tables, add columns, etc.)
 *   down() — undo the change (drop tables, remove columns, etc.)
 *
 * Why migrations instead of synchronize:true?
 *   - synchronize:true can DROP columns if you rename them in your entity
 *   - Migrations are explicit — you see exactly what SQL runs
 *   - Migrations are versioned — teammates get the same schema
 *   - Migrations are reversible — you can roll back if something goes wrong
 *
 * Run:    npx typeorm migration:run   -d apps/api-gateway/src/database/data-source.ts
 * Revert: npx typeorm migration:revert -d apps/api-gateway/src/database/data-source.ts
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1716000000000 implements MigrationInterface {
  name = 'InitialSchema1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------------------------------------------------------
    // Create ENUM types first — PostgreSQL requires enum types to exist before
    // columns that reference them
    // -----------------------------------------------------------------------

    // user_role_enum: limits the 'role' column to exactly these two values
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('customer', 'admin')
    `);

    // order_status_enum: the 4 states an order can be in
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM ('pending', 'confirmed', 'completed', 'failed')
    `);

    // -----------------------------------------------------------------------
    // USERS table
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "email"       VARCHAR NOT NULL,
        "password"    VARCHAR NOT NULL,
        "role"        "user_role_enum" NOT NULL DEFAULT 'customer',
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // -----------------------------------------------------------------------
    // DEVICES table
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name"        VARCHAR NOT NULL,
        "brand"       VARCHAR NOT NULL,
        "description" TEXT NOT NULL,
        "basePrice"   DECIMAL(10,2) NOT NULL,
        "imageUrl"    VARCHAR NOT NULL,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_devices" PRIMARY KEY ("id")
      )
    `);

    // -----------------------------------------------------------------------
    // DEVICE VARIANTS table
    // Each row = one specific color + storage combination for a device
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "device_variants" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "device_id"   UUID NOT NULL,
        "color"       VARCHAR NOT NULL,
        "storage_gb"  INT NOT NULL,
        "price_delta" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "stock_count" INT NOT NULL DEFAULT 50,
        CONSTRAINT "PK_device_variants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_device_variants_device"
          FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE
      )
    `);

    // Index on device_id — speeds up queries like "get all variants for device X"
    // Without this index, PostgreSQL scans ALL 54 variant rows for every lookup
    // With it, it jumps directly to the 9 rows belonging to that device
    await queryRunner.query(`
      CREATE INDEX "IDX_device_variants_device_id" ON "device_variants" ("device_id")
    `);

    // -----------------------------------------------------------------------
    // ORDERS table
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"     UUID NOT NULL,
        "variant_id"  UUID NOT NULL,
        "status"      "order_status_enum" NOT NULL DEFAULT 'pending',
        "total_price" DECIMAL(10,2) NOT NULL,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_orders_variant"
          FOREIGN KEY ("variant_id") REFERENCES "device_variants"("id")
      )
    `);

    // -----------------------------------------------------------------------
    // ORDER EVENTS table — append-only audit log
    // -----------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "order_events" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "order_id"    UUID NOT NULL,
        "event_type"  VARCHAR NOT NULL,
        "payload"     TEXT,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_events_order"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // Enable UUID generation — PostgreSQL needs this extension to use uuid_generate_v4()
    // Run it before the tables, but it's safe to run after too (idempotent)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order — can't drop 'devices' while 'device_variants' references it
    await queryRunner.query(`DROP TABLE "order_events"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP INDEX "IDX_device_variants_device_id"`);
    await queryRunner.query(`DROP TABLE "device_variants"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
