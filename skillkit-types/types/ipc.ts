// ---------------------------------------------------------------------------
// ipc.ts -- Type definitions for Tauri v2 IPC (frontend <-> Rust backend)
// ---------------------------------------------------------------------------

import type { SkillManifest } from './skill';
import type { SkillExecution, ExecutionOutput, ExecutionError } from './execution';
import type { InstalledSkill, AppConfig, LicenseState } from './app';

// ---- Claude Code Status ----------------------------------------------------

/**
 * Detailed status of the Claude Code CLI binary on this machine.
 * Returned by the `check_claude_code` command.
 */
export interface ClaudeCodeStatus {
  /** Whether the `claude` binary was found on PATH or at the configured path. */
  installed: boolean;

  /**
   * Semver version string reported by `claude --version`.
   * `undefined` when the binary is not installed.
   */
  version?: string;

  /**
   * Whether the CLI has a valid authentication token.
   * `false` if the user needs to run `claude login`.
   */
  authenticated: boolean;

  /**
   * Absolute path to the located `claude` binary.
   * `undefined` when the binary is not installed.
   */
  path?: string;
}

// ---- Skill Updates ---------------------------------------------------------

/**
 * Describes an available update for a single installed skill.
 * Returned as an array by the `check_for_updates` command.
 */
export interface SkillUpdate {
  /** Identifier of the skill with an available update. */
  skillId: string;

  /** Currently installed version. */
  currentVersion: string;

  /** Version available in the registry. */
  newVersion: string;

  /**
   * Human-readable changelog / release notes for the new version.
   * Rendered as Markdown in the update dialog.
   */
  changelog: string;
}

// ---- Tauri Commands --------------------------------------------------------

/**
 * Type-safe mapping of every Tauri `invoke` command exposed by the Rust backend.
 *
 * Usage in the frontend:
 * ```ts
 * import { invoke } from '@tauri-apps/api/core';
 * const skills = await invoke<InstalledSkill[]>('get_installed_skills');
 * ```
 *
 * Each key is the snake_case command name registered with `#[tauri::command]`
 * in the Rust backend.  The value is a function signature describing the
 * expected arguments and return type.
 */
export interface TauriCommands {
  // -- Skill management ------------------------------------------------------

  /** List all skills currently installed on this machine. */
  get_installed_skills: () => Promise<InstalledSkill[]>;

  /** Read and parse the manifest for a specific installed skill. */
  get_skill_manifest: (skillId: string) => Promise<SkillManifest>;

  /**
   * Query the skill registry for available updates.
   * Returns an empty array when everything is up to date.
   */
  check_for_updates: () => Promise<SkillUpdate[]>;

  /**
   * Download and apply an update for the given skill.
   * Resolves when the update is fully installed.
   */
  apply_skill_update: (skillId: string) => Promise<void>;

  // -- Skill execution -------------------------------------------------------

  /**
   * Start executing a skill with the given input values.
   * Returns a UUID execution ID that can be used to track progress.
   *
   * @param skillId - Identifier of the skill to run.
   * @param inputs  - Key-value map of form inputs matching the skill's schema.
   *                  File fields should contain absolute paths as strings.
   */
  run_skill: (skillId: string, inputs: Record<string, unknown>) => Promise<string>;

  /**
   * Request cancellation of a running execution.
   * The backend will send a SIGTERM to the Claude Code subprocess.
   */
  cancel_execution: (executionId: string) => Promise<void>;

  /** Retrieve the current state of an execution by its ID. */
  get_execution_status: (executionId: string) => Promise<SkillExecution>;

  /**
   * Fetch recent execution history from the local database.
   *
   * @param limit - Maximum number of records to return (newest first).
   */
  get_execution_history: (limit: number) => Promise<SkillExecution[]>;

  // -- Claude Code integration -----------------------------------------------

  /**
   * Probe the system for the Claude Code CLI and return its status.
   * Called on app launch and whenever the user changes the CLI path.
   */
  check_claude_code: () => Promise<ClaudeCodeStatus>;

  // -- File operations -------------------------------------------------------

