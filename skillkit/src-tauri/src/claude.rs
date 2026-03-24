use serde_json::Value;
use std::process::Stdio;
use tokio::process::Command;

type BoxError = Box<dyn std::error::Error + Send + Sync>;

/// Search common locations for the `claude` CLI binary and return its path.
pub fn find_claude_code() -> Result<String, String> {
    let home = dirs::home_dir().ok_or_else(|| "No home directory".to_string())?;

    // Platform-specific search paths
    #[cfg(target_os = "windows")]
    {
        // 1. %APPDATA%\npm\claude.cmd (npm global install on Windows)
        if let Some(appdata) = std::env::var_os("APPDATA") {
            let npm_cmd = std::path::PathBuf::from(&appdata).join("npm").join("claude.cmd");
            if npm_cmd.exists() {
                return Ok(npm_cmd.to_string_lossy().to_string());
            }
        }

        // 2. %LOCALAPPDATA%\Programs\claude\claude.exe
        if let Some(localappdata) = std::env::var_os("LOCALAPPDATA") {
            let local_prog = std::path::PathBuf::from(&localappdata)
                .join("Programs")
                .join("claude")
                .join("claude.exe");
            if local_prog.exists() {
                return Ok(local_prog.to_string_lossy().to_string());
            }
        }

        // 3. ~/.local/bin/claude.exe
        let local_bin = home.join(".local").join("bin").join("claude.exe");
        if local_bin.exists() {
            return Ok(local_bin.to_string_lossy().to_string());
        }

        // 4. nvm-windows paths
        let nvm_home = home.join("AppData").join("Roaming").join("nvm");
        if nvm_home.exists() {
            if let Ok(entries) = std::fs::read_dir(&nvm_home) {
                for entry in entries.flatten() {
                    let claude_bin = entry.path().join("claude.cmd");
                    if claude_bin.exists() {
                        return Ok(claude_bin.to_string_lossy().to_string());
                    }
                }
            }
        }

        // 5. Fallback: `where claude`
        if let Ok(output) = std::process::Command::new("where").arg("claude").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !path.is_empty() {
                    return Ok(path);
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 1. ~/.local/bin/claude
        let local_bin = home.join(".local/bin/claude");
        if local_bin.exists() {
            return Ok(local_bin.to_string_lossy().to_string());
        }

        // 2. /usr/local/bin/claude
        let usr_local = std::path::PathBuf::from("/usr/local/bin/claude");
        if usr_local.exists() {
            return Ok(usr_local.to_string_lossy().to_string());
        }

        // 3. Common nvm managed global bin paths
        let npm_global = home.join(".nvm/versions/node");
        if npm_global.exists() {
            if let Ok(entries) = std::fs::read_dir(&npm_global) {
                for entry in entries.flatten() {
                    let claude_bin = entry.path().join("bin/claude");
                    if claude_bin.exists() {
                        return Ok(claude_bin.to_string_lossy().to_string());
                    }
                }
            }
        }

        // 4. Fallback: `which claude`
        if let Ok(output) = std::process::Command::new("which").arg("claude").output() {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() {
                    return Ok(path);
                }
            }
        }
    }

    Err("Claude Code CLI not found. Please install it first.".to_string())
}

/// Check whether Claude Code is installed and reachable.
pub async fn check_status() -> Result<crate::commands::ClaudeCodeStatus, BoxError> {
    let claude_path = match find_claude_code() {
        Ok(path) => path,
        Err(_) => {
            return Ok(crate::commands::ClaudeCodeStatus {
                installed: false,
                version: None,
                authenticated: false,
                path: None,
            })
        }
    };

    let output = Command::new(&claude_path)
        .arg("--version")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await?;

    let version = if output.status.success() {
        Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        None
    };

    Ok(crate::commands::ClaudeCodeStatus {
        installed: true,
        version,
        authenticated: true,
        path: Some(claude_path),
    })
}

/// Invoke a skill via the Claude Code CLI in non-interactive (--print) mode.
pub async fn execute_skill(
    claude_path: &str,
    skill_id: &str,
    inputs: &Value,
) -> Result<String, BoxError> {
    let args_json = serde_json::to_string(inputs)?;

    let prompt = format!(
        "Run the skill /{} with these inputs: {}",
        skill_id, args_json
    );

    let output = Command::new(claude_path)
        .arg("--print")
        .arg(&prompt)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Claude Code execution failed: {}", stderr).into())
    }
}
