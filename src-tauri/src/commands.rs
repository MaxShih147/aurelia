use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
pub struct RecentFile {
    pub path: String,
    pub name: String,
    pub modified: u64,
}

/// Read a file's content as UTF-8 string
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Write content to a file (create or overwrite)
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

fn get_recent_files_path(app_handle: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    Ok(data_dir.join("recent_files.json"))
}

/// Get recent files list from app data directory
#[tauri::command]
pub fn get_recent_files(app_handle: tauri::AppHandle) -> Result<Vec<RecentFile>, String> {
    let recent_path = get_recent_files_path(&app_handle)?;

    if !recent_path.exists() {
        return Ok(vec![]);
    }

    let data = fs::read_to_string(&recent_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

/// Add a file to the recent files list (keep max 20)
#[tauri::command]
pub fn add_recent_file(app_handle: tauri::AppHandle, file: RecentFile) -> Result<(), String> {
    let recent_path = get_recent_files_path(&app_handle)?;

    if let Some(parent) = recent_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let mut files: Vec<RecentFile> = if recent_path.exists() {
        let data = fs::read_to_string(&recent_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    };

    // Remove duplicate, add to front, cap at 20
    files.retain(|f| f.path != file.path);
    files.insert(0, file);
    files.truncate(20);

    let json = serde_json::to_string_pretty(&files).map_err(|e| e.to_string())?;
    fs::write(&recent_path, json).map_err(|e| e.to_string())
}

/// Copy an image file to an assets/ directory next to the target file.
/// Returns the relative path to use in markdown.
#[tauri::command]
pub fn copy_image(source_path: String, target_dir: String) -> Result<String, String> {
    let source = Path::new(&source_path);
    let assets_dir = PathBuf::from(&target_dir).join("assets");

    fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;

    let filename = source
        .file_name()
        .ok_or("Invalid source filename")?
        .to_str()
        .ok_or("Invalid UTF-8 in filename")?
        .to_string();

    let dest = assets_dir.join(&filename);
    fs::copy(source, &dest).map_err(|e| e.to_string())?;

    Ok(format!("./assets/{}", filename))
}

/// Scan a directory for markdown files and return their paths.
#[tauri::command]
pub fn scan_markdown_files(dir: String) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    scan_dir_recursive(Path::new(&dir), &mut results)?;
    Ok(results)
}

fn scan_dir_recursive(dir: &Path, results: &mut Vec<String>) -> Result<(), String> {
    if !dir.is_dir() { return Ok(()); }
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            // Skip hidden directories and node_modules
            let name = path.file_name().unwrap_or_default().to_str().unwrap_or("");
            if !name.starts_with('.') && name != "node_modules" {
                scan_dir_recursive(&path, results)?;
            }
        } else if let Some(ext) = path.extension() {
            if ext == "md" || ext == "markdown" {
                if let Some(p) = path.to_str() {
                    results.push(p.to_string());
                }
            }
        }
    }
    Ok(())
}
