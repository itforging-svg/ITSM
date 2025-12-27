import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    domain: string;

    @Column('jsonb', { default: {} })
    settings: Record<string, any>;

    @OneToMany(() => User, (user) => user.organization)
    users: User[];

    @CreateDateColumn()
    created_at: Date;
}
