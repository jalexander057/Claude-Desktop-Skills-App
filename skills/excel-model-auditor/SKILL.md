---
name: Excel Model Auditor
description: Audit Excel financial models for errors, inconsistencies, and best practice violations. Generates a health score and detailed findings report.
allowed-tools: Read, Write, Bash(python3 *)
---

# Excel Model Auditor

You are an expert financial model auditor. Your job is to read an Excel workbook (.xlsx or .xlsm), systematically analyze its structure and formulas, and produce a detailed audit report with a Model Health Score.

## Inputs

The user provides these via $ARGUMENTS:

- **file**: Path to the Excel file (.xlsx or .xlsm)
- **audit_depth**: One of `quick`, `standard`, or `deep`. Default: `standard`.
  - **Quick**: Sheet structure, error cells, hardcoded values in formula rows, basic formula consistency. ~30 second analysis.
  - **Standard**: Everything in Quick, plus cross-sheet reference integrity, named range usage, sign convention checks, circular reference detection, assumption cell protection analysis.
  - **Deep**: Everything in Standard, plus formula-by-formula analysis of key sheets, balance sheet balance check, cash flow tie-out, sensitivity/scenario integrity, external link audit, timeline consistency, unit consistency analysis.
- **focus_areas**: Optional list of specific areas to emphasize. Options: `formulas`, `references`, `errors`, `assumptions`, `formatting`, `circulars`, `links`, `all`. Default: `all`.
- **output_path**: Directory to write the audit report. Default: current working directory.

## Execution Steps

### Step 1: Extract Workbook Structure with Python

Since you cannot read .xlsx files natively, you MUST first run a Python script to extract the workbook's structure. Run the following script via `Bash(python3 ...)`, adapting the file path from the input:

```python
import openpyxl
import json
import sys
import re
from openpyxl.utils import get_column_letter

def extract_workbook(filepath):
    wb = openpyxl.load_workbook(filepath, data_only=False)
    wb_values = openpyxl.load_workbook(filepath, data_only=True)

    result = {
        "file": filepath,
        "sheet_names": wb.sheetnames,
        "defined_names": {},
        "sheets": {},
        "external_links": [],
        "properties": {
            "creator": wb.properties.creator,
            "modified": str(wb.properties.modified) if wb.properties.modified else None,
            "last_modified_by": wb.properties.lastModifiedBy
        }
    }

    # Extract defined/named ranges
    for name in wb.defined_names.definedNameList:
        try:
            result["defined_names"][name.name] = {
                "value": name.attr_text,
                "scope": name.localSheetId
            }
        except:
            result["defined_names"][name.name] = {"value": str(name.attr_text), "scope": None}

    # Check for external links
    if hasattr(wb, '_external_links'):
        for link in wb._external_links:
            result["external_links"].append(str(link))

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        ws_values = wb_values[sheet_name]

        sheet_data = {
            "dimensions": ws.dimensions,
            "max_row": ws.max_row,
            "max_col": ws.max_column,
            "merged_cells": [str(m) for m in ws.merged_cells.ranges],
            "protection": {
                "sheet_protected": ws.protection.sheet,
                "password_set": ws.protection.password is not None and ws.protection.password != ''
            },
            "cells": []
        }

        for row in ws.iter_rows(min_row=1, max_row=min(ws.max_row, 500),
                                 min_col=1, max_col=min(ws.max_column, 50)):
            for cell in row:
                if cell.value is not None or cell.data_type == 'f':
                    cell_ref = f"{get_column_letter(cell.column)}{cell.row}"
                    val_cell = ws_values[cell_ref]

                    cell_info = {
                        "ref": cell_ref,
                        "row": cell.row,
                        "col": cell.column,
                        "type": cell.data_type,
                        "value": None,
                        "formula": None,
                        "computed_value": None,
                        "number_format": cell.number_format,
                        "font_bold": cell.font.bold if cell.font else False,
                        "font_color": str(cell.font.color.rgb) if cell.font and cell.font.color and cell.font.color.rgb else None,
                        "fill_color": str(cell.fill.start_color.rgb) if cell.fill and cell.fill.start_color and cell.fill.start_color.rgb else None,
                        "locked": cell.protection.locked if cell.protection else True,
                        "has_comment": cell.comment is not None
                    }

                    if cell.data_type == 'f':
                        cell_info["formula"] = str(cell.value)
                        try:
                            cell_info["computed_value"] = val_cell.value
                        except:
                            cell_info["computed_value"] = None
                    else:
                        cell_info["value"] = cell.value if not isinstance(cell.value, bytes) else str(cell.value)

                    # Detect if value looks like it could be an error
                    if isinstance(cell.value, str) and cell.value.startswith('#'):
                        cell_info["is_error"] = True

                    # Check computed value for errors
                    if isinstance(val_cell.value, str) and val_cell.value.startswith('#'):
                        cell_info["computed_value"] = val_cell.value
                        cell_info["is_error"] = True

                    sheet_data["cells"].append(cell_info)

        result["sheets"][sheet_name] = sheet_data

    wb.close()
    wb_values.close()
    return result

if __name__ == "__main__":
    filepath = sys.argv[1]
    data = extract_workbook(filepath)
    print(json.dumps(data, indent=2, default=str))
```

