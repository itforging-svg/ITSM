import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../users/entities/organization.entity';

export enum AssetStatus {
    ACTIVE = 'active',
    IN_REPAIR = 'in_repair',
    RETIRED = 'retired',
    LOST = 'lost',
}

@Entity('assets')
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    category: string; // e.g., 'Laptop', 'Mobile', 'Server'

    @Column({ unique: true })
    serial_number: string;

    @Column({ nullable: true })
    model_number: string;

    @Column({
        type: 'enum',
        enum: AssetStatus,
        default: AssetStatus.ACTIVE,
    })
    status: AssetStatus;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @Column()
    org_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ nullable: true })
    owner_id: string;

    @Column('jsonb', { nullable: true })
    specifications: Record<string, any>;

    @Column({ type: 'timestamp', nullable: true })
    purchase_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
