import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('orders')
@Index('idx_user_id', ['userId'])
@Index('idx_status', ['status'])
@Index('idx_created_at', ['createdAt'])
@Index('idx_total_amount', ['totalAmount'])
@Index('idx_search', ['productName'], {where: `"productName" IS NOT NULL`})
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    userId: string;

    @Column()
    productName: string;

    @Column('text')
    description: string;

    @Column('decimal', {precision: 10, scale: 2})
    totalAmount: number;

    @Column()
    status: 'pending' | 'completed' | 'cancelled';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}