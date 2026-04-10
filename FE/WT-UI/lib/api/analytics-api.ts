import { apiClient } from '@/lib/api-client';
import type { AnalyticsSummary } from '@/lib/work-tracker-types';

export const analyticsApi = {
  getSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<AnalyticsSummary>(`/analytics${query}`);
  },
};
