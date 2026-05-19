/**
 * DEVICE ENTITY — TypeORM
 *
 * Represents a mobile device model (e.g. "iPhone 15 Pro").
 * A Device is the "parent" — it doesn't have a price or stock directly.
 * Prices and stock live on DeviceVariant (one per color+storage combination).
 *
 * Why separate Device from DeviceVariant?
 *   - An iPhone 15 Pro in 128GB Black and 256GB White are the SAME device
 *   - But they have different prices and different stock levels
 *   - Splitting them avoids duplicating the device name/description for every variant
 *   - This is called "1NF normalization" — don't repeat yourself in your schema
 *
 * This separation is also what creates the N+1 query problem we'll demo:
 *   - Fetching 6 devices WITHOUT eager loading = 1 query + 6 more for variants = 7 queries
 *   - Fetching WITH eager loading (JOIN) = 1 query total
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeviceVariant } from './device-variant.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "iPhone 15 Pro"
  @Column()
  name: string;

  // e.g. "Apple"
  @Column()
  brand: string;

  // Marketing description shown on the product detail page
  @Column({ type: 'text' })
  description: string;

  // base_price is the starting price shown on listing cards (e.g. "From $999")
  // The actual price per variant is base_price + variant.priceDelta
  // decimal(10,2) — stores monetary values with 2 decimal places without floating point errors
  // Never use float for money — float(0.1 + 0.2) = 0.30000000000000004
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  // Static URL pointing to a product image (we don't handle uploads in this learning project)
  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // @OneToMany — one device has many variants (color + storage combinations)
  // eager: false (default) — variants are NOT loaded unless you explicitly ask
  // This is what causes the N+1 problem in /products/slow
  @OneToMany(() => DeviceVariant, (variant) => variant.device)
  variants: DeviceVariant[];
}
