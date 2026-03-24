// ---------------------------------------------------------------------------
// skill.ts -- Type definitions for the SkillKit skill manifest (skillkit.json)
// ---------------------------------------------------------------------------

// ---- Category & Tags -------------------------------------------------------

/**
 * The top-level domain a skill belongs to.
 * Determines which section of the skill library it appears in.
 */
export type SkillCategory =
  | 'Finance'
  | 'Legal'
  | 'Consulting'
  | 'Operations'
  | 'General';

// ---- Display ---------------------------------------------------------------

/** How the skill is presented in the SkillKit GUI. */
export interface SkillDisplay {
  /** Human-readable skill name shown in the library and toolbar. */
  name: string;

  /** One-line marketing description (shown below the name in cards). */
  tagline: string;

  /**
   * Icon identifier.
   * Can be a bundled icon name (e.g. "chart-bar") or a relative path to an
   * SVG/PNG inside the skill package (e.g. "assets/icon.svg").
   */
  icon: string;

  /**
   * Relative paths to screenshot images displayed in the skill detail view.
   * At least one screenshot is recommended.
   */
  screenshots: string[];

  /** Primary category for library filtering. */
  category: SkillCategory;

  /** Free-form tags used for search and secondary filtering. */
  tags: string[];
}

// ---- Input Fields ----------------------------------------------------------

/**
 * Common properties shared by every input field type.
 * Provides metadata the GUI uses for labels, help text, and validation.
 */
export interface InputFieldBase {
  /** Label rendered above the input control. */
  title: string;

  /** Help text or tooltip shown alongside the control. */
  description?: string;

  /**
   * Whether the user must supply a value before running the skill.
   * When `true` the Run button stays disabled until this field is filled.
   */
  required?: boolean;
}

/** Lets the user pick a single file from disk. */
export interface FileInputField extends InputFieldBase {
  type: 'file';

  /**
   * Accepted file extensions (including the dot), e.g. `[".pdf", ".xlsx"]`.
   * Passed to the native file-picker filter.
   */
  accept: string[];

  /** Which GUI widget to render. */
  ui: 'file-picker' | 'file-drop-zone';

  /** Optional default file path (rarely used). */
  default?: string;
}

/** Lets the user pick multiple files. */
export interface FileArrayInputField extends InputFieldBase {
  type: 'array';

  /** Item definition -- every item is a file path. */
  items: {
    type: 'file';

    /**
     * Accepted file extensions (including the dot), e.g. `[".csv", ".xlsx"]`.
     */
    accept: string[];
  };

  /** Minimum number of files the user must supply. */
  minItems?: number;

  /** Maximum number of files the user may supply. */
  maxItems?: number;

  /** Optional default list of file paths. */
  default?: string[];
}

/** A free-form text input (single-line or multi-line). */
export interface StringInputField extends InputFieldBase {
  type: 'string';

  /** Placeholder text shown when the field is empty. */
  placeholder?: string;

  /** Which GUI widget to render. */
  ui: 'text' | 'textarea';

  /** Optional default value. */
  default?: string;
}

/** A fixed set of options the user must choose from. */
export interface EnumInputField extends InputFieldBase {
  type: 'string';

  /**
   * The allowed values.
   * Rendered as either a dropdown (`select`) or a group of radio buttons.
   */
  enum: string[];

  /** Which GUI widget to render. */
  ui: 'select' | 'radio-group';

  /** Optional default selection (must be one of the `enum` values). */
  default?: string;
}

/** A list of items the user can select or build up. */
export interface ArrayInputField extends InputFieldBase {
  type: 'array';

  /** Item definition -- each item is a plain string or one of a fixed set. */
  items:
    | { type: 'string' }
    | { type: 'string'; enum: string[] };

  /** Which GUI widget to render. */
  ui: 'checkbox-group' | 'tag-input';

  /** Optional default selections. */
  default?: string[];
}

/** A numeric input with optional range constraints. */
export interface NumberInputField extends InputFieldBase {
  type: 'number';

  /** Minimum allowed value (inclusive). */
  min?: number;

  /** Maximum allowed value (inclusive). */
  max?: number;

  /**
   * Step granularity.
   * For example `0.01` for currency values or `1` for integers.
   */
  step?: number;

  /** Optional default value. */
  default?: number;
}

/** A boolean toggle or checkbox. */
export interface BooleanInputField extends InputFieldBase {
  type: 'boolean';

  /** Which GUI widget to render. */
  ui: 'checkbox' | 'toggle';

  /** Optional default value. */
  default?: boolean;
}

/**
 * Discriminated union of every supported input field type.
 * The `type` (and sometimes `ui`) property acts as the discriminant.
 */
export type SkillInputField =
  | FileInputField
  | FileArrayInputField
  | StringInputField
  | EnumInputField
  | ArrayInputField
  | NumberInputField
  | BooleanInputField;

// ---- Input Schema ----------------------------------------------------------

/**
 * JSON-Schema-like definition of the top-level input object,
 * extended with UI rendering hints per field.
 */
export interface SkillInputSchema {
  type: 'object';

