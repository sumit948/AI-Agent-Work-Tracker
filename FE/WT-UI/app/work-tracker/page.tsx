'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { TaskCard } from '@/components/task-card';
import { analyticsApi } from '@/lib/api/analytics-api';
import { logsApi } from '@/lib/api/logs-api';
import { AnalyticsSummary, StructuredTask, DEMO_ANALYTICS, DEMO_TASKS } from '@/lib/work-tracker-types';
import { BarChart3, Clock, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, isDemoMode } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentTasks, setRecentTasks] = useState<StructuredTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setAnalytics(DEMO_ANALYTICS);
      setRecentTasks(DEMO_TASKS);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    Promise.all([
      analyticsApi.getSummary(sevenDaysAgo, today),
      logsApi.getLogs(),
    ])
      .then(([summary, logs]) => {
        setAnalytics(summary);
        const tasks = logs.flatMap(l => l.structuredTasks ?? []);
        setRecentTasks(tasks.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isDemoMode]);

  const chartData = (analytics?.dailyTrend ?? []).map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    hours: d.hours,
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = recentTasks.filter(t => t.logDate === todayStr);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Welcome back${user?.name ? ', ' + user.name : ''}! Here's your productivity overview`}
      />

      <div className="p-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Hours"
                value={(analytics?.totalHours ?? 0).toFixed(1)}
                icon={<Clock className="h-6 w-6" />}
                color="primary"
              />
              <StatCard
                label="Tasks Logged"
                value={analytics?.totalTasks ?? 0}
                icon={<Zap className="h-6 w-6" />}
                color="success"
              />
              <StatCard
                label="Daily Average"
                value={`${(analytics?.avgHoursPerDay ?? 0).toFixed(1)}h`}
                icon={<BarChart3 className="h-6 w-6" />}
                color="primary"
              />
              <StatCard
                label="Productivity Score"
                value={`${Math.round(analytics?.productivityScore ?? 0)}%`}
                icon={<TrendingUp className="h-6 w-6" />}
                color="success"
              />
            </div>

            {/* Weekly Chart */}
            {chartData.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Weekly Hours</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="hours" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Today's Tasks */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Today's Work</h2>
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => <TaskCard key={task.id} task={task} />)
                ) : (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground">No tasks logged today. Start by logging your work!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            {recentTasks.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Tasks</h2>
                <div className="space-y-3">
                  {recentTasks.slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
