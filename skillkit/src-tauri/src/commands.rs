use crate::{claude, db, skills, AppState};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize, Clone)]
pub struct SkillInfo {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub category: String,
    pub tags: Vec<String>,
    pub version: String,
    pub last_run: Option<String>,
    pub run_count: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SkillManifest {
    pub version: String,
    pub display: SkillDisplay,
    pub inputs: serde_json::Value,
    pub outputs: serde_json::Value,
    pub permissions: SkillPermissions,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SkillDisplay {
    pub name: String,
    pub tagline: String,
    pub icon: String,
    pub category: String,
    pub tags: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SkillPermissions {
    pub file_read: Vec<String>,
    pub file_write: Vec<String>,
    pub network: Vec<String>,
    pub tools: Vec<String>,
    pub max_token_budget: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExecutionRecord {
    pub id: String,
    pub skill_id: String,
    pub skill_name: String,
    pub status: String,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub output: Option<String>,
    pub error: Option<String>,
    pub duration_ms: Option<u64>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ClaudeCodeStatus {
    pub installed: bool,
    pub version: Option<String>,
    pub authenticated: bool,
    pub path: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub claude_code_path: String,
    pub output_directory: String,
    pub theme: String,
}

// ── Tauri Commands ──────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_installed_skills(
    _state: State<'_, AppState>,
) -> Result<Vec<SkillInfo>, String> {
    skills::get_installed_skills().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_skill_manifest(skill_id: String) -> Result<SkillManifest, String> {
    skills::get_manifest(&skill_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn run_skill(
    skill_id: String,
    inputs: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<ExecutionRecord, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?.clone();
    let execution_id = uuid::Uuid::new_v4().to_string();
    let started_at = chrono::Utc::now().to_rfc3339();

    // Log execution start
    db::insert_execution(&db_path, &execution_id, &skill_id, &started_at)
        .map_err(|e| e.to_string())?;

    // Find claude path
    let claude_path = claude::find_claude_code()
        .map_err(|e| format!("Claude Code not found: {}", e))?;

    // Run the skill via Claude Code
    let result = claude::execute_skill(&claude_path, &skill_id, &inputs).await;

    let completed_at = chrono::Utc::now().to_rfc3339();
    let start_ts = chrono::DateTime::parse_from_rfc3339(&started_at)
        .unwrap()
        .timestamp_millis() as u64;
    let end_ts = chrono::DateTime::parse_from_rfc3339(&completed_at)
        .unwrap()
        .timestamp_millis() as u64;
    let duration_ms = end_ts.saturating_sub(start_ts);

    match result {
        Ok(output) => {
            db::update_execution(
                &db_path,
                &execution_id,
                "completed",
                Some(&output),
                None,
                duration_ms,
            )
            .map_err(|e| e.to_string())?;

            let skill_name = skills::get_skill_name(&skill_id);
            Ok(ExecutionRecord {
                id: execution_id,
                skill_id,
                skill_name,
                status: "completed".to_string(),
                started_at,
                completed_at: Some(completed_at),
                output: Some(output),
                error: None,
                duration_ms: Some(duration_ms),
            })
        }
        Err(e) => {
            let error_msg = e.to_string();
            db::update_execution(
                &db_path,
                &execution_id,
                "failed",
                None,
                Some(&error_msg),
                duration_ms,
            )
            .map_err(|e| e.to_string())?;

            let skill_name = skills::get_skill_name(&skill_id);
            Ok(ExecutionRecord {
                id: execution_id,
                skill_id,
                skill_name,
                status: "failed".to_string(),
                started_at,
                completed_at: Some(completed_at),
                output: None,
                error: Some(error_msg),
                duration_ms: Some(duration_ms),
            })
        }
    }
}

#[tauri::command]
pub async fn cancel_execution(_execution_id: String) -> Result<(), String> {
    // TODO: track running child processes and kill them on cancel
    Ok(())
}

#[tauri::command]
pub async fn get_execution_history(
    limit: Option<u32>,
    state: State<'_, AppState>,
) -> Result<Vec<ExecutionRecord>, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?.clone();
    db::get_executions(&db_path, limit.unwrap_or(50)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_claude_code() -> Result<ClaudeCodeStatus, String> {
    claude::check_status().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_app_config() -> Result<AppConfig, String> {
    Ok(AppConfig {
        claude_code_path: claude::find_claude_code().unwrap_or_default(),
        output_directory: dirs::document_dir()
            .unwrap_or_default()
            .join("SkillKit Output")
            .to_string_lossy()
            .to_string(),
        theme: "system".to_string(),
    })
}
