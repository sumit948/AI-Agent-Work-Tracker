'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportsApi } from '@/lib/api/reports-api';
import { DailyReport, WeeklyReport, categoryColors, categoryLabel, DEMO_DAILY_REPORT, DEMO_WEEKLY_REPORT } from '@/lib/work-tracker-types';
import { Download, Mail, Copy, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type ReportTab = 'daily' | 'weekly';

export default function ReportsPage() {
  const { isDemoMode } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const monday = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  })();

  const [tab, setTab] = useState<ReportTab>('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedWeek, setSelectedWeek] = useState(monday);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDaily = (date: string) => {
    if (isDemoMode) { setDailyReport(DEMO_DAILY_REPORT); return; }
    setLoading(true);
    reportsApi.getDaily(date)
      .then(setDailyReport)
      .catch(() => setDailyReport(null))
      .finally(() => setLoading(false));
  };

  const loadWeekly = (weekStart: string) => {
    if (isDemoMode) { setWeeklyReport(DEMO_WEEKLY_REPORT); return; }
    setLoading(true);
    reportsApi.getWeekly(weekStart)
      .then(setWeeklyReport)
      .catch(() => setWeeklyReport(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDaily(selectedDate); }, [isDemoMode]);

  const handleTabChange = (newTab: ReportTab) => {
    setTab(newTab);
    if (newTab === 'daily' && !dailyReport) loadDaily(selectedDate);
    if (newTab === 'weekly' && !weeklyReport) loadWeekly(selectedWeek);
  };


  const reportText = tab === 'daily' && dailyReport
    ? `Daily Report — ${dailyReport.date}\n\n${dailyReport.summary}\n\nTotal Hours: ${dailyReport.totalHours}h\nTasks: ${dailyReport.taskCount}`
    : tab === 'weekly' && weeklyReport
    ? `Weekly Report — ${weeklyReport.weekStart} to ${weeklyReport.weekEnd}\n\n${weeklyReport.summary}\n\nTotal Hours: ${weeklyReport.totalHours}h\nTasks: ${weeklyReport.taskCount}`
    : '';

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportText) return;
    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${tab}-report-${tab === 'daily' ? selectedDate : selectedWeek}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEmail = () => {
    if (!reportText) return;
    const subject = `${tab.charAt(0).toUpperCase() + tab.slice(1)} Work Report`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportText)}`;
  };

  const categoryBreakdown = tab === 'daily'
    ? dailyReport?.categoryBreakdown
    : weeklyReport?.categoryBreakdown;

  const totalHours = tab === 'daily' ? dailyReport?.totalHours : weeklyReport?.totalHours;
  const taskCount = tab === 'daily' ? dailyReport?.taskCount : weeklyReport?.taskCount;

  return (
    <>
      <Header title="Reports" subtitle="Auto-generated status reports from your work logs" />

      <div className="p-8 space-y-8">
        {/* Report Type Tabs */}
        <div className="flex gap-4 flex-wrap">
          {(['daily', 'weekly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTabChange(type)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tab === type
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card text-foreground border border-border hover:bg-secondary'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Report
            </button>
          ))}
        </div>

        {/* Date Picker */}
        <div className="flex items-end gap-4">
          {tab === 'daily' ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="reportDate">Date</Label>
                <Input id="reportDate" type="date" value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)} className="w-44" />
              </div>
              <Button onClick={() => loadDaily(selectedDate)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="weekStart">Week Starting</Label>
                <Input id="weekStart" type="date" value={selectedWeek}
                  onChange={e => setSelectedWeek(e.target.value)} className="w-44" />
              </div>
              <Button onClick={() => loadWeekly(selectedWeek)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
              </Button>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Content */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-border bg-card p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {tab === 'daily' ? 'Daily Standup' : 'Weekly Report'}
                  </h2>
                </div>

                {reportText ? (
                  <>
                    <div className="bg-secondary/30 rounded-lg p-6">
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
                        {reportText}
                      </pre>
                    </div>

                    {/* Task List for Daily */}
                    {tab === 'daily' && dailyReport?.tasks && dailyReport.tasks.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Tasks</h3>
                        <div className="space-y-2">
                          {dailyReport.tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                              <div>
                                <span className={`text-xs font-semibold mr-2 ${categoryColors[task.category]?.text}`}>
                                  {categoryLabel[task.category]}
                                </span>
                                <span className="text-sm text-foreground">{task.taskTitle}</span>
                              </div>
                              <span className="text-sm font-medium text-foreground whitespace-nowrap ml-4">{task.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Breakdown */}
                    {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Category Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(categoryBreakdown).map(([cat, hours]) => {
                            const colors = categoryColors[cat as keyof typeof categoryColors];
                            const label = categoryLabel[cat as keyof typeof categoryLabel] ?? cat;
                            return (
                              <div key={cat} className={`rounded-lg p-4 ${colors?.bg ?? 'bg-gray-50'} border ${colors?.border ?? 'border-gray-200'}`}>
                                <p className={`text-xs font-semibold ${colors?.text ?? 'text-gray-700'}`}>{label}</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{(hours as number).toFixed(1)}h</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    No report data found for the selected period.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4 sticky top-8">
                <h3 className="font-semibold text-foreground">Actions</h3>

                <Button onClick={handleCopy} variant="outline" className="w-full justify-start gap-2" disabled={!reportText}>
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>

                <Button onClick={handleDownload} variant="outline" className="w-full justify-start gap-2" disabled={!reportText}>
                  <Download className="h-4 w-4" />
                  Download as Text
                </Button>

                <Button onClick={handleEmail} variant="outline" className="w-full justify-start gap-2" disabled={!reportText}>
                  <Mail className="h-4 w-4" />
                  Send via Email
                </Button>

                <div className="h-px bg-border" />

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-foreground">{totalHours?.toFixed(1) ?? '—'}h</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Tasks Logged</p>
                    <p className="text-2xl font-bold text-foreground">{taskCount ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-primary/10 p-6 space-y-3">
                <p className="text-xs font-semibold text-primary">Pro Tips</p>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>✓ Share reports weekly with your manager</li>
                  <li>✓ Use email to deliver directly from here</li>
                  <li>✓ Track trends over multiple weeks</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
