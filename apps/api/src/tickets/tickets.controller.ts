import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    create(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
        return this.ticketsService.create(createTicketDto, req.user);
    }

    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }

    @Get(':id/history')
    getHistory(@Param('id') id: string) {
        return this.ticketsService.getEvents(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Request() req: any) {
        return this.ticketsService.update(id, updateTicketDto, req.user);
    }
}
