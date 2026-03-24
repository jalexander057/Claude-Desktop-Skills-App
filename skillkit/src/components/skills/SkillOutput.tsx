import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import type { OutputDef } from '../../types/skill';

interface SkillOutputProps {
  output: string;
  outputDef?: OutputDef;
}

export function SkillOutput({ output, outputDef }: SkillOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportFormats =
    outputDef && outputDef.type === 'table' ? outputDef.exportFormats : [];

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Output</span>
        <div className="flex items-center gap-1.5">
          {exportFormats.length > 0 && (
            <div className="relative">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <RenderedMarkdown content={output} />
      </div>
    </div>
  );
}

function RenderedMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\|[\s-|]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(
        <MarkdownTable key={`table-${i}`} lines={tableLines} />
      );
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="mt-4 mb-2 text-sm font-semibold text-card-foreground">
          {line.slice(4)}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="mt-5 mb-2 text-base font-semibold text-card-foreground">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="mt-6 mb-3 text-lg font-bold text-card-foreground">
          {line.slice(2)}
        </h2>
      );
      i++;
      continue;
    }

    // Numbered list items
    if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="mt-1 text-sm text-card-foreground leading-relaxed">
          <InlineFormatted text={line} />
        </div>
      );
      i++;
      continue;
    }

    // Unordered list items
    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="mt-1 flex text-sm text-card-foreground leading-relaxed">
          <span className="mr-2 text-muted-foreground">-</span>
          <span><InlineFormatted text={line.slice(2)} /></span>
        </div>
      );
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={`code-${i}`}
          className="mt-2 mb-2 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="mt-1 text-sm text-card-foreground leading-relaxed">
        <InlineFormatted text={line} />
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}

function InlineFormatted({ text }: { text: string }) {
  // Process bold, inline code, and backtick-wrapped text
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Bold text
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch: { index: number; length: number; type: 'bold' | 'code'; content: string } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        type: 'bold',
        content: boldMatch[1],
      };
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (!firstMatch || codeMatch.index < firstMatch.index) {
        firstMatch = {
          index: codeMatch.index,
          length: codeMatch[0].length,
          type: 'code',
          content: codeMatch[1],
        };
      }
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    // Add text before the match
    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }

    if (firstMatch.type === 'bold') {
      parts.push(
        <strong key={keyIndex++} className="font-semibold">
          {firstMatch.content}
        </strong>
      );
    } else {
      parts.push(
        <code
          key={keyIndex++}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {firstMatch.content}
        </code>
      );
    }

    remaining = remaining.slice(firstMatch.index + firstMatch.length);
  }

  return <>{parts}</>;
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string): string[] =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

  if (lines.length < 2) return null;

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="mt-3 mb-3 overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={
                rowIdx % 2 === 0
                  ? 'bg-card'
                  : 'bg-muted/30'
              }
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-2 text-card-foreground"
                >
                  <InlineFormatted text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
