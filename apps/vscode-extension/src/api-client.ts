import axios from 'axios';

export class ApiClient {
    constructor(private readonly baseUrl: string) {}

    async submitIntent(query: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/intent`, {
                query,
                type: 'command',
            });
            return response.data;
        } catch (error) {
            console.error('Failed to submit intent:', error);
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}
