use serde::Serialize;
use sysinfo::{Components, System};


// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[derive(Serialize)]
pub struct SystemStats {
    pub cpu_usage_percent: f32,
    pub ram_used_mb: u64,
    pub ram_total_mb: u64,
    pub cpu_temp_celsius: Option<f32>,
}

#[tauri::command]
fn get_system_stats() -> SystemStats {
    let mut sys = System::new_all();
    sys.refresh_all();

    // CPU Usage: average across all logical cores
    // what does this do? I might not want that precise average.
    let cpu_usage = sys.cpus().iter().map(|c| c.cpu_usage()).sum::<f32>() 
        / sys.cpus().len() as f32;

    // RAM used:
    let ram_used_mb = sys.used_memory() / 1024 / 1024;
    let ram_total_mb = sys.total_memory() / 1024 / 1024;

    // CPU PECI temp -- look for a component whose label contains "PECI"
    let components = Components::new_with_refreshed_list();
    let cpu_temp = components
        .iter()
        .find(|c| c.label().to_uppercase().contains("PECI"))
        .map(|c| c.temperature());

    SystemStats {
        cpu_usage_percent: cpu_usage,
        ram_used_mb,
        ram_total_mb,
        cpu_temp_celsius: cpu_temp,
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_stats])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
