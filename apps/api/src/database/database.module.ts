import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Organization } from '../users/entities/organization.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketEvent } from '../tickets/entities/ticket-event.entity';
import { Sla } from '../slas/entities/sla.entity';
import { Asset } from '../assets/entities/asset.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
                username: configService.get<string>('DB_USER', 'postgres'),
                password: configService.get<string>('DB_PASS', 'postgres'),
                database: configService.get<string>('DB_NAME', 'itsm'),
                entities: [User, Organization, Ticket, TicketEvent, Sla, Asset],
                synchronize: true, // TODO: Disable in production
            }),
        }),
    ],
})
export class DatabaseModule { }
