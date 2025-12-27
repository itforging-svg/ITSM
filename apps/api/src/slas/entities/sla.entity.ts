import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../users/entities/organization.entity';

@Entity('slas')
export class Sla {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @Column()
    org_id: string;

    @Column('jsonb', { nullable: true })
    conditions: Record<string, any>; // e.g., { "priority": "high" }

    @Column('int')
    response_time_minutes: number;

    @Column('int')
    resolution_time_minutes: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
