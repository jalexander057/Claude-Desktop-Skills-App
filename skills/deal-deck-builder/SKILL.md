---
name: Deal Deck Builder
description: Generate a formatted Investment Committee or deal discussion PowerPoint deck from financial data and optional CIM/teaser inputs.
allowed-tools: Read, Write, Bash(python3 *)
---

# Deal Deck Builder

You are a senior PE associate building an Investment Committee (IC) presentation deck. Your job is to read financial data from an Excel file (and optionally a CIM or teaser PDF), then generate a professional PowerPoint deck using python-pptx.

## Inputs

The user provides these via $ARGUMENTS:

- **financials_file**: Path to the Excel or CSV file containing company financials (required)
- **cim_file**: Optional path to a CIM, teaser, or company overview PDF
- **deal_type**: One of `lbo`, `growth_equity`, `add_on`, `recap`. Default: `lbo`.
- **sections**: List of sections to include. Options: `executive_summary`, `company_overview`, `market_analysis`, `financial_summary`, `deal_structure`, `returns_analysis`, `key_risks`, `appendix`. Default: all sections.
- **template_style**: One of `clean_dark` (dark headers, white body), `classic_white` (all white, navy accents), `modern_blue` (blue gradient headers). Default: `clean_dark`.
- **output_path**: Directory to write the .pptx file. Default: current working directory.
- **company_name**: Optional. If not provided, infer from the financials file or CIM.
- **deal_date**: Optional. Date for the presentation header. Default: today's date.

## Execution Steps

### Step 1: Read Financial Data

First, run a Python script to extract data from the financials Excel/CSV file:

```python
import openpyxl
import csv
import json
import sys
import os

def extract_financials(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    result = {"file": filepath, "sheets": {}}

    if ext == '.csv':
        with open(filepath, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
        result["sheets"]["Data"] = {
            "headers": rows[0] if rows else [],
            "data": rows[1:] if len(rows) > 1 else []
        }
    else:
        wb = openpyxl.load_workbook(filepath, data_only=True)
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            rows = []
            for row in ws.iter_rows(min_row=1, max_row=ws.max_row,
                                     max_col=ws.max_column, values_only=True):
                rows.append([str(c) if c is not None else "" for c in row])
            result["sheets"][sheet_name] = {
                "headers": rows[0] if rows else [],
                "data": rows[1:] if len(rows) > 1 else [],
                "max_row": ws.max_row,
                "max_col": ws.max_column
            }
        wb.close()

    return result

if __name__ == "__main__":
    data = extract_financials(sys.argv[1])
    print(json.dumps(data, indent=2, default=str))
```

Write this script to a temp file, execute it, and parse the JSON output.

### Step 2: Read CIM (if provided)

If a CIM or teaser PDF is provided, use the `Read` tool to read the PDF. Extract:
- Company description and history
- Products/services overview
- Market/industry context
- Competitive positioning
- Key customers and contracts
- Management team highlights
- Growth opportunities
- Any financial projections provided by management

### Step 3: Synthesize Data for Each Section

Map the extracted data to each requested slide section. For each section below, determine what data is available and what must be noted as "placeholder -- to be updated."

### Step 4: Generate the PowerPoint

Write and execute a Python script using python-pptx to build the deck. The script should be a single, self-contained Python file.

#### Slide Dimensions and Layout Constants

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.chart import XL_CHART_TYPE
from pptx.chart.data import CategoryChartData

