/**
 * USER ENTITY — TypeORM
 *
 * TypeORM maps this TypeScript class to a PostgreSQL table called 'users'.
 * Each property decorated with @Column() becomes a database column.
 *
 * Why TypeORM instead of raw SQL?
 *   - Write TypeScript, get SQL — no manual CREATE TABLE statements
 *   - Relations (@OneToMany, @ManyToOne) are expressed as object references
 *   - Migrations track schema changes over time, like git for your database
 *
 * This entity stores accounts for both customers and admins.
 * The 'role' column controls what each user can do.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

// UserRole enum — restricts role values to known strings
// Prevents typos like role = 'Admin' vs 'admin' causing silent bugs
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

// @Entity() tells TypeORM: create a table named 'users' for this class
@Entity('users')
export class User {
  // @PrimaryGeneratedColumn('uuid') — auto-generates a UUID as the primary key
  // UUID (e.g. "a1b2c3-...") is preferred over auto-increment integers in distributed systems
  // because two services can generate IDs independently without collision
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true — PostgreSQL creates a UNIQUE INDEX on this column
  // Trying to insert two users with the same email throws a DB constraint error
  @Column({ unique: true })
  email: string;

  // Never store plain passwords — always store a bcrypt hash
  // bcrypt hash looks like: "$2b$10$..." — the original password cannot be recovered from it
  // select: false — this column is EXCLUDED from queries by default
  // You must explicitly request it: repo.findOne({ select: ['password'] })
  @Column({ select: false })
  password: string;

  // 'enum' column type — PostgreSQL stores the string but validates against allowed values
  // Inserting role = 'superuser' would throw a DB error
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  // @CreateDateColumn — TypeORM automatically sets this to NOW() on INSERT
  // You never need to set it manually
  @CreateDateColumn()
  createdAt: Date;

  // @OneToMany — one user can have many orders
  // The second argument () => Order is needed to avoid circular import issues
  // 'order => order.user' tells TypeORM which side owns the foreign key
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
