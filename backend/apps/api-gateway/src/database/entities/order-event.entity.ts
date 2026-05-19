/**
 * ORDER EVENT ENTITY — TypeORM
 *
 * An append-only log of everything that happened to an order.
 * Every time a RabbitMQ consumer processes an order, it inserts a row here.
 *
 * Example timeline for one order:
 *   1. { event: 'order_created',    payload: { variantId, userId } }
 *   2. { event: 'stock_deducted',   payload: { newStockCount: 49 } }
 *   3. { event: 'notification_sent', payload: { channel: 'email', to: 'user@...' } }
 *   4. { event: 'order_completed',  payload: {} }
 *
 * This pattern is called an "event log" or "audit trail".
 * It lets you answer questions like: "At what time did the inventory change?"
 * without having to look at multiple tables.
 *
 * The 'payload' column is JSON — flexible enough to hold any event-specific data.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_events')
export class OrderEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Which order this event belongs to
  @ManyToOne(() => Order, (order) => order.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Short string describing what happened: 'order_created', 'stock_deducted', etc.
  @Column({ name: 'event_type' })
  eventType: string;

  // 'simple-json' — TypeORM serializes/deserializes this as JSON automatically
  // You write: event.payload = { newStockCount: 49 }
  // PostgreSQL stores: '{"newStockCount":49}'
  // You read back: event.payload.newStockCount → 49
  @Column({ type: 'simple-json', nullable: true })
  payload: Record<string, any>;

  // When this event happened — auto-set by TypeORM on INSERT
  @CreateDateColumn()
  createdAt: Date;
}
