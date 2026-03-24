import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  FolderOpen,
  Play,
  Loader2,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { SkillOutput } from './SkillOutput';
import { cn } from '../../lib/utils';
import type { InputField, InstalledSkill } from '../../types/skill';

export function SkillRunner() {
  const { selectedSkill, currentExecution, clearSelection, startExecution } =
    useAppStore();

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Initialize form with defaults
  useEffect(() => {
    if (!selectedSkill) return;

    const defaults: Record<string, unknown> = {};
    const { properties } = selectedSkill.manifest.inputs.schema;
    for (const [key, field] of Object.entries(properties)) {
      if (field.default !== undefined) {
        defaults[key] = field.default;
      }
    }
    setFormValues(defaults);
  }, [selectedSkill]);

  const updateField = useCallback((key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (!selectedSkill) return null;

  const { manifest } = selectedSkill;
  const { schema } = manifest.inputs;
  const requiredFields = schema.required || [];

  const isFormValid = requiredFields.every((key) => {
    const value = formValues[key];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  const isRunning = currentExecution?.status === 'running';
  const isComplete = currentExecution?.status === 'completed';
  const isFailed = currentExecution?.status === 'failed';

  const handleRun = () => {
    startExecution(selectedSkill.id, formValues);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={clearSelection}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </button>
        <h1 className="text-2xl font-semibold text-foreground">
          {manifest.display.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {manifest.display.tagline}
        </p>
      </div>

      {/* Form */}
      {!isComplete && !isFailed && (
        <div className="max-w-2xl space-y-5">
          {Object.entries(schema.properties).map(([key, field]) => (
            <FormField
              key={key}
              fieldKey={key}
              field={field}
              value={formValues[key]}
              onChange={(value) => updateField(key, value)}
              required={requiredFields.includes(key) || field.required === true}
              disabled={isRunning}
              skill={selectedSkill}
            />
          ))}

          {/* Run Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleRun}
              disabled={!isFormValid || isRunning}
              className="w-full max-w-xs gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Skill
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Running State */}
      {isRunning && currentExecution && (
        <div className="mt-6">
          <RunningIndicator startedAt={currentExecution.startedAt} />
        </div>
      )}

      {/* Output */}
      {isComplete && currentExecution?.output && (
        <div className="mt-6 max-w-4xl">
          <SkillOutput
            output={currentExecution.output}
            outputDef={manifest.outputs.primary}
          />
          <div className="mt-4">
            <Button variant="outline" onClick={clearSelection}>
              Run Another Skill
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {isFailed && currentExecution?.error && (
        <div className="mt-6 max-w-2xl">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Execution Failed
              </p>
              <p className="mt-1 text-sm text-destructive/80">
                {currentExecution.error}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearSelection}>
              Back to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RunningIndicator({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">Running...</p>
        <p className="text-xs text-muted-foreground">
          Elapsed: {elapsed}s
        </p>
      </div>
    </div>
  );
}

function FormField({
  fieldKey,
  field,
  value,
  onChange,
  required,
  disabled,
  skill,
}: {
  fieldKey: string;
  field: InputField;
  value: unknown;
  onChange: (value: unknown) => void;
  required: boolean;
  disabled: boolean;
  skill: InstalledSkill;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {field.title}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-muted-foreground">{field.description}</p>
      )}
      <FieldInput
        fieldKey={fieldKey}
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
        skill={skill}
      />
    </div>
  );
}

function FieldInput({
  fieldKey,
  field,
  value,
  onChange,
  disabled,
  skill: _skill,
}: {
  fieldKey: string;
  field: InputField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  skill: InstalledSkill;
}) {
  // File input
  if (field.type === 'file') {
    return (
      <FileDropZone
        value={value as string | undefined}
        onChange={onChange}
        accept={(field as { accept: string[] }).accept}
        disabled={disabled}
      />
    );
  }

  // Array of files
  if (field.type === 'array' && field.items.type === 'file') {
    return (
      <FileDropZone
        value={value as string | undefined}
        onChange={onChange}
        accept={field.items.accept || []}
        disabled={disabled}
        multiple
      />
    );
  }

  // String with enum - select dropdown
  if (field.type === 'string' && field.enum && field.ui === 'select') {
    return (
      <Select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select...</option>
        {field.enum.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    );
  }

  // String with enum - radio group
  if (field.type === 'string' && field.enum && field.ui === 'radio-group') {
    return (
      <div className="space-y-2">
        {field.enum.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2.5 text-sm"
          >
            <input
              type="radio"
              name={fieldKey}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              disabled={disabled}
              className="h-4 w-4 border-border text-primary focus:ring-ring"
            />
            <span className="text-card-foreground">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  // Array with enum - checkbox group
  if (field.type === 'array' && field.ui === 'checkbox-group') {
    const enumValues = (field as unknown as { enum: string[] }).enum || [];
    const selected = (value as string[]) || [];

    return (
      <div className="space-y-2">
        {enumValues.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2.5 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, opt]);
                } else {
                  onChange(selected.filter((v) => v !== opt));
                }
              }}
              disabled={disabled}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <span className="text-card-foreground">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  // Array - tag input
  if (field.type === 'array' && field.ui === 'tag-input') {
    return (
      <TagInput
        value={(value as string[]) || []}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  // Number input
  if (field.type === 'number') {
    return (
      <Input
        type="number"
        value={value !== undefined ? String(value) : ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        min={field.min}
        max={field.max}
        disabled={disabled}
      />
    );
  }

  // Boolean toggle
  if (field.type === 'boolean') {
    return (
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
        />
        <span className="text-sm text-card-foreground">{field.title}</span>
      </label>
    );
  }

  // Default: text input
  const placeholder =
    field.type === 'string' && 'placeholder' in field
      ? field.placeholder
      : undefined;

  return (
    <Input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function FileDropZone({
  value,
  onChange,
  accept,
  disabled,
  multiple,
}: {
  value: string | undefined;
  onChange: (value: unknown) => void;
  accept: string[];
  disabled: boolean;
  multiple?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const hasValue = value && value.length > 0;

  return (
    <div>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
      >
        <FolderOpen className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {multiple ? 'Drop files here or enter paths below' : 'Drop file here or enter path below'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Accepts: {accept.join(', ')}
        </p>
      </div>
      <div className="mt-2">
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter file path (${accept.join(', ')})`}
          disabled={disabled}
        />
      </div>
      {hasValue && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {(value as string).split('/').pop() || value}
            <button
              onClick={() => onChange('')}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}

function TagInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (value: unknown) => void;
  disabled: boolean;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="ml-0.5 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag..."
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="md"
          onClick={addTag}
          disabled={disabled || !inputValue.trim()}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
