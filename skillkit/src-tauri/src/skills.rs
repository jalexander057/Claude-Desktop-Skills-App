use crate::commands::{SkillDisplay, SkillInfo, SkillManifest, SkillPermissions};

/// Return a human-readable name for a given skill id.
pub fn get_skill_name(skill_id: &str) -> String {
    match skill_id {
        "pdf-financial-extractor" => "PDF Financial Extractor".to_string(),
        "excel-model-auditor" => "Excel Model Auditor".to_string(),
        "deal-deck-builder" => "Deal Deck Builder".to_string(),
        _ => skill_id.to_string(),
    }
}

/// For MVP, return the 3 bundled finance skills with hardcoded metadata.
/// In production this would scan a skills directory and parse skillkit.json files.
pub fn get_installed_skills() -> Result<Vec<SkillInfo>, Box<dyn std::error::Error>> {
    Ok(vec![
        SkillInfo {
            id: "pdf-financial-extractor".to_string(),
            name: "PDF Financial Extractor".to_string(),
            tagline: "Extract key metrics from financial PDFs into structured tables".to_string(),
            category: "Finance".to_string(),
            tags: vec![
                "pdf".into(),
                "financial-analysis".into(),
                "due-diligence".into(),
            ],
            version: "1.0.0".to_string(),
            last_run: None,
            run_count: 0,
        },
        SkillInfo {
            id: "excel-model-auditor".to_string(),
            name: "Excel Model Auditor".to_string(),
            tagline: "Audit financial models for errors, inconsistencies, and best practices"
                .to_string(),
            category: "Finance".to_string(),
            tags: vec![
                "excel".into(),
                "model-audit".into(),
                "quality-assurance".into(),
            ],
            version: "1.0.0".to_string(),
            last_run: None,
            run_count: 0,
        },
        SkillInfo {
            id: "deal-deck-builder".to_string(),
            name: "Deal Deck Builder".to_string(),
            tagline: "Generate investment committee decks from deal data".to_string(),
            category: "Finance".to_string(),
            tags: vec![
                "powerpoint".into(),
                "investment-committee".into(),
                "pe".into(),
            ],
            version: "1.0.0".to_string(),
            last_run: None,
            run_count: 0,
        },
    ])
}