  /**
   * Open a native file-picker dialog filtered to the given extensions.
   * Returns an array of absolute paths the user selected (empty if cancelled).
   *
   * @param accept - File extensions to filter by (e.g. `[".pdf", ".xlsx"]`).
   */
  pick_files: (accept: string[]) => Promise<string[]>;

  /**
   * Open the user's configured output folder in the system file manager
   * (Finder on macOS, Explorer on Windows).
   */
  open_output_folder: () => Promise<void>;

  // -- Configuration ---------------------------------------------------------

  /** Read the persisted app configuration. */
  get_config: () => Promise<AppConfig>;

  /**
   * Merge partial updates into the persisted app configuration.
   * Only the provided keys are overwritten; omitted keys retain their values.
   */
  update_config: (config: Partial<AppConfig>) => Promise<void>;

  // -- License ---------------------------------------------------------------

  /** Fetch the current license state (from cache, then server). */
  get_license_status: () => Promise<LicenseState>;

  /**
   * Validate and activate a license key.
   * On success the new license state is returned and persisted.
   *
   * @param key - The license key string entered by the user.
   */
  validate_license: (key: string) => Promise<LicenseState>;
}

// ---- Tauri Events ----------------------------------------------------------

/**
 * Events emitted by the Rust backend and listened to by the frontend.
 *
 * Usage in the frontend:
 * ```ts
 * import { listen } from '@tauri-apps/api/event';
 * const unlisten = await listen<TauriEvents['execution-progress']>(
 *   'execution-progress',
 *   (event) => { console.log(event.payload.progress); }
 * );
 * ```
 *
 * Each key is the kebab-case event name.  The value is the payload shape.
 */
export interface TauriEvents {
  /**
   * Emitted periodically while a skill is running to report progress.
   * The frontend uses this to update the progress bar and status message.
   */
  'execution-progress': {
    executionId: string;

    /**
     * Progress percentage (0-100).
     * May be approximate; some skills cannot report fine-grained progress.
     */
    progress: number;

    /** Human-readable status message (e.g. "Parsing PDF...", "Generating table..."). */
    message: string;
  };

  /**
   * Emitted when a chunk of output is produced during streaming execution.
   * Used for real-time preview in the output panel.
   */
  'execution-output': {
    executionId: string;

    /**
     * A chunk of the output content (Markdown text, partial table JSON, etc.).
     * Chunks are concatenated in order to build the full output.
     */
    chunk: string;
  };

  /**
   * Emitted when a skill execution completes successfully.
   * The frontend transitions the execution to the `completed` state.
   */
  'execution-complete': {
    executionId: string;

    /** The final execution output artifacts. */
    result: ExecutionOutput;
  };

  /**
   * Emitted when a skill execution fails.
   * The frontend transitions the execution to the `failed` state.
   */
  'execution-error': {
    executionId: string;

    /** Structured error details. */
    error: ExecutionError;
  };

  /**
   * Emitted when the backend detects a new version of an installed skill.
   * The frontend can show an update badge on the affected skill card.
   */
  'skill-update-available': {
    skillId: string;

    /** The version available in the registry. */
    newVersion: string;
  };

  /**
   * Emitted when the Claude Code CLI status changes (e.g. it becomes
   * unreachable or the user authenticates).
   */
  'claude-code-status-changed': {
    /** Updated status of the Claude Code CLI. */
    status: ClaudeCodeStatus;
  };
}

// ---- Helper types for invoke / listen wrappers -----------------------------

/**
 * Extracts the command names as a union type.
 * Useful for building a generic `invoke` wrapper.
 */
export type TauriCommandName = keyof TauriCommands;

/**
 * Extracts the event names as a union type.
 * Useful for building a generic `listen` wrapper.
 */
export type TauriEventName = keyof TauriEvents;

/**
 * Extracts the payload type for a given event name.
 *
 * ```ts
 * type ProgressPayload = TauriEventPayload<'execution-progress'>;
 * // { executionId: string; progress: number; message: string }
 * ```
 */
export type TauriEventPayload<E extends TauriEventName> = TauriEvents[E];
