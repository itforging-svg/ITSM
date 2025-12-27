import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, SchemaType } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';

@Injectable()
export class AiEngineService implements OnModuleInit {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(
        private configService: ConfigService,
        @InjectRepository(KnowledgeBase)
        private kbRepository: Repository<KnowledgeBase>,
    ) { }

    onModuleInit() {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    async analyzeTicket(subject: string, description: string): Promise<{
        priority: 'low' | 'medium' | 'high' | 'urgent';
        sentiment: number;
        summary: string;
        category: string;
    }> {
        if (!this.model) {
            return { priority: 'medium', sentiment: 0.5, summary: 'AI summary disabled', category: 'General' };
        }

        const prompt = `
      Analyze the following IT Support ticket and return JSON:
      Subject: ${subject}
      Description: ${description}

      Fields:
      - priority: "low", "medium", "high", or "urgent"
      - sentiment: 0 to 1 (0 is very negative/urgent, 1 is positive)
      - summary: Concise 1-sentence summary
      - category: "Hardware", "Software", "Access", or "Network"
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            return { priority: 'medium', sentiment: 0.5, summary: 'Error in AI analysis', category: 'General' };
        }
    }

    async chat(sessionId: string, message: string, history: any[]): Promise<string> {
        if (!this.model) return "AI Chat is currently disabled (no API key).";

        const chat = this.model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
            },
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: 'search_knowledge_base',
                            description: 'Search for IT troubleshooting steps and policies',
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    query: { type: SchemaType.STRING, description: 'The search query' },
                                },
                                required: ['query'],
                            },
                        },
                        {
                            name: 'create_ticket',
                            description: 'Create a new support ticket if user request cannot be resolved via chat',
                            parameters: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    subject: { type: SchemaType.STRING },
                                    description: { type: SchemaType.STRING },
                                    priority: { type: SchemaType.STRING, enum: ['low', 'medium', 'high', 'urgent'], format: 'enum' },
                                },
                                required: ['subject', 'description'],
                            },
                        },
                    ],
                },
            ],
        });

        try {
            const result = await chat.sendMessage(message);
            const response = await result.response;

            const candidate = response.candidates && response.candidates[0];
            const call = candidate && candidate.content.parts.find(p => p.functionCall);

            if (call && call.functionCall) {
                const { name, args } = call.functionCall;
                console.log(`Gemini is calling: ${name}`, args);

                let toolResult: any;
                if (name === 'search_knowledge_base') {
                    const query = (args as any).query;
                    // Simple text search for MVP
                    const articles = await this.kbRepository.find({
                        where: [
                            { title: ILike(`%${query}%`) },
                            { content: ILike(`%${query}%`) }
                        ],
                        take: 3
                    });
                    toolResult = articles.length > 0
                        ? articles.map(a => `${a.title}: ${a.content}`).join('\n---\n')
                        : "No matching knowledge base articles found.";
                } else if (name === 'create_ticket') {
                    // Note: Ideally this calls TicketsService, but to avoid circular deps
                    // we can handle it via the repository directly or a common service.
                    // For now, we use a simple mock or direct repo access if we inject it.
                    toolResult = { status: "success", message: "A support ticket has been created for you. Ticket ID: TKT-AI-GEN" };
                }

                const finalResult = await chat.sendMessage([
                    {
                        functionResponse: {
                            name,
                            response: toolResult,
                        }
                    }
                ]);
                return finalResult.response.text();
            }

            return response.text();
        } catch (error) {
            console.error('Gemini Chat Error:', error);
            return "I'm having trouble connecting to my brain. Please try again later.";
        }
    }

    async seedKnowledgeBase(orgId: string) {
        const articles = [
            { title: 'VPN Reset', content: 'To reset your VPN, go to Settings > Network > VPN and click Reset Profile.' },
            { title: 'Password Policy', content: 'Passwords must be 12 characters, include 1 symbol, and expire every 90 days.' },
            { title: 'Printer Setup', content: 'Connect to the "Acme-Print-Server" using your employee ID.' }
        ];
        for (const a of articles) {
            const exists = await this.kbRepository.findOne({ where: { title: a.title, org_id: orgId } });
            if (!exists) {
                await this.kbRepository.save(this.kbRepository.create({ ...a, org_id: orgId }));
            }
        }
    }

    async summarizeThread(messages: any[]): Promise<string> {
        if (!this.model) return "AI Summary disabled.";
        const prompt = `Summarize the following chat history into a concise 1-paragraph summary for an IT agent:\n${JSON.stringify(messages)}`;
        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }
}
