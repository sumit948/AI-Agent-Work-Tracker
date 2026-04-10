'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { TaskCard } from '@/components/task-card';
import { StructuredTask, DEMO_TASKS } from '@/lib/work-tracker-types';
import { logsApi } from '@/lib/api/logs-api';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function WorkEntryPage() {
  const { isDemoMode } = useAuth();
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<StructuredTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!rawText.trim()) {
      setError('Please enter some work details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1200));
      setResults(DEMO_TASKS.slice(0, 3));
      setRawText('');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await logsApi.submitLog(rawText.trim());
      setResults(response.structuredTasks ?? []);
      setRawText('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to process your log. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header
        title="Log Work"
        subtitle="Enter raw notes and let AI structure them for you"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4 sticky top-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  What did you work on?
                </label>
                <Textarea
                  placeholder="E.g., Fixed login bug, worked on API endpoints, attended team meeting..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="min-h-32 resize-none"
                  disabled={isProcessing}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded p-3">
                  {error}
                </div>
              )}

              <Button
                onClick={handleProcess}
                disabled={isProcessing || !rawText.trim()}
                className="w-full gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Structure with AI
                  </>
                )}
              </Button>

              <div className="bg-primary/10 border border-primary/20 rounded p-4 space-y-2">
                <p className="text-xs font-semibold text-primary">AI Processing Steps</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>âœ“ Parses your raw text</li>
                  <li>âœ“ Detects task categories</li>
                  <li>âœ“ Estimates time per task</li>
                  <li>âœ“ Saves structured log</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!results ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Enter your work notes to see AI-structured results here</p>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-secondary/30 p-12 text-center">
                <p className="text-muted-foreground">No tasks could be extracted. Try with more descriptive notes.</p>
                <Button variant="outline" className="mt-4" onClick={() => setResults(null)}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {results.length} Task{results.length !== 1 ? 's' : ''} Extracted
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setResults(null)}>
                    Log More Work
                  </Button>
                </div>

                {results.map((task) => (
                  <div key={task.id} className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-lg border border-border bg-card p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">How AI Processing Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Parse', desc: 'AI analyzes your raw text' },
              { step: 2, title: 'Extract', desc: 'Identifies tasks and details' },
              { step: 3, title: 'Categorize', desc: 'Classifies by type & time' },
              { step: 4, title: 'Save', desc: 'Stores with metadata' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
                  {step}
                </div>
                <p className="font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
