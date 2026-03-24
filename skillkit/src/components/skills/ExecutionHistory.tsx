import { Clock, CheckCircle2, XCircle, Loader2, Ban } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { Badge } from '../ui/Badge';
import type { SkillExecution } from '../../types/skill';

export function ExecutionHistory() {
  const { executionHistory } = useAppStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Past skill executions and their results
        </p>
      </div>

      {executionHistory.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-4xl space-y-2">
          {executionHistory.map((execution) => (
            <ExecutionRow key={execution.id} execution={execution} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Clock className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="text-base font-medium text-foreground">No executions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Run a skill to see results here
      </p>
    </div>
  );
}

function ExecutionRow({ execution }: { execution: SkillExecution }) {
  const startDate = new Date(execution.startedAt);

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-card-foreground">
              {execution.skillName}
            </h3>
            <StatusBadge status={execution.status} />
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDate(startDate)}</span>
            <span>{formatTime(startDate)}</span>
            {execution.durationMs !== undefined && (
              <span>{formatDuration(execution.durationMs)}</span>
            )}
          </div>

          {/* Output preview */}
          {execution.output && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {execution.output
                .replace(/[#|*`\-]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 200)}
            </p>
          )}

          {/* Error preview */}
          {execution.error && (
            <p className="mt-2 text-xs text-destructive">
              {execution.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SkillExecution['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case 'running':
      return (
        <Badge variant="warning" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Running
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="secondary" className="gap-1">
          <Ban className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
