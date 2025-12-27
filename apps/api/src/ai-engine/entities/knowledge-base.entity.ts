import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../users/entities/organization.entity';

@Entity('knowledge_base')
export class KnowledgeBase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ nullable: true })
    category: string;

    @Column('text', { array: true, default: [] })
    tags: string[];

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @Column()
    org_id: string;

    // Storing as JSON for simplicity in MVP, but pgvector would be used in prod
    @Column('jsonb', { nullable: true })
    embedding: number[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
