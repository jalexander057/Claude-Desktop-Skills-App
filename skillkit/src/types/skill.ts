export interface SkillManifest {
  version: string;
  display: {
    name: string;
    tagline: string;
    icon: string;
    category: string;
    tags: string[];
  };
  inputs: {
    schema: InputSchema;
  };
  outputs: {
    primary: OutputDef;
    secondary?: OutputDef;
  };
  permissions: {
    fileRead: string[];
    fileWrite: string[];
    network: string[];
    tools: string[];
    maxTokenBudget: number;
  };
}

export interface InputSchema {
  type: 'object';
  properties: Record<string, InputField>;
  required?: string[];
}

export type InputField = {
  title: string;
  description?: string;
  default?: unknown;
  required?: boolean;
  ui?: string;
} & (
  | { type: 'file'; accept: string[] }
  | { type: 'array'; items: { type: string; accept?: string[] }; minItems?: number; maxItems?: number }
  | { type: 'string'; enum?: string[]; placeholder?: string }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'boolean' }
);

export type OutputDef =
  | { type: 'table'; exportFormats: string[] }
  | { type: 'markdown'; label: string }
  | { type: 'file'; format: string; label: string; saveTo: string };

export interface InstalledSkill {
  id: string;
  manifest: SkillManifest;
  version: string;
  lastRun?: string;
  runCount: number;
}

export interface SkillExecution {
  id: string;
  skillId: string;
  skillName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputs: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  durationMs?: number;
}
