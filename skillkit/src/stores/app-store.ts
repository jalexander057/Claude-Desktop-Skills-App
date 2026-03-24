import { create } from 'zustand';
import type { InstalledSkill, SkillExecution } from '../types/skill';

export type AppView = 'library' | 'runner' | 'history' | 'settings';

interface AppState {
  // State
  skills: InstalledSkill[];
  currentView: AppView;
  selectedSkill: InstalledSkill | null;
  currentExecution: SkillExecution | null;
  executionHistory: SkillExecution[];
  claudeStatus: 'connected' | 'disconnected' | 'checking';

  // Actions
  selectSkill: (skill: InstalledSkill) => void;
  setView: (view: AppView) => void;
  startExecution: (skillId: string, inputs: Record<string, unknown>) => void;
  completeExecution: (output: string) => void;
  failExecution: (error: string) => void;
  cancelExecution: () => void;
  clearSelection: () => void;
}

const mockSkills: InstalledSkill[] = [
  {
    id: 'pdf-financial-extractor',
    version: '1.2.0',
    lastRun: '2026-03-22T14:30:00Z',
    runCount: 47,
    manifest: {
      version: '1.2.0',
      display: {
        name: 'PDF Financial Extractor',
        tagline: 'Extract financial data from PDFs into structured tables',
        icon: 'FileText',
        category: 'Data Extraction',
        tags: ['PDF', 'financials', 'tables', 'extraction'],
      },
      inputs: {
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'file',
              title: 'PDF Document',
              description: 'Upload the financial PDF to extract data from',
              accept: ['.pdf'],
              required: true,
            },
            extractionType: {
              type: 'string',
              title: 'Extraction Type',
              description: 'What type of financial data to extract',
              enum: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'All Statements'],
              ui: 'select',
              required: true,
            },
            outputFormat: {
              type: 'string',
              title: 'Output Format',
              description: 'How to format the extracted data',
              enum: ['markdown', 'csv', 'json'],
              ui: 'radio-group',
              default: 'markdown',
            },
            periods: {
              type: 'array',
              title: 'Reporting Periods',
              description: 'Select which periods to include',
              items: { type: 'string' },
              ui: 'checkbox-group',
              default: ['Annual', 'Q4'],
              enum: ['Annual', 'Q1', 'Q2', 'Q3', 'Q4'],
            } as InstalledSkill['manifest']['inputs']['schema']['properties'][string],
            notes: {
              type: 'string',
              title: 'Additional Instructions',
              description: 'Any specific instructions for extraction',
              placeholder: 'e.g., Focus on revenue line items only...',
            },
          },
          required: ['file', 'extractionType'],
        },
      },
      outputs: {
        primary: { type: 'table', exportFormats: ['csv', 'xlsx', 'json'] },
        secondary: { type: 'markdown', label: 'Analysis Notes' },
      },
      permissions: {
        fileRead: ['*.pdf'],
        fileWrite: ['*.csv', '*.xlsx', '*.json'],
        network: [],
        tools: ['Read', 'Bash'],
        maxTokenBudget: 50000,
      },
    },
  },
  {
    id: 'excel-model-auditor',
    version: '2.0.1',
    lastRun: '2026-03-21T09:15:00Z',
    runCount: 23,
    manifest: {
      version: '2.0.1',
      display: {
        name: 'Excel Model Auditor',
        tagline: 'Audit financial models for errors, circular refs, and best practices',
        icon: 'Table2',
        category: 'Model Review',
        tags: ['Excel', 'audit', 'model review', 'best practices'],
      },
      inputs: {
        schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              title: 'Excel Files',
              description: 'Upload one or more Excel files to audit',
              items: { type: 'file', accept: ['.xlsx', '.xls', '.xlsm'] },
              minItems: 1,
              maxItems: 5,
              required: true,
            },
            auditScope: {
              type: 'array',
              title: 'Audit Scope',
              description: 'Select which checks to run',
              items: { type: 'string' },
              ui: 'checkbox-group',
              default: ['Formula Errors', 'Circular References', 'Hard-coded Values'],
              enum: [
                'Formula Errors',
                'Circular References',
                'Hard-coded Values',
                'Inconsistent Formulas',
                'Named Ranges',
                'Sheet Protection',
                'Data Validation',
              ],
            } as InstalledSkill['manifest']['inputs']['schema']['properties'][string],
            severity: {
              type: 'string',
              title: 'Minimum Severity',
              description: 'Only report issues at or above this severity',
              enum: ['Info', 'Warning', 'Error', 'Critical'],
              ui: 'select',
              default: 'Warning',
            },
            tags: {
              type: 'array',
              title: 'Custom Tags',
              description: 'Tag this audit for organization',
              items: { type: 'string' },
              ui: 'tag-input',
              default: ['Q1-2026', 'model-review'],
            } as InstalledSkill['manifest']['inputs']['schema']['properties'][string],
          },
          required: ['files'],
        },
      },
      outputs: {
        primary: { type: 'markdown', label: 'Audit Report' },
        secondary: { type: 'table', exportFormats: ['csv', 'xlsx'] },
      },
      permissions: {
        fileRead: ['*.xlsx', '*.xls', '*.xlsm'],
        fileWrite: ['*.md', '*.csv'],
        network: [],
        tools: ['Read', 'Bash'],
        maxTokenBudget: 80000,
      },
    },
  },
  {
    id: 'deal-deck-builder',
    version: '1.0.0',
    lastRun: undefined,
    runCount: 8,
    manifest: {
      version: '1.0.0',
      display: {
        name: 'Deal Deck Builder',
        tagline: 'Generate investment committee decks from deal data and templates',
        icon: 'Presentation',
        category: 'Document Generation',
        tags: ['presentations', 'IC deck', 'deal memo', 'PowerPoint'],
      },
      inputs: {
        schema: {
          type: 'object',
          properties: {
            dealMemo: {
              type: 'file',
              title: 'Deal Memo / CIM',
              description: 'Upload the deal memo or CIM document',
              accept: ['.pdf', '.docx'],
              required: true,
            },
            template: {
              type: 'string',
              title: 'Deck Template',
              description: 'Choose a presentation template',
              enum: ['Standard IC Deck', 'Quarterly Update', 'Deal Screening', 'Portfolio Review'],
              ui: 'select',
              required: true,
            },
            financials: {
              type: 'file',
              title: 'Financial Model',
              description: 'Optional: attach the financial model for auto-population',
              accept: ['.xlsx', '.xls'],
            },
            sections: {
              type: 'array',
              title: 'Sections to Include',
              description: 'Select which sections to generate',
              items: { type: 'string' },
              ui: 'checkbox-group',
              default: ['Executive Summary', 'Company Overview', 'Financial Analysis', 'Risk Factors'],
              enum: [
                'Executive Summary',
                'Company Overview',
                'Market Analysis',
                'Financial Analysis',
                'Comparable Companies',
                'Risk Factors',
                'Investment Thesis',
                'Appendix',
              ],
            } as InstalledSkill['manifest']['inputs']['schema']['properties'][string],
            companyName: {
              type: 'string',
              title: 'Company Name',
              description: 'Target company name for the deck',
              placeholder: 'e.g., Acme Corp',
              required: true,
            },
            dealSize: {
              type: 'number',
              title: 'Deal Size ($M)',
              description: 'Transaction size in millions',
              min: 0,
              max: 100000,
            },
          },
          required: ['dealMemo', 'template', 'companyName'],
        },
      },
      outputs: {
        primary: { type: 'file', format: 'pptx', label: 'Investment Deck', saveTo: '~/Documents/SkillKit/decks/' },
        secondary: { type: 'markdown', label: 'Deck Summary' },
      },
      permissions: {
        fileRead: ['*.pdf', '*.docx', '*.xlsx', '*.xls'],
        fileWrite: ['*.pptx', '*.md'],
        network: [],
        tools: ['Read', 'Write', 'Bash'],
        maxTokenBudget: 120000,
      },
    },
  },
];

