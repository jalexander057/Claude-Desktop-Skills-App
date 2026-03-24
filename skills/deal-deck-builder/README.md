# Deal Deck Builder

## Overview

The Deal Deck Builder skill generates a professionally formatted Investment Committee (IC) PowerPoint presentation from company financials and optional CIM/teaser documents. It uses python-pptx to create a fully formatted .pptx file with data tables, charts, and consistent styling.

## What It Does

- **Reads** company financials from Excel or CSV files, extracting income statement, balance sheet, and cash flow data
- **Reads** optional CIM/teaser PDFs for qualitative content (company description, market analysis, management team, growth drivers)
- **Generates** a complete IC deck with up to 8 sections and 12+ slides
- **Formats** every slide with consistent professional styling (three template options)
- **Populates** tables and charts from real data wherever available
- **Marks** data gaps with clear placeholders so the deal team knows exactly what needs manual completion
- **Adapts** content structure based on deal type (LBO, Growth Equity, Add-On, Recap)

## Deck Sections

| Section | Slides | Content |
|---------|--------|---------|
| Executive Summary | 1 | Self-contained deal overview with key metrics sidebar |
| Company Overview | 2 | Company profile + management team |
| Market Analysis | 1 | Market size, growth, drivers, competitive landscape |
| Financial Summary | 2-3 | Historical P&L table, Revenue/EBITDA chart, operating metrics |
| Deal Structure | 1-2 | Sources & Uses, key terms, capital structure |
| Returns Analysis | 2 | Base case returns + IRR/MOIC sensitivity matrix |
| Key Risks | 1 | 6-8 specific risks with mitigants |
| Appendix | 2-3 | Detailed financials, balance sheet, comps placeholder |

## Template Styles

- **Clean Dark**: Dark navy header bars, white body, steel blue accents
- **Classic White**: All white with navy border accents, understated and traditional
- **Modern Blue**: Blue gradient headers, bright blue accents, contemporary feel

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Company Financials | File picker | Yes | .xlsx or .csv with financial data |
| CIM / Teaser | File picker | No | PDF for qualitative content |
| Deal Type | Select | Yes | LBO, Growth Equity, Add-On, or Recap |
| Sections | Checkbox group | No | Which deck sections to include |
| Template Style | Radio group | Yes | Visual style for the presentation |

## Outputs

- **Primary**: .pptx file -- a complete, formatted PowerPoint deck
- **Secondary**: Markdown generation notes listing data gaps, placeholders, formatting limitations, and suggested next steps

## Dependencies

- Python 3 with `openpyxl` and `python-pptx` packages

## Permissions

- Reads `.xlsx`, `.csv`, and `.pdf` files provided by the user
- Writes `.pptx` and `.md` output files to the output directory
- No network access

## Quality Standards

The generated deck follows top-tier PE fund IC presentation standards:
- Every number is sourced; no orphan statistics
- Executive summary is self-contained for time-pressed IC members
- Risk section uses company-specific risks, not generic filler
- Returns always include sensitivity analysis
- Maximum 6-8 bullets per slide for readability
- Consistent number formatting ($M to 1dp, percentages to 1dp, multiples to 1dp)