# Widescreen 16:9
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)
```

#### Template Styles

Define three style palettes. The user selects one:

**clean_dark**:
- Header bar: dark navy (#1B2A4A) across top 1.2 inches
- Header text: white, Calibri 28pt bold
- Body background: white
- Body text: charcoal (#333333), Calibri 11pt
- Accent color: steel blue (#4472C4)
- Table header: dark navy bg, white text
- Table rows: alternating white / light gray (#F2F2F2)
- Footer: light gray bar with page number and date

**classic_white**:
- Header bar: white with navy (#1B2A4A) bottom border line
- Header text: navy, Calibri 28pt bold
- Body background: white
- Body text: dark gray (#404040), Calibri 11pt
- Accent color: navy (#1B2A4A)
- Table header: navy bg, white text
- Table rows: alternating white / very light blue (#EDF2F9)
- Footer: thin navy line with page number

**modern_blue**:
- Header bar: gradient blue (#2E5090 to #4472C4) across top 1.4 inches
- Header text: white, Calibri Light 30pt
- Body background: white
- Body text: dark slate (#2D2D2D), Calibri 11pt
- Accent color: bright blue (#4472C4)
- Secondary accent: teal (#00B0F0)
- Table header: blue gradient bg, white text
- Table rows: alternating white / light blue (#E9F0F9)
- Footer: blue accent line with page number

#### Section Slide Specifications

For EACH section, the Python script should generate one or more slides as specified below. Populate with real data wherever available; use clearly marked placeholders where data is missing.

---

**SLIDE: Title Slide**
Always include as the first slide.
- Company name (large, centered)
- Subtitle: "[Deal Type] Opportunity" (e.g., "LBO Opportunity", "Growth Equity Opportunity", "Add-On Acquisition Opportunity", "Recapitalization Opportunity")
- Date
- "CONFIDENTIAL" watermark in light gray
- Firm name placeholder: "[Firm Name]"

---

**SECTION: Executive Summary** (`executive_summary`)

One slide. This is the most important slide -- it should stand alone for a busy IC member.

Content layout: Left side (60% width) text, right side (40% width) key metrics box.

Left side -- 4-6 bullet points covering:
1. **Situation**: One line describing the opportunity. E.g., "Acquisition of [Company], a [description] business, from [Seller] for approximately $[X]M, representing [X.X]x LTM Adjusted EBITDA."
2. **Business**: What the company does, key value proposition, market position
3. **Financials**: LTM Revenue, EBITDA, growth trajectory in one sentence
4. **Thesis**: 2-3 key investment thesis points
5. **Returns**: Headline returns (e.g., "[X.X]x MOIC / [XX]% IRR over [X] years at base case")
6. **Key Risk**: Single most important risk factor and mitigant

Right side -- Key Metrics box (styled card):
- LTM Revenue: $[X]M
- LTM EBITDA: $[X]M
- EBITDA Margin: [X]%
- Entry Multiple: [X.X]x
- Total Leverage: [X.X]x
- Equity Check: $[X]M
- Target IRR: [X]% - [X]%
- Target MOIC: [X.X]x - [X.X]x

---

**SECTION: Company Overview** (`company_overview`)

Two slides.

Slide 1 -- Company Profile:
- Company name, headquarters, founding year, employee count
- Business description (2-3 sentences)
- Products/services breakdown (bullet list or small table)
- End markets served
- Key customers (if disclosed)
- Competitive advantages / moat

Slide 2 -- Management Team (if data available from CIM):
- Table: Name | Title | Years with Company | Background
- If no management data, create placeholder slide noting "Management section to be populated post-management meeting"

---

**SECTION: Market Analysis** (`market_analysis`)

One slide.

- Market size (TAM/SAM/SOM if available)
- Market growth rate
- Key market drivers (3-4 bullets)
- Competitive landscape: table or bullet list of top 3-5 competitors with approximate size/share if known
- Regulatory environment (if relevant)
- Source all market data; if not available from CIM, note "Market data to be sourced from [industry reports]"

---

**SECTION: Financial Summary** (`financial_summary`)

Two to three slides.

Slide 1 -- Historical P&L Summary Table:
| Metric | FY-3 | FY-2 | FY-1 | LTM |
|--------|------|------|------|-----|
| Revenue | | | | |
| YoY Growth | | | | |
| Gross Profit | | | | |
| Gross Margin % | | | | |
| EBITDA | | | | |
| EBITDA Margin % | | | | |
| Capex | | | | |
| Capex % Revenue | | | | |
| FCF | | | | |
| FCF Conversion (FCF/EBITDA) | | | | |

Populate from the extracted financials. Use consistent units (e.g., $M with 1 decimal).

Slide 2 -- Revenue & EBITDA Chart:
- Create a combination chart using python-pptx:
  - Clustered column chart for Revenue
  - Line chart overlay for EBITDA Margin %
  - X-axis: fiscal years
  - Left Y-axis: Revenue ($M)
  - Right Y-axis: EBITDA Margin (%)
- If chart creation is not feasible with the available data, create a placeholder text box: "[INSERT REVENUE / EBITDA CHART]"

Slide 3 (if sufficient data) -- Key Operating Metrics:
- Revenue by segment/product (if available)
- Customer concentration metrics
- Working capital trends
- Any other KPIs from the financials file

---

**SECTION: Deal Structure** (`deal_structure`)

One to two slides. Content varies by deal type:

**For LBO:**
Slide 1 -- Sources & Uses Table:

Sources side:
| Source | Amount ($M) | Multiple (x EBITDA) | % of Total |
|--------|------------|---------------------|------------|
| Revolver | | | |
| Term Loan A | | | |
| Term Loan B | | | |
| Senior Notes | | | |
| Mezzanine / Sub Debt | | | |
| Rollover Equity | | | |
| Sponsor Equity | | | |
| **Total Sources** | | | |

Uses side:
| Use | Amount ($M) | Multiple (x EBITDA) | % of Total |
|-----|------------|---------------------|------------|
| Enterprise Value | | | |
| Refinance Existing Debt | | | |
| Transaction Fees | | | |
| Financing Fees | | | |
| Cash to Balance Sheet | | | |
| **Total Uses** | | | |

Verify: Total Sources = Total Uses. If they don't balance, flag it prominently.

Key terms below the table:
- Entry EV/EBITDA multiple
- Total leverage at close
- Senior leverage at close
- Equity contribution %
- Minimum cash balance

**For Growth Equity:**
- Investment amount and instrument (preferred equity, convertible note, common equity)
- Pre-money and post-money valuation
- Ownership % acquired
- Key terms (liquidation preference, anti-dilution, board seats, protective provisions)
- Use of proceeds breakdown

**For Add-On:**
- Platform company overview (brief)
- Add-on purchase price and multiple
- Pro forma combined financials (Revenue, EBITDA)
- Expected synergies (cost and revenue) with timeline
- Incremental debt to fund acquisition
- Pro forma leverage

**For Recap:**
- Current capital structure vs. proposed capital structure (side by side table)
- Dividend / distribution to equity holders
- Remaining equity value
- Pro forma leverage
- Debt capacity analysis

---

**SECTION: Returns Analysis** (`returns_analysis`)

Two slides.

Slide 1 -- Base Case Returns:
- Entry assumptions: EV, EBITDA multiple, equity check
- Projection summary: Revenue and EBITDA growth trajectory (year by year for hold period)
- Exit assumptions: year, EBITDA, exit multiple
- Returns: IRR and MOIC

Layout: assumptions on left, projected financials table in center, returns callout on right.

Slide 2 -- Sensitivity Table:
- Create a 2D sensitivity matrix:
  - Rows: Exit multiples (e.g., 6.0x, 7.0x, 8.0x, 9.0x, 10.0x)
  - Columns: Exit years (e.g., Year 3, Year 4, Year 5)
  - Cell values: IRR / MOIC (e.g., "25% / 2.5x")
- Highlight the base case cell with the accent color
- Below the table, add a row showing implied exit EV for each scenario

If insufficient data for returns calculations, create the table structure with placeholder values and note: "Returns to be populated from financial model."

For growth equity deals, replace IRR/MOIC with:
- Gross IRR and Net IRR (after fees/carry)
- Gross MOIC and Net MOIC
- Cash-on-cash return at various exit valuations

---

**SECTION: Key Risks** (`key_risks`)

One slide.

Format: 2-column layout, 3-4 risks per column. For each risk:
- **Risk title** (bold, accent color)
- Risk description (1-2 sentences)
- Mitigant (1 sentence, prefixed with arrow or "Mitigant:")

Standard risk categories to consider (populate from CIM data or financials context):
1. Customer concentration risk
2. Revenue cyclicality / macro sensitivity
3. Key person / management risk
4. Competitive threats / margin pressure
5. Regulatory / compliance risk
6. Integration risk (for add-ons)
7. Leverage risk / debt service coverage
8. Working capital / liquidity risk
9. Technology disruption risk
10. ESG / environmental liability

Select the 6-8 most relevant risks based on the company and deal type. Do NOT use generic filler -- each risk should be specific to the company's situation based on available data.

---

**SECTION: Appendix** (`appendix`)

Two to three slides.

Slide 1 -- Detailed Historical Financials:
- Full income statement (as much detail as available)
- More periods than the summary slide if available

Slide 2 -- Balance Sheet Summary:
| Item | FY-2 | FY-1 | LTM |
|------|------|------|-----|
| Cash | | | |
| Accounts Receivable | | | |
| Inventory | | | |
| Other Current Assets | | | |
| Total Current Assets | | | |
| PP&E | | | |
| Goodwill & Intangibles | | | |
| Other Assets | | | |
| Total Assets | | | |
| [Liabilities section] | | | |
| [Equity section] | | | |

Slide 3 -- Comparable Companies / Transactions (placeholder):
- Table structure for comps with columns: Company | EV | Revenue | EBITDA | EV/Revenue | EV/EBITDA | Revenue Growth | EBITDA Margin
- Note: "Comparable company data to be populated from [Capital IQ / PitchBook]"

---

### Step 5: Build and Save the Presentation

The Python script should:

1. Create a new Presentation with 16:9 aspect ratio
2. Set slide dimensions to 13.333" x 7.5"
3. Build each slide using shapes, text frames, and tables (not slide layouts from a template, since we're creating from scratch)
4. Apply the selected style consistently
5. Add slide numbers to each slide (excluding title slide)
6. Add a "CONFIDENTIAL" text in the footer of every slide
7. Save to: `{output_path}/{company_name}_IC_Deck_{date}.pptx`

Important python-pptx notes:
- Use `Inches()` and `Pt()` for all measurements
- Set paragraph alignment with `PP_ALIGN`
- For tables, set cell margins, borders, and fill colors explicitly
- Charts require `CategoryChartData` -- populate from the extracted financials
- Text wrapping in table cells requires setting `word_wrap = True`
- For gradient effects, python-pptx has limited support -- use solid colors as fallback

### Step 6: Generate Companion Notes

After saving the .pptx file, write a markdown file (`{company_name}_deck_notes_{date}.md`) with:

1. **Generation Summary**: Which sections were generated, data completeness per section
2. **Data Gaps**: List of placeholders that need manual completion, organized by slide
3. **Data Sources**: Which values came from the financials file vs. the CIM vs. were left as placeholders
4. **Formatting Notes**: Any formatting limitations of python-pptx that the user should adjust manually (e.g., gradient headers rendered as solid, chart formatting limitations)
5. **Suggested Next Steps**:
   - "Update comparable companies table with current market data"
   - "Verify returns assumptions with deal team"
   - "Add management photos to Company Overview slide"
   - "Insert detailed org chart"
   - "Review risk section with operating partner"
   - Any other relevant action items

## IC Deck Quality Standards

Apply these standards -- this is what makes a good IC deck at a top PE fund:

### Content Standards
- Every number must have a source. No orphan statistics.
- Revenue and EBITDA should always be shown together with margins.
- Growth rates should be shown for all time-series data.
- The executive summary must be self-contained -- a busy partner should get the full story from that one slide.
- Risks must be specific, not generic. "Customer concentration" is not enough -- say "Top customer (Walmart) represents 35% of revenue; loss would reduce EBITDA by ~$12M."
- Returns should always show sensitivity to the 2-3 most impactful variables.

### Formatting Standards
- Maximum 6-8 bullets per slide. If more content is needed, use a second slide.
- Tables should never have more than 8 columns (readability constraint on projected screens).
- All dollar amounts in millions with 1 decimal place unless context requires more precision.
- Percentages to 1 decimal place.
- Multiples to 1 decimal place (e.g., 7.5x, not 7.53x).
- Consistent font sizing: slide titles 24-28pt, body text 11-14pt, table text 9-11pt, footnotes 8pt.
- Left-align text, right-align numbers in tables.
- Use the accent color sparingly for emphasis -- not for decoration.
- Every slide should have a clear takeaway. If a slide doesn't tell the reader something, cut it.
