import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualAgentService } from './virtual-agent.service';
import { VirtualAgentGateway } from './virtual-agent/virtual-agent.gateway';
import { ChatSession } from '../ai-engine/entities/chat-session.entity';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession]),
    AiEngineModule,
  ],
  providers: [VirtualAgentService, VirtualAgentGateway],
})
export class VirtualAgentModule { }
