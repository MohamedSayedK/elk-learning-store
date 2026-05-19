/**
 * DEVICE VARIANT ENTITY — TypeORM
 *
 * A variant is ONE specific configuration of a device.
 * Example: iPhone 15 Pro + Black + 256GB = one DeviceVariant row.
 *
 * With 6 devices × 3 colors × 3 storage options = 54 variant rows total.
 * This is intentional — 54 rows is enough to make unoptimized queries
 * noticeably slower than optimized ones (demonstrating the N+1 problem).
 *
 * The stock_count column is what the inventory-service decrements
 * when an order is placed. If stock_count = 0, the variant cannot be ordered.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.entity';
import { Order } from './order.entity';

@Entity('device_variants')
export class DeviceVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne — many variants belong to one device
  // @JoinColumn — this side holds the foreign key column (device_id)
  // onDelete: 'CASCADE' — if a device is deleted, all its variants are deleted too
  @ManyToOne(() => Device, (device) => device.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  // e.g. "Midnight Black", "Silver", "Deep Purple"
  @Column()
  color: string;

  // Storage in gigabytes — e.g. 128, 256, 512
  @Column({ name: 'storage_gb' })
  storageGb: number;

  // Price adjustment relative to device.basePrice
  // priceDelta = 0   → same as base price
  // priceDelta = 100 → $100 more than base price
  // priceDelta = -50 → $50 less than base price (e.g. smaller storage)
  // Actual price shown to user = device.basePrice + variant.priceDelta
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'price_delta' })
  priceDelta: number;

  // How many units are in stock for this exact color+storage combo
  // Decremented by inventory-service when an order is confirmed
  // When 0, this variant shows as "Out of Stock" in the UI
  @Column({ default: 50, name: 'stock_count' })
  stockCount: number;

  // One variant can be ordered many times (by different customers)
  @OneToMany(() => Order, (order) => order.variant)
  orders: Order[];
}
