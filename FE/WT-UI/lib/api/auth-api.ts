import { apiClient } from '@/lib/api-client';
import type { AuthResponse } from '@/lib/work-tracker-types';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),
};
