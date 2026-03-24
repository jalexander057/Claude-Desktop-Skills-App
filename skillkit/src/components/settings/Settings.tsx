import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FolderOpen,
  Monitor,
  Moon,
  Sun,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

type Theme = 'system' | 'light' | 'dark';

export function Settings() {
  const { claudeStatus } = useAppStore();
  const [outputDir, setOutputDir] = useState('~/Documents/SkillKit');
  const [theme, setTheme] = useState<Theme>('system');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure SkillKit preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Claude Code Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Claude Code Connection</CardTitle>
            <CardDescription>
              SkillKit requires Claude Code to execute skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  {claudeStatus === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {claudeStatus === 'connected'
                        ? 'Connected'
                        : 'Not Connected'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {claudeStatus === 'connected'
                        ? 'Claude Code is available and authenticated'
                        : 'Claude Code CLI not detected'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Path</p>
                  <p className="mt-0.5 font-mono text-xs text-card-foreground">
                    /usr/local/bin/claude
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="mt-0.5 font-mono text-xs text-card-foreground">
                    1.0.12
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Output Directory</CardTitle>
            <CardDescription>
              Default location for skill output files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" className="gap-1.5 shrink-0">
                <FolderOpen className="h-4 w-4" />
                Browse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how SkillKit looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="w-48"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
              <div className="ml-2 text-muted-foreground">
                {theme === 'system' && <Monitor className="h-4 w-4" />}
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">SkillKit v0.1.0</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered skills for PE and finance professionals. Built with
                Tauri, React, and Claude Code.
              </p>
              <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Release Notes
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Report an Issue
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
