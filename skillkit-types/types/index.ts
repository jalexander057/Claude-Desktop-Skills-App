// ---------------------------------------------------------------------------
// index.ts -- Barrel re-export for all SkillKit type definitions
// ---------------------------------------------------------------------------

export type {
  // Categories & Display
  SkillCategory,
  SkillDisplay,
  // Input fields
  InputFieldBase,
  FileInputField,
  FileArrayInputField,
  StringInputField,
  EnumInputField,
  ArrayInputField,
  NumberInputField,
  BooleanInputField,
  SkillInputField,
  SkillInputSchema,
  SkillInputs,
  // Outputs
  TableOutput,
  MarkdownOutput,
  FileOutput,
  SkillOutput,
  SkillOutputs,
  // Permissions, pricing, requirements
  SkillPermissions,
  SkillPricing,
  SkillRequirements,
  // Manifest
  SkillManifest,
} from './skill';

export type {
  ExecutionStatus,
  OutputFile,
  ExecutionOutput,
  ExecutionError,
  TokenUsage,
  SkillExecution,
} from './execution';

export type {
  InstalledSkill,
  AppConfig,
  LicenseState,
  ClaudeCodeConnectionStatus,
  AppState,
} from './app';

export type {
  ClaudeCodeStatus,
  SkillUpdate,
  TauriCommands,
  TauriEvents,
  TauriCommandName,
  TauriEventName,
  TauriEventPayload,
} from './ipc';