/// Return the full manifest for a given skill.
pub fn get_manifest(skill_id: &str) -> Result<SkillManifest, Box<dyn std::error::Error>> {
    match skill_id {
        "pdf-financial-extractor" => Ok(SkillManifest {
            version: "1.0.0".to_string(),
            display: SkillDisplay {
                name: "PDF Financial Extractor".to_string(),
                tagline: "Extract key metrics from financial PDFs into structured tables"
                    .to_string(),
                icon: "file-text".to_string(),
                category: "Finance".to_string(),
                tags: vec![
                    "pdf".into(),
                    "financial-analysis".into(),
                    "due-diligence".into(),
                ],
            },
            inputs: serde_json::json!({
                "type": "object",
                "properties": {
                    "files": {
                        "type": "array",
                        "items": { "type": "file", "accept": [".pdf"] },
                        "title": "Financial Documents",
                        "description": "Upload one or more financial PDFs (10-Ks, pitch decks, CIMs)",
                        "minItems": 1,
                        "maxItems": 10,
                        "ui": "file-drop-zone"
                    },
                    "metrics": {
                        "type": "array",
                        "items": { "type": "string" },
                        "title": "Metrics to Extract",
                        "description": "Which financial metrics to look for",
                        "default": ["Revenue", "EBITDA", "Net Income", "Total Debt", "Cash"],
                        "ui": "tag-input"
                    },
                    "outputFormat": {
                        "type": "string",
                        "enum": ["table", "excel", "json"],
                        "title": "Output Format",
                        "default": "table",
                        "ui": "radio-group"
                    }
                },
                "required": ["files"]
            }),
            outputs: serde_json::json!({
                "primary": { "type": "table", "exportFormats": ["xlsx", "csv", "clipboard"] },
                "secondary": { "type": "markdown", "label": "Analysis Notes" }
            }),
            permissions: SkillPermissions {
                file_read: vec!["*.pdf".into()],
                file_write: vec!["~/Documents/SkillKit Output/**".into()],
                network: vec!["none".into()],
                tools: vec![
                    "Read".into(),
                    "Write".into(),
                    "Bash(python3 *)".into(),
                ],
                max_token_budget: 100_000,
            },
        }),

        "excel-model-auditor" => Ok(SkillManifest {
            version: "1.0.0".to_string(),
            display: SkillDisplay {
                name: "Excel Model Auditor".to_string(),
                tagline:
                    "Audit financial models for errors, inconsistencies, and best practices"
                        .to_string(),
                icon: "table-2".to_string(),
                category: "Finance".to_string(),
                tags: vec![
                    "excel".into(),
                    "model-audit".into(),
                    "quality-assurance".into(),
                ],
            },
            inputs: serde_json::json!({
                "type": "object",
                "properties": {
                    "file": {
                        "type": "file",
                        "accept": [".xlsx", ".xlsm"],
                        "title": "Excel Model",
                        "description": "The financial model to audit",
                        "ui": "file-picker"
                    },
                    "auditDepth": {
                        "type": "string",
                        "enum": ["Quick Scan", "Standard", "Deep Audit"],
                        "title": "Audit Depth",
                        "default": "Standard",
                        "ui": "radio-group"
                    },
                    "focusAreas": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["Formulas", "Assumptions", "Outputs", "Sensitivity Tables", "Debt Schedule", "DCF"]
                        },
                        "title": "Focus Areas",
                        "default": ["Formulas", "Assumptions", "Outputs"],
                        "ui": "checkbox-group"
                    }
                },
                "required": ["file"]
            }),
            outputs: serde_json::json!({
                "primary": { "type": "markdown", "label": "Audit Report" },
                "secondary": { "type": "table", "exportFormats": ["xlsx", "csv"] }
            }),
            permissions: SkillPermissions {
                file_read: vec!["*.xlsx".into(), "*.xlsm".into()],
                file_write: vec!["~/Documents/SkillKit Output/**".into()],
                network: vec!["none".into()],
                tools: vec![
                    "Read".into(),
                    "Write".into(),
                    "Bash(python3 *)".into(),
                ],
                max_token_budget: 150_000,
            },
        }),

        "deal-deck-builder" => Ok(SkillManifest {
            version: "1.0.0".to_string(),
            display: SkillDisplay {
                name: "Deal Deck Builder".to_string(),
                tagline: "Generate investment committee decks from deal data".to_string(),
                icon: "presentation".to_string(),
                category: "Finance".to_string(),
                tags: vec![
                    "powerpoint".into(),
                    "investment-committee".into(),
                    "pe".into(),
                ],
            },
            inputs: serde_json::json!({
                "type": "object",
                "properties": {
                    "financials": {
                        "type": "file",
                        "accept": [".xlsx", ".csv"],
                        "title": "Company Financials",
                        "description": "Excel file with historical financials",
                        "ui": "file-picker"
                    },
                    "cim": {
                        "type": "file",
                        "accept": [".pdf"],
                        "title": "CIM / Teaser (Optional)",
                        "description": "Confidential Information Memorandum",
                        "ui": "file-picker",
                        "required": false
                    },
                    "dealType": {
                        "type": "string",
                        "enum": ["LBO", "Growth Equity", "Add-on", "Recap"],
                        "title": "Deal Type",
                        "ui": "select"
                    },
                    "sections": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": [
                                "Executive Summary",
                                "Company Overview",
                                "Market Analysis",
                                "Financial Summary",
                                "Deal Structure",
                                "Returns Analysis",
                                "Key Risks",
                                "Appendix"
                            ]
                        },
                        "title": "Sections to Include",
                        "default": [
                            "Executive Summary",
                            "Company Overview",
                            "Financial Summary",
                            "Deal Structure",
                            "Returns Analysis",
                            "Key Risks"
                        ],
                        "ui": "checkbox-group"
                    },
                    "template": {
                        "type": "string",
                        "enum": ["Standard", "Minimalist", "Detailed"],
                        "title": "Deck Template",
                        "default": "Standard",
                        "ui": "radio-group"
                    }
                },
                "required": ["financials", "dealType"]
            }),
            outputs: serde_json::json!({
                "primary": {
                    "type": "file",
                    "format": "pptx",
                    "label": "Investment Committee Deck",
                    "saveTo": "~/Documents/SkillKit Output/"
                },
                "secondary": { "type": "markdown", "label": "Generation Notes" }
            }),
            permissions: SkillPermissions {
                file_read: vec!["*.xlsx".into(), "*.csv".into(), "*.pdf".into()],
                file_write: vec!["~/Documents/SkillKit Output/**".into()],
                network: vec!["none".into()],
                tools: vec![
                    "Read".into(),
                    "Write".into(),
                    "Bash(python3 *)".into(),
                ],
                max_token_budget: 200_000,
            },
        }),

        _ => Err(format!("Unknown skill: {}", skill_id).into()),
    }
}
