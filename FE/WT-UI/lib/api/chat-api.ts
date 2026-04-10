import { apiClient } from '@/lib/api-client';

export interface ChatApiResponse {
  question: string;
  answer: string;
  timestamp: string;
}

export const chatApi = {
  ask: (question: string) =>
    apiClient.post<ChatApiResponse>('/chat', { question }),
};
