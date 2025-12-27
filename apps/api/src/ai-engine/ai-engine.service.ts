import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

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
            // Mock for demo if no API key
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
            // Simple JSON extraction (best effort)
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            return { priority: 'medium', sentiment: 0.5, summary: 'Error in AI analysis', category: 'General' };
        }
    }
}