Write this script to a temporary file, then run it with the input file path. Capture the full JSON output.

If the file is very large (>500 rows or >50 columns on any sheet), the script limits extraction. Note this in the audit and flag that a Deep audit may be incomplete for very large models.

### Step 2: Parse and Catalog the Workbook

From the extracted JSON, build a mental model of the workbook:

1. **Sheet taxonomy**: Classify each sheet as one of:
   - **Inputs/Assumptions**: Contains mostly hardcoded values, often highlighted in blue or with a distinct background color
   - **Calculations/Engine**: Contains mostly formulas that reference other sheets
   - **Outputs/Presentation**: Summary sheets, formatted for printing or presenting
   - **Data/Reference**: Lookup tables, historical data, market data
   - **Dashboard/Chart**: Contains primarily charts or formatted output
   - **Scratch/Unused**: Appears empty or unused

2. **Model flow**: Map the directional flow of data (Inputs -> Calculations -> Outputs). Note any reverse references (outputs feeding back to inputs), which may indicate circular logic.

3. **Timeline identification**: Identify the model's time axis. Look for:
   - Date headers in rows (years, quarters, months)
   - The historical vs. projection boundary
   - Whether the model is annual, quarterly, or monthly

### Step 3: Run Audit Checks

#### 3A: Error Detection (all depths)

Scan all cells for Excel errors:
- `#REF!` -- Broken references (Critical). These mean a referenced cell/range was deleted.
- `#VALUE!` -- Type mismatch in formula (Critical). Often indicates a formula expecting a number but receiving text.
- `#N/A` -- Failed lookup (Warning or Critical depending on context). Check if it's in a VLOOKUP/INDEX-MATCH that should find a value.
- `#NAME?` -- Unrecognized formula name or named range (Critical). Often indicates a deleted named range or typo.
- `#DIV/0!` -- Division by zero (Warning). May be intentional for periods without data, but should use IFERROR.
- `#NULL!` -- Incorrect range intersection (Critical).
- `#NUM!` -- Invalid numeric result (Warning). Common in IRR calculations that don't converge.
- `#CIRCULAR` -- Circular reference detected (Critical if unintentional).

For each error, record: cell reference, sheet, formula, error type, and surrounding context.

#### 3B: Hardcoded Values in Formula Rows (all depths)

This is the #1 source of model errors. For each row that is predominantly formulas:
1. Identify any cells in that row that contain hardcoded values instead of formulas
2. Determine if the hardcode appears intentional (e.g., a starting balance, a stub period, a zero placeholder) or accidental (e.g., someone overwrote a formula with a pasted value)
3. Severity: **Critical** if it appears accidental (the cell should have a formula matching its neighbors), **Warning** if it could be intentional but is not documented

Heuristic for detection:
- If 80%+ of cells in a row (across the time axis) are formulas and a minority are hardcoded, flag the hardcoded ones.
- Exclude the first period (often a starting balance), clearly labeled "stub" periods, and cells containing zero.

#### 3C: Formula Consistency (all depths)

For each row spanning the time axis:
1. Extract the formula pattern (ignoring column offsets -- i.e., normalize `C5+C6` and `D5+D6` to the same pattern `[col]+[col+1]`)
2. Flag any cell in the row whose formula pattern differs from the majority
3. Common legitimate exceptions: first period (may use opening balance logic), last period (may have terminal value logic), transition periods
4. Severity: **Critical** if the formula is clearly wrong (e.g., referencing the wrong row), **Warning** if it's a structural difference that could be intentional

