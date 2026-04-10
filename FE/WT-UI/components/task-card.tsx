'use client';

import { StructuredTask, categoryColors, categoryLabel } from '@/lib/work-tracker-types';
import { Clock } from 'lucide-react';

export function TaskCard({ task }: { task: StructuredTask }) {
  const colors = categoryColors[task.category];

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${colors.text}`}>
              {categoryLabel[task.category]}
            </span>
            {task.logDate && (
              <span className="text-xs text-muted-foreground">
                {new Date(task.logDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2">{task.taskTitle}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground whitespace-nowrap">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {task.hours}h
        </div>
      </div>
    </div>
  );
}
