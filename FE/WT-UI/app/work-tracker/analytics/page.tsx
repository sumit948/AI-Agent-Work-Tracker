'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { analyticsApi } from '@/lib/api/analytics-api';
import { AnalyticsSummary, categoryColors, categoryLabel, DEMO_ANALYTICS } from '@/lib/work-tracker-types';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, Target, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

const CHART_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
  const { isDemoMode } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = (start: string, end: string) => {
    if (isDemoMode) {
      setAnalytics(DEMO_ANALYTICS);
      setLoading(false);
      return;
    }
    setLoading(true);
    analyticsApi.getSummary(start, end)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(startDate, endDate); }, [isDemoMode]);


  const categoryData = (analytics?.categoryBreakdown ?? []).map((c, i) => ({
    name: categoryLabel[c.category] ?? c.category,
    value: c.taskCount,
    hours: c.totalHours,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const trendData = (analytics?.dailyTrend ?? []).map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    hours: d.hours,
    tasks: d.taskCount,
  }));

  return (
    <>
      <Header title="Analytics" subtitle="Deep dive into your productivity metrics" />

      <div className="p-8 space-y-8">
        {/* Date Range Filter */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="startDate">From</Label>
            <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">To</Label>
            <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
          </div>
          <Button onClick={() => load(startDate, endDate)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !analytics ? (
          <div className="text-center text-muted-foreground py-12">No data found for the selected range.</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Hours', value: analytics.totalHours.toFixed(1), icon: Calendar },
                { label: 'Avg per Day', value: `${analytics.avgHoursPerDay.toFixed(1)}h`, icon: Target },
                { label: 'Total Tasks', value: analytics.totalTasks, icon: Zap },
                { label: 'Productivity', value: `${Math.round(analytics.productivityScore)}%`, icon: TrendingUp },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={idx} className="rounded-lg border border-border bg-card p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
                        <p className="text-3xl font-bold text-foreground mt-2">{metric.value}</p>
                      </div>
                      <Icon className="w-6 h-6 text-primary opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Hours Trend */}
              {trendData.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Daily Hours Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="hours" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category Distribution (Pie) */}
              {categoryData.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Tasks by Category</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`} dataKey="value">
                        {categoryData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Hours by Category (Horizontal Bar) */}
              {categoryData.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Hours by Category</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={90} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="hours" fill="#10b981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Daily Tasks Line Chart */}
              {trendData.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Daily Task Count</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                      <Line type="monotone" dataKey="tasks" stroke="#7c3aed" strokeWidth={2}
                        dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Breakdown Table */}
            {categoryData.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {analytics.categoryBreakdown.map((c) => {
                    const colors = categoryColors[c.category];
                    return (
                      <div key={c.category} className={`rounded-lg p-4 ${colors.bg} border ${colors.border}`}>
                        <p className={`text-xs font-semibold ${colors.text}`}>{categoryLabel[c.category]}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{c.taskCount}</p>
                        <p className="text-xs text-muted-foreground">{c.totalHours.toFixed(1)}h</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