  /** Each key is the field identifier used in the execution `inputs` record. */
  properties: Record<string, SkillInputField>;

  /**
   * Field identifiers that must be provided before running the skill.
   * This duplicates the per-field `required` flag but is kept for
   * compatibility with standard JSON Schema tooling.
   */
  required?: string[];
}

/** Wrapper around the input schema (allows future additions). */
export interface SkillInputs {
  schema: SkillInputSchema;
}

// ---- Outputs ---------------------------------------------------------------

/** A tabular result rendered in the GUI's data grid. */
export interface TableOutput {
  type: 'table';

  /**
   * Export formats the user can choose when saving or copying the table.
   * The GUI renders an export button for each format.
   */
  exportFormats: ('xlsx' | 'csv' | 'clipboard' | 'json')[];
}

/** A rich-text result rendered as Markdown. */
export interface MarkdownOutput {
  type: 'markdown';

  /** Label shown on the output tab or panel header. */
  label: string;
}

/**
 * A file produced by the skill (e.g. a generated PPTX or PDF).
 * The GUI shows a "Save" / "Open" button after execution.
 */
export interface FileOutput {
  type: 'file';

  /** Expected file extension (without dot), e.g. `"pptx"`, `"xlsx"`, `"pdf"`. */
  format: string;

  /** Label shown on the output tab or panel header. */
  label: string;

  /**
   * Directory path (relative to the configured output directory) where the
   * file will be saved.  May contain template tokens such as `{{date}}`.
   */
  saveTo: string;
}

/** Discriminated union of supported output types. */
export type SkillOutput = TableOutput | MarkdownOutput | FileOutput;

/** Describes what the skill produces. */
export interface SkillOutputs {
  /** The main output displayed by default when execution completes. */
  primary: SkillOutput;

  /**
   * An optional secondary output shown in a second tab or panel.
   * For example a table + a markdown summary.
   */
  secondary?: SkillOutput;
}

// ---- Permissions -----------------------------------------------------------

/**
 * Declares the capabilities the skill needs.
 * The Rust backend enforces these as a security sandbox.
 */
export interface SkillPermissions {
  /**
   * Glob patterns for files the skill is allowed to read.
   * Example: `["~/Documents/**\/*.pdf", "/tmp/skillkit/**"]`
   */
  fileRead: string[];

  /**
   * Glob patterns for files the skill is allowed to write.
   * Example: `["~/Documents/SkillKit Output/**"]`
   */
  fileWrite: string[];

  /**
   * Network access rules.
   * Use `["none"]` to deny all network access, or list allowed domains
   * (e.g. `["api.example.com", "cdn.example.com"]`).
   */
  network: string[];

  /**
   * Claude Code tool names the skill is permitted to invoke.
   * Example: `["Read", "Write", "Bash"]`
   */
  tools: string[];

  /**
   * Hard cap on the total number of tokens (input + output) a single
   * execution may consume.  Prevents runaway cost.
   */
  maxTokenBudget: number;
}

// ---- Pricing ---------------------------------------------------------------

/** Pricing metadata shown to the user before they run a skill. */
export interface SkillPricing {
  /** The minimum subscription tier required to run this skill. */
  tier: 'starter' | 'pro' | 'team' | 'enterprise';

  /**
   * Human-readable estimate of the Claude API cost per run.
   * Example: `"~$0.05"`, `"$0.10-$0.25"`
   */
  estimatedCostPerRun: string;
}

// ---- Requirements ----------------------------------------------------------

/** System requirements the host machine must satisfy. */
export interface SkillRequirements {
  /**
   * Semver range for the required Claude Code CLI version.
   * Example: `">=1.0.0"`, `"^1.2.0"`
   */
  claudeCode: string;

  /** Operating systems the skill supports. */
  os: ('macos' | 'windows' | 'linux')[];

  /**
   * Optional external dependencies (CLI tools, runtimes, etc.)
   * that must be present on PATH.
   * Example: `["python3", "pandoc"]`
   */
  dependencies?: string[];
}

// ---- Manifest (top-level) --------------------------------------------------

/**
 * The root shape of a `skillkit.json` file.
 *
 * Every skill package must include a manifest that describes how the skill
 * appears in the GUI, what inputs it accepts, what outputs it produces,
 * and what permissions it requires.
 */
export interface SkillManifest {
  /**
   * JSON Schema URL for editor auto-complete and validation.
   * Typically `"https://skillkit.dev/schemas/skillkit.schema.json"`.
   */
  $schema: string;

  /**
   * Manifest format version (not the skill's own version).
   * Currently `"1.0"`.
   */
  version: string;

  /** How the skill is displayed in the library and detail views. */
  display: SkillDisplay;

  /** The input form definition. */
  inputs: SkillInputs;

  /** What the skill produces on successful execution. */
  outputs: SkillOutputs;

  /** Security sandbox declarations. */
  permissions: SkillPermissions;

  /** Pricing and tier information. */
  pricing: SkillPricing;

  /** System requirements for running the skill. */
  requirements: SkillRequirements;
}
