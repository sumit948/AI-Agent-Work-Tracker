import { apiClient } from '@/lib/api-client';
import type { DailyReport, WeeklyReport } from '@/lib/work-tracker-types';

export const reportsApi = {
  getDaily: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiClient.get<DailyReport>(`/reports/daily${query}`);
  },

  getWeekly: (weekStart?: string) => {
    const query = weekStart ? `?weekStart=${weekStart}` : '';
    return apiClient.get<WeeklyReport>(`/reports/weekly${query}`);
  },
};
