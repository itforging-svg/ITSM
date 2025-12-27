import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../ai-engine/entities/chat-session.entity';
import { AiEngineService } from '../ai-engine/ai-engine.service';

@Injectable()
export class VirtualAgentService {
    constructor(
        @InjectRepository(ChatSession)
        private sessionRepository: Repository<ChatSession>,
        private aiEngine: AiEngineService,
    ) { }

    async processMessage(userId: string, sessionId: string | null, message: string): Promise<{ sessionId: string, response: string }> {
        let session: ChatSession | null = null;

        if (sessionId) {
            session = await this.sessionRepository.findOne({ where: { id: sessionId, user_id: userId } });
        }

        if (!session) {
            session = this.sessionRepository.create({
                user_id: userId,
                history: [],
            });
            await this.sessionRepository.save(session);
        }

        // 1. Send to Gemini
        const aiResponse = await this.aiEngine.chat(session.id, message, session.history);

        // 2. Update History
        session.history.push({ role: 'user', parts: [{ text: message }] });
        session.history.push({ role: 'model', parts: [{ text: aiResponse }] });

        // Trim history if too long (optional for MVP)
        if (session.history.length > 20) session.history = session.history.slice(-20);

        await this.sessionRepository.save(session);

        return { sessionId: session.id, response: aiResponse };
    }
}
