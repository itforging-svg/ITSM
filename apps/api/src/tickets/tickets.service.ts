import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { TicketEvent } from './entities/ticket-event.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';
import { User } from '../users/entities/user.entity';
import { SlasService } from '../slas/slas.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
        @InjectRepository(TicketEvent)
        private eventsRepository: Repository<TicketEvent>,
        private slasService: SlasService,
        private aiEngineService: AiEngineService,
    ) { }

    async create(createTicketDto: CreateTicketDto, user: any): Promise<Ticket> {
        const ticket = new Ticket();
        ticket.subject = createTicketDto.subject;
        ticket.description = createTicketDto.description;
        ticket.requester = { id: user.userId } as User;

        // AI Analysis
        const aiResult = await this.aiEngineService.analyzeTicket(ticket.subject, ticket.description);
        ticket.priority = aiResult.priority as TicketPriority;
        ticket.sentiment_score = aiResult.sentiment;
        ticket.auto_summary = aiResult.summary;

        // SLA Calculation
        ticket.sla_due_at = await this.slasService.calculateSlaDueDate(ticket);

        const savedTicket = await this.ticketsRepository.save(ticket);

        // Audit Log: Created
        await this.eventsRepository.save(this.eventsRepository.create({
            ticket_id: savedTicket.id,
            actor_id: user.userId,
            event_type: 'created',
            content: 'Ticket created',
        }));

        return savedTicket;
    }

    async findAll(): Promise<Ticket[]> {
        return this.ticketsRepository.find({ relations: ['requester', 'assignee'] });
    }

    async findOne(id: string): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({
            where: { id },
            relations: ['requester', 'assignee']
        });
        if (!ticket) throw new NotFoundException(`Ticket #${id} not found`);
        return ticket;
    }

    async update(id: string, updateTicketDto: UpdateTicketDto, user: any): Promise<Ticket> {
        const ticket = await this.findOne(id);
        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;

        Object.assign(ticket, updateTicketDto);

        // Handle relation update if assignee_id is present
        if (updateTicketDto.assignee_id) {
            ticket.assignee = { id: updateTicketDto.assignee_id } as User;
        }

        const updatedTicket = await this.ticketsRepository.save(ticket);

        // Audit Log: Updates
        const changes: Record<string, any> = {};
        if (updateTicketDto.status && updateTicketDto.status !== oldStatus) changes.status = { old: oldStatus, new: updateTicketDto.status };
        if (updateTicketDto.priority && updateTicketDto.priority !== oldPriority) changes.priority = { old: oldPriority, new: updateTicketDto.priority };
        if (updateTicketDto.assignee_id) changes.assignee = { new: updateTicketDto.assignee_id };

        await this.eventsRepository.save(this.eventsRepository.create({
            ticket_id: id,
            actor_id: user.userId,
            event_type: 'updated',
            metadata: changes,
        }));

        return updatedTicket;
    }

    async getEvents(ticketId: string): Promise<TicketEvent[]> {
        return this.eventsRepository.find({
            where: { ticket_id: ticketId },
            order: { created_at: 'DESC' },
            relations: ['actor']
        });
    }
}
