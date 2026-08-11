use serde::Serialize;
use std::sync::Mutex;
use sysinfo::{Components, System};

struct AppState {
    // STATE STORED: System and Components are heap-allocated here once at startup
    // and live for the entire lifetime of the app, owned by Tauri's state manager.
    // Mutex allows safe shared mutation across the main thread and command handler threads.
    sys: Mutex<System>,
    components: Mutex<Components>,
}
// STATE DESTROYED: When the Tauri app exits, it drops AppState, which drops both
// Mutex<System> and Mutex<Components>, freeing all their heap memory. Rust guarantees
// this via Drop — no manual cleanup needed, no leaks.

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
fn get_system_stats(state: tauri::State<AppState>) -> SystemStats {
    // STATE ACCESSED: Tauri injects the managed AppState here. `state` is a
    // reference-counted smart pointer to the AppState — nothing is cloned or moved.
    // It's released at the end of this function.

    let mut sys = state.sys.lock().unwrap();
    // STATE LOCKED: Acquires the Mutex on System for the duration of this function.
    // Blocks if another command handler is currently using it (unlikely at 1s intervals).

    // System::refresh_cpu_usage() — CHEAP.
    // Reads /proc/stat (Linux) or equivalent OS API (macOS/Windows).
    // Only updates CPU usage fields by diffing against the previous snapshot.
    // This is exactly what makes the per-second polling accurate and efficient.
    sys.refresh_cpu_usage();

    // System::refresh_memory() — CHEAP.
    // Reads a single memory info file/API (e.g. /proc/meminfo on Linux).
    // Only updates RAM fields — nothing else is touched.
    sys.refresh_memory();


    // Small note:
    // used_memory() / 1024 / 1024 produces MiB, not MB.
    // Field name ram_used_mb is technically off by ~5% at the gigabyte scale.
    // Cosmetic, but if a user ever cross-checks against Task Manager / Activity Monitor,
    // they'll see a small discrepancy.
    let cpu_usage = sys.cpus().iter().map(|c| c.cpu_usage()).sum::<f32>()
        / sys.cpus().len() as f32;
    let ram_used_mb = sys.used_memory() / 1024 / 1024;
    let ram_total_mb = sys.total_memory() / 1024 / 1024;
    // STATE RELEASED: sys MutexGuard drops here (end of its scope), unlocking
    // the Mutex so other threads can access System again.

    let mut components = state.components.lock().unwrap();
    // STATE LOCKED: Acquires the Mutex on Components.

    // Components::refresh(false) — CHEAP.
    // Reads current temperatures from existing component handles.
    // `false` means "don't scan for new components" — just update the ones
    // we already know about. Avoids re-enumerating the hardware sensor list.
    components.refresh();

    let cpu_temp = components
        .iter()
        .find(|c| c.label().to_uppercase().contains("PECI"))
        .map(|c| c.temperature());
    // STATE RELEASED: components MutexGuard drops here, unlocking the Mutex.

    SystemStats {
        cpu_usage_percent: cpu_usage,
        ram_used_mb,
        ram_total_mb,
        cpu_temp_celsius: cpu_temp,
    }
    // `state` smart pointer drops here — Tauri's internal ref count is decremented.
    // AppState itself is NOT dropped (other references still hold it alive).
}

#[tauri::command]
fn list_components(state: tauri::State<AppState>) -> Vec<String> {
    // STATE ACCESSED: Same Tauri-managed AppState injection as get_system_stats.

    let mut components = state.components.lock().unwrap();
    // STATE LOCKED: Acquires the Mutex on Components. Note this shares the same
    // Components instance as get_system_stats — they cannot run concurrently.

    // Components::refresh(false) — CHEAP. Same as above.
    components.refresh();

    let result = components
        .iter()
        .map(|c| format!("{}: {}°C", c.label(), c.temperature()))
        .collect();
    // STATE RELEASED: components MutexGuard drops here.

    result
    // `state` smart pointer drops here.
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // System::new_all() — EXPENSIVE. One-time cost at startup.
    // Enumerates all CPUs, processes, memory, disks, and networks.
    // Allocates internal data structures for all of them on the heap.
    // We pay this cost once so we never have to pay it again.
    let mut sys = System::new_all();

    // System::refresh_all() — EXPENSIVE. One-time cost at startup.
    // Populates every field in the System object with a full snapshot.
    // Critical for CPU accuracy: this establishes the baseline measurement
    // that the first refresh_cpu_usage() call will diff against.
    // Without this, the first poll returns 0% for all cores.
    sys.refresh_all();

    // Components::new_with_refreshed_list() — MODERATELY EXPENSIVE. One-time cost.
    // Enumerates all hardware sensors (thermal, fan, voltage) and takes
    // an initial reading from each. More expensive than refresh(false)
    // because it has to discover and open handles to each sensor.
    let components = Components::new_with_refreshed_list();

    tauri::Builder::default()
        // STATE STORED: AppState is moved into Tauri's state manager here.
        // Tauri wraps it in an Arc internally, giving each command handler
        // thread a reference to the same single instance.
        .manage(AppState {
            sys: Mutex::new(sys),
            components: Mutex::new(components),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_oauth::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_stats, list_components])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    // STATE DESTROYED: tauri::Builder and its managed state (including AppState)
    // are dropped here when run() returns, which only happens on app exit.
}