const mockHistory: SkillExecution[] = [
  {
    id: 'exec-001',
    skillId: 'pdf-financial-extractor',
    skillName: 'PDF Financial Extractor',
    status: 'completed',
    inputs: { file: '/documents/annual-report-2025.pdf', extractionType: 'Income Statement' },
    startedAt: '2026-03-22T14:30:00Z',
    completedAt: '2026-03-22T14:31:24Z',
    durationMs: 84000,
    output: '| Line Item | FY2024 | FY2025 | YoY Change |\n|---|---|---|---|\n| Revenue | $1,245M | $1,412M | +13.4% |\n| COGS | $623M | $692M | +11.1% |\n| Gross Profit | $622M | $720M | +15.8% |\n| Operating Expenses | $312M | $345M | +10.6% |\n| EBITDA | $310M | $375M | +21.0% |\n| Net Income | $198M | $247M | +24.7% |',
  },
  {
    id: 'exec-002',
    skillId: 'excel-model-auditor',
    skillName: 'Excel Model Auditor',
    status: 'completed',
    inputs: { files: ['/models/lbo-model-v3.xlsx'], auditScope: ['Formula Errors', 'Circular References'] },
    startedAt: '2026-03-21T09:15:00Z',
    completedAt: '2026-03-21T09:17:45Z',
    durationMs: 165000,
    output: '## Audit Report: lbo-model-v3.xlsx\n\n### Summary\n- **3 errors** found\n- **7 warnings** found\n- **12 info** items\n\n### Critical Issues\n1. **Circular Reference** in Sheet "DCF" cell E45 - references F45 which references E45\n2. **Hard-coded value** in Sheet "Assumptions" cell B12 - tax rate should reference input cell\n3. **Inconsistent formula** in Sheet "Revenue" row 15 - columns D-F use different formula pattern than C',
  },
  {
    id: 'exec-003',
    skillId: 'pdf-financial-extractor',
    skillName: 'PDF Financial Extractor',
    status: 'failed',
    inputs: { file: '/documents/corrupted-file.pdf', extractionType: 'Balance Sheet' },
    startedAt: '2026-03-20T16:45:00Z',
    completedAt: '2026-03-20T16:45:12Z',
    durationMs: 12000,
    error: 'Failed to parse PDF: file appears to be corrupted or password-protected',
  },
  {
    id: 'exec-004',
    skillId: 'deal-deck-builder',
    skillName: 'Deal Deck Builder',
    status: 'completed',
    inputs: { dealMemo: '/deals/acme-cim.pdf', template: 'Standard IC Deck', companyName: 'Acme Corp' },
    startedAt: '2026-03-19T11:00:00Z',
    completedAt: '2026-03-19T11:04:30Z',
    durationMs: 270000,
    output: '## Deal Deck Generated\n\nPresentation saved to `~/Documents/SkillKit/decks/acme-corp-ic-deck.pptx`\n\n**Sections generated:**\n- Executive Summary\n- Company Overview\n- Financial Analysis\n- Risk Factors\n\n**Pages:** 24\n**Charts:** 8\n**Tables:** 5',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  skills: mockSkills,
  currentView: 'library',
  selectedSkill: null,
  currentExecution: null,
  executionHistory: mockHistory,
  claudeStatus: 'connected',

  selectSkill: (skill) => {
    set({ selectedSkill: skill, currentView: 'runner', currentExecution: null });
  },

  setView: (view) => {
    set({ currentView: view });
    if (view !== 'runner') {
      set({ selectedSkill: null, currentExecution: null });
    }
  },

  clearSelection: () => {
    set({ selectedSkill: null, currentView: 'library', currentExecution: null });
  },

  startExecution: (skillId, inputs) => {
    const skill = get().skills.find((s) => s.id === skillId);
    if (!skill) return;

    const execution: SkillExecution = {
      id: `exec-${Date.now()}`,
      skillId,
      skillName: skill.manifest.display.name,
      status: 'running',
      inputs,
      startedAt: new Date().toISOString(),
    };

    set({ currentExecution: execution });

    // Simulate execution completing after 3 seconds
    setTimeout(() => {
      const state = get();
      if (state.currentExecution?.id === execution.id && state.currentExecution.status === 'running') {
        const completed: SkillExecution = {
          ...execution,
          status: 'completed',
          completedAt: new Date().toISOString(),
          durationMs: 3000,
          output: generateMockOutput(skillId),
        };
        set({
          currentExecution: completed,
          executionHistory: [completed, ...state.executionHistory],
          skills: state.skills.map((s) =>
            s.id === skillId
              ? { ...s, runCount: s.runCount + 1, lastRun: new Date().toISOString() }
              : s
          ),
        });
      }
    }, 3000);
  },

  completeExecution: (output) => {
    const state = get();
    if (!state.currentExecution) return;

    const completed: SkillExecution = {
      ...state.currentExecution,
      status: 'completed',
      completedAt: new Date().toISOString(),
      output,
      durationMs: Date.now() - new Date(state.currentExecution.startedAt).getTime(),
    };

    set({
      currentExecution: completed,
      executionHistory: [completed, ...state.executionHistory],
    });
  },

  failExecution: (error) => {
    const state = get();
    if (!state.currentExecution) return;

    const failed: SkillExecution = {
      ...state.currentExecution,
      status: 'failed',
      completedAt: new Date().toISOString(),
      error,
      durationMs: Date.now() - new Date(state.currentExecution.startedAt).getTime(),
    };

    set({
      currentExecution: failed,
      executionHistory: [failed, ...state.executionHistory],
    });
  },

  cancelExecution: () => {
    const state = get();
    if (!state.currentExecution) return;

    const cancelled: SkillExecution = {
      ...state.currentExecution,
      status: 'cancelled',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(state.currentExecution.startedAt).getTime(),
    };

    set({
      currentExecution: cancelled,
      executionHistory: [cancelled, ...state.executionHistory],
    });
  },
}));

