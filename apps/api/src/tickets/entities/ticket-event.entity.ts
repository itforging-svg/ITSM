import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_events')
export class TicketEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Ticket)
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column()
    ticket_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'actor_id' })
    actor: User;

    @Column()
    actor_id: string;

    @Column()
    event_type: string; // 'status_change', 'comment', 'assignment'

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    @Column('text', { nullable: true })
    content: string;

    @Column({ default: false })
    is_internal: boolean;

    @CreateDateColumn()
    created_at: Date;
}
