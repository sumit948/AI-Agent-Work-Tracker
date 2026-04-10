import { apiClient } from '@/lib/api-client';
import type { RawLogResponse } from '@/lib/work-tracker-types';

export const logsApi = {
  submitLog: (rawText: string) =>
    apiClient.post<RawLogResponse>('/logs', { rawText }),

  getLogs: () =>
    apiClient.get<RawLogResponse[]>('/logs'),

  getLogById: (id: number) =>
    apiClient.get<RawLogResponse>(`/logs/${id}`),

  reprocessLog: (rawLogId: number) =>
    apiClient.post<RawLogResponse>('/ai/process-log', { rawLogId }),
};
