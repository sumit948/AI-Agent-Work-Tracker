// ─── Enums matching backend ─────────────────────────────────────────────────
export type Category = 'BUG' | 'FEATURE' | 'MEETING' | 'REVIEW' | 'DOCUMENTATION' | 'OTHER';
export type AiStatus = 'PENDING' | 'PROCESSED' | 'FAILED';
export type ReportType = 'DAILY' | 'WEEKLY';

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  expiresIn: number;
}

// ─── Work Logs ───────────────────────────────────────────────────────────────
export interface StructuredTask {
  id: number;
  taskTitle: string;
  category: Category;
  hours: number;
  logDate: string; // ISO date string yyyy-MM-dd
}

export interface RawLogResponse {
  rawLogId: number;
  rawText: string;
  aiStatus: AiStatus;
  createdAt: string;
  structuredTasks: StructuredTask[];
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface CategoryBreakdown {
  category: Category;
  taskCount: number;
  totalHours: number;
}

export interface DailyTrend {
  date: string;
  hours: number;
  taskCount: number;
}

export interface AnalyticsSummary {
  totalHours: number;
  totalTasks: number;
  avgHoursPerDay: number;
  productivityScore: number;
  categoryBreakdown: CategoryBreakdown[];
  dailyTrend: DailyTrend[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface DailyReport {
  date: string;
  totalHours: number;
  taskCount: number;
  tasks: StructuredTask[];
  summary: string;
  categoryBreakdown: Record<string, number>;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  taskCount: number;
  categoryBreakdown: Record<string, number>;
  dailyBreakdown: DailyTrend[];
  summary: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
export const categoryColors: Record<Category, { bg: string; text: string; border: string }> = {
  BUG:           { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  FEATURE:       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  MEETING:       { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  REVIEW:        { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  DOCUMENTATION: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  OTHER:         { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200'   },
};

export const categoryLabel: Record<Category, string> = {
  BUG: 'Bug', FEATURE: 'Feature', MEETING: 'Meeting',
  REVIEW: 'Review', DOCUMENTATION: 'Docs', OTHER: 'Other',
};

