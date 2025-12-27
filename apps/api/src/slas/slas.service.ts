import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sla } from './entities/sla.entity';
import { Ticket, TicketPriority } from '../tickets/entities/ticket.entity';

@Injectable()
export class SlasService {
    constructor(
        @InjectRepository(Sla)
        private slasRepository: Repository<Sla>,
    ) { }

    async calculateSlaDueDate(ticket: Ticket): Promise<Date | null> {
        const slas = await this.slasRepository.find({
            where: { org_id: ticket.requester?.organization?.id, is_active: true }
        });

        // Strategy: Simple priority matching for now
        // In real app, we would use JSON logic or a rules engine
        const matchingSla = slas.find(sla =>
            sla.conditions?.priority === ticket.priority
        );

        if (!matchingSla) {
            // Fallback for demo: if no SLA exists, default based on priority
            const defaultMinutes = this.getDefaultMinutes(ticket.priority);
            return new Date(Date.now() + defaultMinutes * 60000);
        }

        // Return the resolution target
        return new Date(Date.now() + matchingSla.resolution_time_minutes * 60000);
    }

    private getDefaultMinutes(priority: TicketPriority): number {
        switch (priority) {
            case TicketPriority.URGENT: return 60;   // 1h
            case TicketPriority.HIGH: return 240;   // 4h
            case TicketPriority.MEDIUM: return 1440; // 24h
            case TicketPriority.LOW: return 2880;    // 48h
            default: return 1440;
        }
    }
}