#### 3D: Cross-Sheet Reference Integrity (standard+)

1. For every formula that references another sheet, verify the target cell exists and contains data
2. Flag references to empty cells (Warning)
3. Flag references to cells that themselves contain errors (Critical -- error propagation)
4. Map all cross-sheet dependencies to detect unexpected reference patterns (e.g., an Output sheet being referenced by a Calculation sheet)

#### 3E: Named Range Audit (standard+)

1. List all defined names/named ranges
2. Identify named ranges that are never referenced in any formula (Info -- unused, should clean up)
3. Identify named ranges that reference `#REF!` or deleted ranges (Critical)
4. Check for confusingly similar names (e.g., "Revenue" vs "Revenue1" vs "Rev") (Info)
5. Verify named ranges point to the correct cells (if determinable from context)

#### 3F: Circular Reference Detection (standard+)

1. Build a dependency graph from the formula references
2. Detect any cycles in the graph
3. For each circular reference found:
   - Determine if it appears intentional (common in models with iterative calculations like interest on average debt balance, or tax-deductible interest affecting pre-tax income)
   - If intentional: verify Excel's iterative calculation would be needed (Warning -- document that iterative calc must be enabled)
   - If unintentional: (Critical -- will produce wrong results or #CIRCULAR errors)

#### 3G: Sign Convention Check (standard+)

Analyze the model's sign conventions for consistency:
1. Are expenses positive or negative? Check SG&A, COGS, D&A, Interest, Capex, Taxes
2. Is there a consistent convention across all sheets?
3. Flag cells where the sign appears inconsistent with the surrounding logic (e.g., Capex is positive on one sheet and negative on another, or subtracted in one formula and added in another)
4. Severity: **Warning** for inconsistency, **Critical** if it causes a demonstrable calculation error (e.g., Capex being added instead of subtracted in FCF)

#### 3H: Assumption Cell Protection (standard+)

1. Identify cells that appear to be key model assumptions (tax rate, discount rate, growth rates, WACC, exit multiples, etc.)
2. Check if these cells are:
   - Visually distinguished (colored background, typically blue font or yellow fill)
   - Protected / locked (if sheet protection is enabled)
   - Located on a dedicated assumptions sheet vs. scattered throughout
3. Flag unprotected/unformatted assumption cells as Info
4. Flag assumptions that are hardcoded inside formula sheets (not on the assumptions page) as Warning

#### 3I: Balance Sheet Balance Check (deep only)

1. Locate the balance sheet or statement of financial position
2. For each period, verify: Total Assets = Total Liabilities + Total Equity
3. Flag any imbalance (Critical). Note the magnitude of the imbalance.
4. If the model has a "plug" or balancing item (common in 3-statement models -- usually revolver or cash), verify it functions correctly

#### 3J: Cash Flow Tie-Out (deep only)

1. Verify: Beginning Cash + CFO + CFI + CFF = Ending Cash for each period
2. Check that Ending Cash on the cash flow statement equals Cash on the balance sheet
3. Flag any discrepancy (Critical)

#### 3K: External Link Audit (deep only)

1. List all external workbook references (formulas containing `[filename.xlsx]` or file paths)
2. For each external link:
   - Note the source workbook name
   - Flag if the link appears broken (referencing a file that likely doesn't exist in the current context) (Warning)
   - Recommend converting to static values or removing if the external source is not maintained

#### 3L: Sensitivity / Scenario Integrity (deep only)

1. If the model has scenarios or sensitivity tables (data tables, scenario manager, or manual toggle cells):
   - Verify that changing the toggle/input actually flows through to all relevant outputs
   - Check that sensitivity tables reference the correct input and output cells
2. Flag disconnected scenario logic (Warning)

### Step 4: Calculate Model Health Score

Compute a 0-100 score using this rubric:

**Start at 100. Deduct points as follows:**

| Issue Type | Deduction Per Instance | Max Deduction |
|-----------|----------------------|---------------|
| #REF! error | -5 | -25 |
| #VALUE! / #NAME? error | -3 | -15 |
| #N/A in lookup | -2 | -10 |
| #DIV/0! without IFERROR | -1 | -5 |
| Hardcoded in formula row (likely accidental) | -4 | -20 |
| Inconsistent formula in row | -3 | -15 |
| Circular reference (unintentional) | -10 | -20 |
| Circular reference (intentional, undocumented) | -2 | -5 |
| Broken named range | -5 | -15 |
| Balance sheet imbalance | -15 | -15 |
| Cash flow doesn't tie | -10 | -10 |
| Sign convention error causing calc error | -5 | -15 |
| Broken external link | -2 | -10 |

**Minimum score is 0.** Add a qualitative label:
- 90-100: Excellent -- model is clean and well-structured
- 75-89: Good -- minor issues to address
- 50-74: Fair -- several issues that could affect reliability
- 25-49: Poor -- significant structural problems
- 0-24: Critical -- model should not be relied upon without major remediation

### Step 5: Generate Audit Report

Write the audit report as a markdown file to the output path. Use the filename: `{model_name}_audit_{date}.md`

#### Report Structure:

```markdown
# Model Audit Report

**File**: [filename]
**Audit Date**: [date]
**Audit Depth**: [Quick/Standard/Deep]
**Sheets Analyzed**: [count]
**Cells Analyzed**: [count]

---

## Model Health Score: [XX] / 100 -- [Label]

[2-3 sentence executive summary of the model's overall quality]

---

## Critical Issues ([count])

Issues that will cause incorrect outputs or indicate broken logic.

### Issue 1: [Title]
- **Location**: Sheet '[name]', Cell [ref]
- **Type**: [Error type]
- **Description**: [What's wrong]
- **Impact**: [What effect this has on the model's outputs]
- **Suggested Fix**: [Specific recommendation]

[repeat for each critical issue]

---

## Warnings ([count])

Issues that may cause problems or indicate quality concerns.

[same format as critical issues]

---

## Informational Items ([count])

Style, best practice, and cleanup recommendations.

[same format, abbreviated]

---

## Model Structure Summary

### Sheet Map
| Sheet | Type | Rows Used | Cols Used | Formulas | Values | Errors |
|-------|------|-----------|-----------|----------|--------|--------|

### Data Flow
[Description of how data flows through the model: Inputs -> Calc -> Outputs]

### Named Ranges
| Name | References | Used In | Status |
|------|-----------|---------|--------|

---

## Detailed Findings Table

| # | Severity | Sheet | Cell | Type | Description | Fix |
|---|----------|-------|------|------|-------------|-----|

---

## Methodology Notes
[Brief description of checks performed and any limitations]
```

### Step 6: Generate Findings Table

In addition to the markdown report, generate a secondary table (also included in the report) listing every finding in a flat, sortable format. If the user requested CSV output, also write this as a CSV file.

## Financial Modeling Domain Knowledge

Apply these PE/IB modeling conventions when auditing:

### Three-Statement Model Checks
- Income Statement should flow: Revenue -> Gross Profit -> EBITDA -> EBIT -> EBT -> Net Income
- D&A should appear on both the income statement and as an add-back on the cash flow statement (and they should match)
- Changes in working capital on the cash flow statement should tie to balance sheet movements
- Interest expense should be calculable from average debt balances and stated rates
- Tax expense should be roughly Tax Rate x Pre-Tax Income (flag large discrepancies)

### LBO Model Checks
- Sources = Uses (to the penny)
- Entry equity = Uses minus debt at entry
- Exit equity = Enterprise Value at exit minus debt at exit
- IRR formula should reference the correct equity cash flows at the correct timing
- MOIC = Exit Equity / Entry Equity
- Check that debt paydown schedule is consistent with cash flow available for debt service
- Mandatory amortization should match credit agreement terms
- Cash sweep mechanics should be modeled correctly (% of excess cash flow, step-downs based on leverage)

### DCF Model Checks
- Terminal value methodology should be clearly identified (perpetuity growth or exit multiple)
- Discount rate should be applied correctly (mid-year vs. end-of-year convention)
- If WACC is used, verify it's calculated from market values (not book values) of debt and equity
- Free cash flow should be unlevered if using WACC, levered if using cost of equity
- Terminal value should not represent >75% of total enterprise value without a flag (common but worth noting)

### Merger Model Checks
- Accretion/dilution should be calculated on the correct share count (pro forma)
- Synergies should phase in over time, not appear at 100% in Year 1 (unless modeled that way intentionally)
- Transaction fees should be capitalized or expensed per accounting rules
- Goodwill calculation should tie: Purchase Price - Fair Value of Net Assets = Goodwill
