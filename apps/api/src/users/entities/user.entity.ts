import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
    ADMIN = 'admin',
    AGENT = 'agent',
    EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    full_name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.EMPLOYEE,
    })
    role: UserRole;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ default: true })
    is_active: boolean;

    @ManyToOne(() => Organization, (org) => org.users)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @CreateDateColumn()
    created_at: Date;
}
