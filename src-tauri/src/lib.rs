mod commands;

use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::write_file,
            commands::get_recent_files,
            commands::add_recent_file,
        ])
        .menu(|handle| {
            let new_file = MenuItemBuilder::with_id("new_file", "New")
                .accelerator("CmdOrCtrl+N")
                .build(handle)?;
            let open_file = MenuItemBuilder::with_id("open_file", "Open...")
                .accelerator("CmdOrCtrl+O")
                .build(handle)?;
            let save_file = MenuItemBuilder::with_id("save_file", "Save")
                .accelerator("CmdOrCtrl+S")
                .build(handle)?;
            let save_as = MenuItemBuilder::with_id("save_as", "Save As...")
                .accelerator("CmdOrCtrl+Shift+S")
                .build(handle)?;

            let file_menu = SubmenuBuilder::new(handle, "File")
                .item(&new_file)
                .item(&open_file)
                .separator()
                .item(&save_file)
                .item(&save_as)
                .separator()
                .close_window()
                .quit()
                .build()?;

            let edit_menu = SubmenuBuilder::new(handle, "Edit")
                .item(
                    &MenuItemBuilder::with_id("undo", "Undo")
                        .accelerator("CmdOrCtrl+Z")
                        .build(handle)?,
                )
                .item(
                    &MenuItemBuilder::with_id("redo", "Redo")
                        .accelerator("CmdOrCtrl+Shift+Z")
                        .build(handle)?,
                )
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .separator()
                .item(
                    &MenuItemBuilder::with_id("find", "Find & Replace")
                        .accelerator("CmdOrCtrl+F")
                        .build(handle)?,
                )
                .build()?;

            let view_menu = SubmenuBuilder::new(handle, "View")
                .item(
                    &MenuItemBuilder::with_id("toggle_sidebar", "Toggle Sidebar")
                        .accelerator("CmdOrCtrl+B")
                        .build(handle)?,
                )
                .item(
                    &MenuItemBuilder::with_id("toggle_preview", "Toggle Preview")
                        .accelerator("CmdOrCtrl+P")
                        .build(handle)?,
                )
                .item(
                    &MenuItemBuilder::with_id("command_palette", "Command Palette")
                        .accelerator("CmdOrCtrl+K")
                        .build(handle)?,
                )
                .build()?;

            MenuBuilder::new(handle)
                .item(&file_menu)
                .item(&edit_menu)
                .item(&view_menu)
                .build()
        })
        .on_menu_event(|app, event| {
            let id = event.id().0.as_str();
            app.emit("menu-event", id).ok();
        })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Aurelia");
}
