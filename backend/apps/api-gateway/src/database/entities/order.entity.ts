/**
 * ORDER ENTITY — TypeORM
 *
 * Created the moment a customer clicks "Place Order".
 * Starts with status 'pending' — then the RabbitMQ pipeline updates it:
 *
 *   pending → confirmed (inventory-service deducted stock)
 *          → completed (notification-service logged mock email)
 *          → failed    (inventory-service found stock = 0)
 *
 * The status field is what lets us show live order progress in the UI.
 * You can watch it change by polling GET /orders/:id after placing an order.
 *
 * Why store total_price on the order instead of recalculating?
 *   - Prices can change after an order is placed
 *   - The customer paid a specific price at a specific time
 *   - Always snapshot the price at order time — never recalculate from current price
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DeviceVariant } from './device-variant.entity';
import { OrderEvent } from './order-event.entity';

// All possible states an order can be in
export enum OrderStatus {
  PENDING = 'pending',       // just created, awaiting inventory check
  CONFIRMED = 'confirmed',   // stock deducted, payment would happen here in real app
  COMPLETED = 'completed',   // notification sent, order fully processed
  FAILED = 'failed',         // insufficient stock or processing error
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Which customer placed this order
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Which exact device variant (color + storage) was ordered
  @ManyToOne(() => DeviceVariant, (variant) => variant.orders)
  @JoinColumn({ name: 'variant_id' })
  variant: DeviceVariant;

  // Current status — updated by RabbitMQ consumers as the order flows through the pipeline
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // Price snapshot at time of order — see comment above about why we store this
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  // Timeline of everything that happened to this order
  // Each step in the RabbitMQ pipeline appends an event here
  @OneToMany(() => OrderEvent, (event) => event.order, { cascade: true })
  events: OrderEvent[];
}
