
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

import { prisma } from './prisma.js';

export class AIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateStudyPlan(goal: string, availableHours: number, subjects: string[], pendingTasks: any[]) {
        const context = `
            Goal: ${goal}
            Available Time: ${availableHours} hours
            Subjects: ${subjects.join(', ')}
            Pending Tasks: ${pendingTasks.map(t => `${t.title} (Priority: ${t.priority})`).join(', ')}
        `;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert study planner. Create a detailed, time-blocked study schedule.
                    Allocated breaks (e.g., Pomodoro). Prioritize high-priority pending tasks.
                    Response format: JSON object with:
                    - "summary": string (brief overview)
                    - "plan": array of objects { "time": "start-end", "activity": string, "notes": string }`
                },
                { role: 'user', content: context }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
    }

    async getInsights(userContext: any) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI study coach. Analyze the student's data and provide:
                    1. "recommendation": Specific action item based on recent activity.
                    2. "insight": Pattern observation (e.g., "You focus better in mornings").
                    3. "motivation": Short encouraging message.
                    Response format: JSON.`
                },
                { role: 'user', content: JSON.stringify(userContext) }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
    }

    async chatWithCoach(history: any[], message: string) {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are "Prof. Nova", a witty and encouraging AI study coach. 
                    - Help with study techniques (Active Recall, Spaced Repetition).
                    - Motivate the user.
                    - Keep responses concise (max 3 sentences).`
                },
                ...history,
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        return completion.choices[0].message.content;
    }
}

export const aiService = new AIService();
