import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TicketStatus {
    NEW = 'new',
    OPEN = 'open',
    PENDING = 'pending',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, generated: 'increment' })
    ticket_number: number;

    @Column()
    subject: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.NEW,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @Column({ nullable: true }) // Storing ID for ease of lookup
    requester_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignee_id' })
    assignee: User;

    @Column({ nullable: true })
    assignee_id: string;

    // AI Fields
    @Column('float', { nullable: true })
    sentiment_score: number;

    @Column({ type: 'text', nullable: true })
    auto_summary: string;

    @Column({ type: 'timestamp', nullable: true })
    sla_due_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
