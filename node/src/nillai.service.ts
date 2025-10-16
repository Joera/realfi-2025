import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';

export class NilAIService {

    client: any;

    constructor() {

        this.client = new NilaiOpenAIClient({
            baseURL: 'https://nilai-a779.nillion.network/v1/',
            apiKey: process.env.NILLION_API_KEY,
            nilauthInstance: NilAuthInstance.SANDBOX,
        });

    }

    async ask(message: string) {

        const response = await this.client.chat.completions.create({
            model: 'google/gemma-3-27b-it',
            messages: [{ role: 'user', content: message }],
        });
        
    }


}