function generateMockOutput(skillId: string): string {
  switch (skillId) {
    case 'pdf-financial-extractor':
      return `## Extracted Financial Data

| Line Item | FY2024 | FY2025 | YoY Change |
|---|---|---|---|
| Revenue | $2,450M | $2,812M | +14.8% |
| Cost of Revenue | $1,102M | $1,237M | +12.2% |
| Gross Profit | $1,348M | $1,575M | +16.8% |
| R&D Expenses | $245M | $281M | +14.7% |
| SG&A Expenses | $490M | $534M | +9.0% |
| Operating Income | $613M | $760M | +24.0% |
| EBITDA | $735M | $912M | +24.1% |
| Net Income | $428M | $547M | +27.8% |

### Key Observations
- Revenue growth accelerated from 11.2% in FY2023 to 14.8% in FY2025
- Gross margin expanded 120bps to 56.0%
- Operating leverage visible with SG&A growing slower than revenue
- Net income margin improved from 17.5% to 19.5%`;

    case 'excel-model-auditor':
      return `## Model Audit Report

### Summary
- **2 critical** issues found
- **5 warnings** found
- **8 informational** items

### Critical Issues

1. **Circular Reference** - Sheet "Returns" cell G23
   - Cell references H23, which references G23 through named range "IRR_Calc"
   - **Impact:** May cause incorrect IRR calculation
   - **Fix:** Break circular reference by using XIRR function instead

2. **Hard-coded Override** - Sheet "Assumptions" cell D15
   - Growth rate manually set to 8% instead of referencing scenario input
   - **Impact:** Scenario analysis will not reflect changes to growth assumptions
   - **Fix:** Replace with formula \`=Scenarios!B15\`

### Warnings

3. **Inconsistent Formula** - Sheet "P&L" row 24, columns E-H
4. **Missing Data Validation** - Sheet "Inputs" cells B5:B20
5. **Unprotected Input Cells** - Sheet "Assumptions" range A1:F50
6. **Unused Named Range** - "OldTaxRate" (references deleted sheet)
7. **Large File Size** - Model contains 12 hidden sheets with stale data`;

    case 'deal-deck-builder':
      return `## Deal Deck Generated Successfully

Presentation saved to \`~/Documents/SkillKit/decks/output-deck.pptx\`

### Deck Contents

| Section | Slides | Status |
|---|---|---|
| Title & Disclaimer | 2 | Complete |
| Executive Summary | 3 | Complete |
| Company Overview | 4 | Complete |
| Financial Analysis | 6 | Complete |
| Risk Factors | 3 | Complete |

**Total Slides:** 18
**Charts Generated:** 6
**Tables Generated:** 4

### Notes
- Financial charts auto-populated from provided model
- Comparable companies section skipped (not selected)
- Market analysis section skipped (not selected)`;

    default:
      return 'Execution completed successfully.';
  }
}
