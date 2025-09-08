import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('currency_prices')
@Index(['timestamp'])
@Index(['symbol', 'timestamp'])
export class CurrencyPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  price_usd: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn()
  created_at: Date;
}
