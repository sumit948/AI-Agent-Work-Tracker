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

// ─── Demo mock data ───────────────────────────────────────────────────────────
export const DEMO_TASKS: StructuredTask[] = [
  { id: 1,  taskTitle: 'Fixed JWT token expiration bug in auth flow',    category: 'BUG',           hours: 2.5, logDate: new Date(Date.now() - 0   * 86400000).toISOString().split('T')[0] },
  { id: 2,  taskTitle: 'Built REST API endpoints for user dashboard',    category: 'FEATURE',       hours: 3.5, logDate: new Date(Date.now() - 0   * 86400000).toISOString().split('T')[0] },
  { id: 3,  taskTitle: 'Daily standup and sprint planning',              category: 'MEETING',       hours: 1.0, logDate: new Date(Date.now() - 0   * 86400000).toISOString().split('T')[0] },
  { id: 4,  taskTitle: 'Code review for payment service PR #42',         category: 'REVIEW',        hours: 1.5, logDate: new Date(Date.now() - 1   * 86400000).toISOString().split('T')[0] },
  { id: 5,  taskTitle: 'Implemented AI log structuring with OpenAI',     category: 'FEATURE',       hours: 4.0, logDate: new Date(Date.now() - 1   * 86400000).toISOString().split('T')[0] },
  { id: 6,  taskTitle: 'Wrote API documentation for auth endpoints',     category: 'DOCUMENTATION', hours: 1.5, logDate: new Date(Date.now() - 2   * 86400000).toISOString().split('T')[0] },
  { id: 7,  taskTitle: 'Fixed null pointer exception in report service', category: 'BUG',           hours: 1.0, logDate: new Date(Date.now() - 2   * 86400000).toISOString().split('T')[0] },
  { id: 8,  taskTitle: 'Added pagination to work logs API',              category: 'FEATURE',       hours: 2.0, logDate: new Date(Date.now() - 3   * 86400000).toISOString().split('T')[0] },
  { id: 9,  taskTitle: '1:1 meeting with engineering manager',           category: 'MEETING',       hours: 0.5, logDate: new Date(Date.now() - 3   * 86400000).toISOString().split('T')[0] },
  { id: 10, taskTitle: 'Optimised database queries — 40% faster',        category: 'FEATURE',       hours: 3.0, logDate: new Date(Date.now() - 4   * 86400000).toISOString().split('T')[0] },
  { id: 11, taskTitle: 'Reviewed frontend PR for analytics charts',      category: 'REVIEW',        hours: 1.0, logDate: new Date(Date.now() - 4   * 86400000).toISOString().split('T')[0] },
  { id: 12, taskTitle: 'Set up CI/CD pipeline with GitHub Actions',      category: 'OTHER',         hours: 2.0, logDate: new Date(Date.now() - 5   * 86400000).toISOString().split('T')[0] },
];

export const DEMO_ANALYTICS: AnalyticsSummary = {
  totalHours: 23.5,
  totalTasks: 12,
  avgHoursPerDay: 4.7,
  productivityScore: 82,
  categoryBreakdown: [
    { category: 'FEATURE',       taskCount: 4, totalHours: 12.5 },
    { category: 'BUG',           taskCount: 3, totalHours: 4.5  },
    { category: 'REVIEW',        taskCount: 2, totalHours: 2.5  },
    { category: 'MEETING',       taskCount: 2, totalHours: 1.5  },
    { category: 'DOCUMENTATION', taskCount: 1, totalHours: 1.5  },
    { category: 'OTHER',         taskCount: 1, totalHours: 2.0  },
  ],
  dailyTrend: [
    { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], hours: 2.0, taskCount: 2 },
    { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], hours: 3.0, taskCount: 2 },
    { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], hours: 4.0, taskCount: 2 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], hours: 2.5, taskCount: 2 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], hours: 2.5, taskCount: 2 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], hours: 5.5, taskCount: 2 },
    { date: new Date(Date.now() - 0 * 86400000).toISOString().split('T')[0], hours: 4.0, taskCount: 2 },
  ],
};

export const DEMO_DAILY_REPORT: DailyReport = {
  date: new Date().toISOString().split('T')[0],
  totalHours: 7.0,
  taskCount: 3,
  tasks: DEMO_TASKS.slice(0,3),
  summary: `📋 Daily Report — ${new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nToday was a highly productive day focused on bug resolution and feature development.\n\n✅ Completed\n• Fixed a critical JWT token expiration bug affecting user signin flows (2.5h)\n• Delivered REST API endpoints for user dashboard including pagination and filters (3.5h)\n• Participated in daily standup and sprint planning session (1h)\n\n📊 Stats\n• Total Hours: 7.0h   • Tasks: 3   • Focus: Feature + Bug\n\n🚀 Tomorrow\n• Continue API development for analytics module\n• Code review for open PRs\n• Performance testing for new endpoints`,
  categoryBreakdown: { FEATURE: 3.5, BUG: 2.5, MEETING: 1.0 },
};

export const DEMO_WEEKLY_REPORT: WeeklyReport = {
  weekStart: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  weekEnd:   new Date().toISOString().split('T')[0],
  totalHours: 23.5,
  taskCount: 12,
  categoryBreakdown: { FEATURE: 12.5, BUG: 4.5, REVIEW: 2.5, MEETING: 1.5, DOCUMENTATION: 1.5, OTHER: 2.0 },
  dailyBreakdown: DEMO_ANALYTICS.dailyTrend,
  summary: `📅 Weekly Report — ${new Date(Date.now() - 6 * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nStrong week with consistent output across feature development, bug fixes, and team collaboration.\n\n🏆 Key Achievements\n• Delivered AI-powered log structuring using OpenAI GPT integration\n• Resolved 3 production bugs including a critical auth flow issue\n• Optimised database queries resulting in 40% performance improvement\n• Set up automated CI/CD pipeline with GitHub Actions\n\n📊 Weekly Stats\n• Total Hours: 23.5h   • Tasks Completed: 12   • Avg/Day: 4.7h\n• Productivity Score: 82%   • Top Category: Feature Development (53%)\n\n📈 Highlights\n• Most productive day: Yesterday (5.5h, 2 tasks)\n• Maintained good work-life balance with focused deep-work blocks\n• Code review turnaround < 24h on all PRs`,
};

export const DEMO_CHAT_ANSWERS: Record<string, string> = {
  default: 'Based on your work logs this week, you\'ve completed 12 tasks totalling 23.5 hours. Feature development was your primary focus at 53% of your time, followed by bug fixes at 19%. Your most productive day was yesterday with 5.5 hours logged.',
};


