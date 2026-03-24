use crate::commands::ExecutionRecord;
use rusqlite::{params, Connection};
use std::path::Path;

/// Create the database and tables if they do not already exist.
pub fn initialize(db_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let conn = Connection::open(db_path)?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS executions (
            id TEXT PRIMARY KEY,
            skill_id TEXT NOT NULL,
            skill_name TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'pending',
            inputs TEXT,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            output TEXT,
            error TEXT,
            duration_ms INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at DESC);
        ",
    )?;
    Ok(())
}

/// Record the start of a new execution.
pub fn insert_execution(
    db_path: &Path,
    id: &str,
    skill_id: &str,
    started_at: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "INSERT INTO executions (id, skill_id, skill_name, status, started_at) \
         VALUES (?1, ?2, ?2, 'running', ?3)",
        params![id, skill_id, started_at],
    )?;
    Ok(())
}

/// Update an existing execution with its final status and results.
pub fn update_execution(
    db_path: &Path,
    id: &str,
    status: &str,
    output: Option<&str>,
    error: Option<&str>,
    duration_ms: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let conn = Connection::open(db_path)?;
    let completed_at = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE executions \
         SET status = ?1, output = ?2, error = ?3, duration_ms = ?4, completed_at = ?5 \
         WHERE id = ?6",
        params![status, output, error, duration_ms as i64, completed_at, id],
    )?;
    Ok(())
}

/// Retrieve the most recent executions, up to `limit`.
pub fn get_executions(
    db_path: &Path,
    limit: u32,
) -> Result<Vec<ExecutionRecord>, Box<dyn std::error::Error>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT id, skill_id, skill_name, status, started_at, completed_at, \
                output, error, duration_ms \
         FROM executions \
         ORDER BY started_at DESC \
         LIMIT ?1",
    )?;

    let rows = stmt.query_map(params![limit], |row| {
        Ok(ExecutionRecord {
            id: row.get(0)?,
            skill_id: row.get(1)?,
            skill_name: row.get(2)?,
            status: row.get(3)?,
            started_at: row.get(4)?,
            completed_at: row.get(5)?,
            output: row.get(6)?,
            error: row.get(7)?,
            duration_ms: row.get::<_, Option<i64>>(8)?.map(|v| v as u64),
        })
    })?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row?);
    }
    Ok(results)
}
