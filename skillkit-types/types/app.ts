// ---------------------------------------------------------------------------
// app.ts -- Type definitions for application state, configuration, and licensing
// ---------------------------------------------------------------------------

import type { SkillManifest } from './skill';
import type { SkillExecution } from './execution';

// ---- Installed Skill -------------------------------------------------------

/**
 * Represents a skill that has been installed on the user's machine.
 * Combines the immutable manifest with mutable install-specific metadata.
 */
export interface InstalledSkill {
  /**
   * Unique, URL-safe identifier for the skill.
   * Matches the directory name in the skills library.
   * Example: `"pdf-financial-extractor"`, `"dcf-model-builder"`.
   */
  id: string;

  /** The parsed `skillkit.json` manifest shipped with the skill package. */
  manifest: SkillManifest;

  /**
   * The semver version string of the currently installed skill package.
   * Example: `"1.2.0"`
   */
  installedVersion: string;

  /**
   * If the registry reports a newer version, it is stored here so the GUI
   * can show an "Update available" badge.  `undefined` when up to date.
   */
  availableVersion?: string;

  /**
   * Absolute path to the skill package directory on disk.
   * Example: `"/Users/jake/Library/Application Support/SkillKit/skills/pdf-financial-extractor"`
   */
  installPath: string;

  /**
   * ISO 8601 timestamp of the most recent execution of this skill.
   * `undefined` if the skill has never been run.
   */
  lastRun?: string;

  /** Total number of times the skill has been executed by this user. */
  runCount: number;
}

// ---- App Configuration -----------------------------------------------------

/** Persisted user preferences. Stored in the app's config directory. */
export interface AppConfig {
  /**
   * Absolute path to the `claude` CLI binary.
   * Auto-detected on first launch; can be overridden in Settings.
   * Example: `"/usr/local/bin/claude"`
   */
  claudeCodePath: string;

  /**
   * Default directory where skill output files are saved.
   * Example: `"~/Documents/SkillKit Output"`
   */
  outputDirectory: string;

  /** UI colour scheme preference. `"system"` follows the OS setting. */
  theme: 'light' | 'dark' | 'system';

  /**
   * Whether the user has opted in to anonymous usage telemetry.
   * Defaults to `false`; prompted on first launch.
   */
  telemetryOptIn: boolean;
}

// ---- License ---------------------------------------------------------------

/**
 * Current state of the user's SkillKit license.
 * Fetched from the licensing server and cached locally.
 */
export interface LicenseState {
  /** The subscription tier this license grants access to. */
  tier: 'starter' | 'pro' | 'team' | 'enterprise';

  /**
   * ISO 8601 date (not datetime) when the license expires.
   * Example: `"2027-03-23"`
   */
  validUntil: string;

  /**
   * Number of seats currently occupied (team/enterprise plans only).
   * `undefined` for individual plans.
   */
  seatsUsed?: number;

  /**
   * Total seats included in the plan (team/enterprise plans only).
   * `undefined` for individual plans.
   */
  seatsTotal?: number;

  /**
   * Feature flags unlocked by this license.
   * Example: `["advanced-skills", "priority-support", "custom-skills"]`
   */
  features: string[];
}

// ---- Claude Code connection status -----------------------------------------

/**
 * High-level status of the Claude Code CLI integration.
 * Shown as a status indicator in the app's title bar.
 */
export type ClaudeCodeConnectionStatus =
  | 'connected'
  | 'not-installed'
  | 'not-authenticated'
  | 'error';

// ---- App State (Zustand store) ---------------------------------------------

/**
 * Top-level application state managed by a Zustand store in the React frontend.
 *
 * Slices of this state are consumed by various views:
 *   - Skill Library  -> `skills`
 *   - Skill Runner   -> `currentSkill`, `currentExecution`
 *   - History        -> `executionHistory`
 *   - Settings       -> `config`, `license`, `claudeCodeStatus`
 */
export interface AppState {
  /** All skills currently installed on this machine. */
  skills: InstalledSkill[];

  /** The skill the user has selected / opened (null when on the library view). */
  currentSkill: InstalledSkill | null;

  /** The in-progress or most-recently-completed execution (null if idle). */
  currentExecution: SkillExecution | null;

  /**
   * Recent execution history, ordered newest-first.
   * Loaded lazily from the local database; typically capped to the last 100.
   */
  executionHistory: SkillExecution[];

  /** Persisted user configuration. */
  config: AppConfig;

  /** Current license / subscription information. */
  license: LicenseState;

  /** Whether the Claude Code CLI is reachable and authenticated. */
  claudeCodeStatus: ClaudeCodeConnectionStatus;

  /**
   * `true` when a newer version of the SkillKit app itself (not individual
   * skills) is available for download.
   */
  updateAvailable: boolean;
}
