mod claude;
mod commands;
mod db;
mod skills;

use commands::*;

pub struct AppState {
    pub db_path: std::sync::Mutex<std::path::PathBuf>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            use tauri::Manager;

            // Initialize database
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).ok();
            let db_path = app_data_dir.join("skillkit.db");
            db::initialize(&db_path).expect("failed to initialize database");

            // Store db path in app state
            app.manage(AppState {
                db_path: std::sync::Mutex::new(db_path),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_installed_skills,
            get_skill_manifest,
            run_skill,
            cancel_execution,
            get_execution_history,
            check_claude_code,
            get_app_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
