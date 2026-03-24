# Excel Model Auditor

## Overview

The Excel Model Auditor skill reads an Excel financial model (.xlsx or .xlsm), parses its complete structure using openpyxl, and runs a comprehensive set of audit checks. It produces a Model Health Score (0-100) and a detailed findings report with cell-level references and fix suggestions.

## What It Does

- **Extracts** the full workbook structure: formulas, values, named ranges, cross-sheet references, cell formatting, and protection status
- **Detects** hardcoded values in formula rows -- the single most common source of model errors
- **Checks** formula consistency across time-series rows, flagging any cell whose formula pattern deviates from its neighbors
- **Finds** circular references and determines whether each is intentional (iterative calc) or accidental
- **Identifies** all Excel error cells (#REF!, #VALUE!, #N/A, #NAME?, #DIV/0!, #NULL!, #NUM!)
- **Audits** named ranges for broken references and unused definitions
- **Verifies** sign convention consistency across sheets
- **Checks** assumption cell hygiene (formatting, protection, centralization)
- **Validates** balance sheet balance and cash flow tie-out (deep audit)
- **Scans** for broken external links (deep audit)
- **Scores** the model on a 0-100 scale with qualitative labels

## Audit Depths

| Depth | Checks | Typical Time |
|-------|--------|-------------|
| Quick | Errors, hardcodes, basic formula consistency | ~30 seconds |
| Standard | Quick + cross-sheet refs, named ranges, circulars, sign conventions | ~2 minutes |
| Deep | Standard + BS balance, CF tie-out, external links, sensitivity checks | ~5 minutes |

## Domain Knowledge

The auditor understands PE/IB modeling conventions for:
- Three-statement models (IS, BS, CF linkages)
- LBO models (Sources = Uses, debt paydown, IRR calculations)
- DCF models (terminal value, WACC, discount conventions)
- Merger models (accretion/dilution, goodwill, synergies)

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Excel Model | File picker | Yes | Single .xlsx or .xlsm file |
| Audit Depth | Select | Yes | Quick, Standard, or Deep |
| Focus Areas | Checkbox group | No | Specific audit categories to emphasize |

## Outputs

- **Primary**: Markdown audit report with health score, categorized findings, model structure map, and remediation suggestions
- **Secondary**: Flat table of all findings, sortable by severity, sheet, and type

## Dependencies

- Python 3 with `openpyxl` package

## Permissions

- Reads `.xlsx` and `.xlsm` files provided by the user
- Writes audit report files to the output directory
- No network access
