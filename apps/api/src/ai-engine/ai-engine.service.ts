import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, SchemaType } from '@google/generative-ai';

@Injectable()
export class AiEngineService implements OnModuleInit {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(private configService: ConfigService) { }

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
                    toolResult = { results: "Restarting the device often fixes common issues. For VPN, ensure you are on a stable connection." };
                } else if (name === 'create_ticket') {
                    toolResult = { status: "success", ticketId: "TKT-123456" };
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
}
