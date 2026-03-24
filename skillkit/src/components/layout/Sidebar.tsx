import {
  FileText,
  Table2,
  Presentation,
  Clock,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../stores/app-store';
import type { AppView } from '../../stores/app-store';

const skillIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Table2,
  Presentation,
};

export function Sidebar() {
  const { skills, currentView, selectedSkill, claudeStatus, selectSkill, setView } =
    useAppStore();

  return (
    <aside className="flex h-screen w-60 flex-col bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-slate-700/50 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          SkillKit
        </span>
      </div>

      {/* Skills Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Skills
        </p>
        <nav className="space-y-0.5">
          {skills.map((skill) => {
            const IconComponent = skillIcons[skill.manifest.display.icon];
            const isActive =
              currentView === 'runner' && selectedSkill?.id === skill.id;

            return (
              <button
                key={skill.id}
                onClick={() => selectSkill(skill)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-slate-700/70 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
                <span className="truncate">{skill.manifest.display.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-slate-700/50" />

        {/* Navigation */}
        <nav className="space-y-0.5">
          <NavItem
            icon={<Clock className="h-4 w-4" />}
            label="History"
            view="history"
            active={currentView === 'history'}
            onClick={() => setView('history')}
          />
          <NavItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            view="settings"
            active={currentView === 'settings'}
            onClick={() => setView('settings')}
          />
        </nav>
      </div>

      {/* Status Indicator */}
      <div className="border-t border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              claudeStatus === 'connected' && 'bg-emerald-400',
              claudeStatus === 'disconnected' && 'bg-red-400',
              claudeStatus === 'checking' && 'bg-amber-400 animate-pulse'
            )}
          />
          <span className="text-slate-500">
            Claude Code{' '}
            {claudeStatus === 'connected'
              ? 'connected'
              : claudeStatus === 'disconnected'
                ? 'not found'
                : 'checking...'}
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  view: AppView;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        active
          ? 'bg-slate-700/70 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
