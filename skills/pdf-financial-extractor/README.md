# PDF Financial Extractor

## Overview

The PDF Financial Extractor skill reads one or more financial PDFs -- 10-Ks, CIMs, pitch decks, audited financials, credit agreements -- and extracts key financial metrics into a normalized, source-cited table.

## What It Does

- **Extracts** income statement, balance sheet, cash flow, credit, and operating metrics from financial documents
- **Normalizes** units (thousands/millions/billions), currencies, sign conventions, and fiscal year labels
- **Aligns** time periods across multiple documents, handling fiscal vs. calendar year differences and LTM calculations
- **Cites** every value with the source document and page number
- **Scores** each extraction with a confidence rating (High/Medium/Low) based on source reliability and ambiguity
- **Reconciles** overlapping data across documents, flagging discrepancies greater than 1%
- **Documents** all assumptions, EBITDA add-back bridges, missing data, and data quality warnings

## Use Cases

- Populating a CIM comp table from multiple 10-Ks
- Building an LBO model input sheet from a CIM and audited financials
- Comparing historical financials across a target and its peers
- Due diligence data extraction for IC memos

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Financial Documents | File drop (PDF) | Yes | 1-10 PDF files |
| Metrics to Extract | Tag input | No | Defaults to core PE metrics if omitted |
| Output Format | Radio group | Yes | Markdown table, CSV, or JSON |
| Time Periods | Text | No | Specific periods to focus on |

## Outputs

- **Primary**: Structured metrics table grouped by category with source citations and confidence scores
- **Secondary**: Markdown notes covering document summaries, EBITDA bridges, discrepancies, assumptions, and warnings

## Permissions

- Reads `.pdf` files provided by the user
- Writes output files (CSV/JSON) to the output directory
- No network access
- Uses Python 3 for CSV/JSON file generation
