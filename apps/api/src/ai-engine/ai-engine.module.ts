import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiEngineService } from './ai-engine.service';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { ChatSession } from './entities/chat-session.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([KnowledgeBase, ChatSession]),
  ],
  providers: [AiEngineService],
  exports: [AiEngineService],
})
export class AiEngineModule { }
