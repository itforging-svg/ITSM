import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketEvent } from './entities/ticket-event.entity';
import { SlasModule } from '../slas/slas.module';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketEvent]),
    SlasModule,
    AiEngineModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule { }
