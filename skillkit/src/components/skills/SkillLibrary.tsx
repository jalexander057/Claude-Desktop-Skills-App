import { FileText, Table2, Presentation, Play } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { InstalledSkill } from '../../types/skill';

const skillIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Table2,
  Presentation,
};

export function SkillLibrary() {
  const { skills, selectSkill } = useAppStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Skill Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and run AI-powered skills for financial analysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onRun={() => selectSkill(skill)}
          />
        ))}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  onRun,
}: {
  skill: InstalledSkill;
  onRun: () => void;
}) {
  const { manifest, runCount, lastRun } = skill;
  const { display } = manifest;
  const IconComponent = skillIcons[display.icon];

  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {IconComponent && (
                <IconComponent className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {display.name}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {display.category}
              </Badge>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {display.tagline}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1.5">
          {display.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div className="text-xs text-muted-foreground">
          <span>Used {runCount} times</span>
          {lastRun && (
            <span className="ml-2">
              · Last {formatRelativeTime(lastRun)}
            </span>
          )}
        </div>
        <Button size="sm" onClick={onRun} className="gap-1.5">
          <Play className="h-3.5 w-3.5" />
          Run
        </Button>
      </CardFooter>
    </Card>
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
